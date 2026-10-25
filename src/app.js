/**
 * ClinicCare - Express Application Setup (src/app.js)
 * Configures middleware, static file serving, and REST API routes for doctors & appointments.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// Paths to data files
const DATA_DIR = path.join(__dirname, '../data');
const DOCTORS_FILE = path.join(DATA_DIR, 'doctors.json');
const APPOINTMENTS_FILE = path.join(DATA_DIR, 'appointments.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper functions to read and write JSON data safely
function readJson(filePath, defaultValue = []) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return defaultValue;
  }
}

function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err.message);
    return false;
  }
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files from the 'public' folder
app.use(express.static(path.join(__dirname, '../public')));

// -----------------------------------------------------------------------------
// REST API ROUTES
// -----------------------------------------------------------------------------

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    app: 'Clinic Appointment Booking System',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/doctors
 * Returns all available doctors
 */
app.get('/api/doctors', (req, res) => {
  const doctors = readJson(DOCTORS_FILE);
  res.status(200).json({
    success: true,
    count: doctors.length,
    doctors: doctors
  });
});

/**
 * GET /api/doctors/:id
 * Returns a specific doctor by ID
 */
app.get('/api/doctors/:id', (req, res) => {
  const doctors = readJson(DOCTORS_FILE);
  const doctor = doctors.find((d) => d.id === req.params.id);

  if (!doctor) {
    return res.status(404).json({ success: false, message: 'Doctor not found.' });
  }

  res.status(200).json({ success: true, doctor });
});

/**
 * GET /api/appointments
 * Returns all booked appointments
 */
app.get('/api/appointments', (req, res) => {
  const appointments = readJson(APPOINTMENTS_FILE);
  // Sort with newest on top
  const sorted = [...appointments].reverse();
  res.status(200).json({
    success: true,
    count: sorted.length,
    appointments: sorted
  });
});

/**
 * POST /api/appointments
 * Books a new appointment with validation and duplicate prevention
 */
app.post('/api/appointments', (req, res) => {
  const { patientName, phone, doctorId, date, time, reason, category } = req.body;

  // 1. Validate required fields
  if (!patientName || !phone || !doctorId || !date || !time || !reason) {
    return res.status(400).json({
      success: false,
      message: 'All fields (Patient Name, Phone, Doctor, Date, Time Slot, and Reason) are required.'
    });
  }

  // 2. Validate date format (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid date format. Expected YYYY-MM-DD.'
    });
  }

  // 3. Prevent past date booking
  const todayStr = new Date().toISOString().split('T')[0];
  if (date < todayStr) {
    return res.status(400).json({
      success: false,
      message: 'Cannot schedule appointments for past dates. Please pick today or a future date.'
    });
  }

  // 4. Verify doctor exists
  const doctors = readJson(DOCTORS_FILE);
  const doctor = doctors.find((d) => d.id === doctorId);
  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'The selected doctor was not found in the clinic directory.'
    });
  }

  // 5. Duplicate Booking Prevention (Same Doctor, Same Date, Same Time Slot)
  const appointments = readJson(APPOINTMENTS_FILE);
  const existingBooking = appointments.find(
    (app) =>
      app.doctorId === doctorId &&
      app.date === date &&
      app.time === time &&
      app.status !== 'Cancelled'
  );

  if (existingBooking) {
    return res.status(409).json({
      success: false,
      message: `${doctor.name} already has a confirmed appointment on ${date} at ${time}. Please choose another time slot or another doctor.`
    });
  }

  // 6. Calculate fee (with category discount)
  let calculatedFee = doctor.fee;
  if (category === 'senior') {
    calculatedFee = Math.round(doctor.fee * 0.85); // 15% discount
  } else if (category === 'student') {
    calculatedFee = Math.round(doctor.fee * 0.90); // 10% discount
  }

  // 7. Create new appointment object
  const newAppointment = {
    id: 'apt-' + Date.now().toString(36),
    patientName: patientName.trim(),
    phone: phone.trim(),
    doctorId: doctor.id,
    doctorName: doctor.name,
    specialization: doctor.specialization,
    date: date,
    time: time,
    fee: calculatedFee,
    reason: reason.trim(),
    status: 'Confirmed',
    createdAt: new Date().toISOString()
  };

  // 8. Save appointment to persistent storage
  appointments.push(newAppointment);
  writeJson(APPOINTMENTS_FILE, appointments);

  console.log(`[BOOKING] #${newAppointment.id} confirmed: ${newAppointment.patientName} with ${newAppointment.doctorName} on ${date} at ${time}`);

  return res.status(201).json({
    success: true,
    message: 'Appointment booked successfully!',
    appointment: newAppointment
  });
});

/**
 * POST /api/appointments/:id/cancel
 * Cancels a booked appointment
 */
app.post('/api/appointments/:id/cancel', (req, res) => {
  const { id } = req.params;
  const appointments = readJson(APPOINTMENTS_FILE);
  const appointmentIndex = appointments.findIndex((a) => a.id === id);

  if (appointmentIndex === -1) {
    return res.status(404).json({
      success: false,
      message: `Appointment #${id} not found.`
    });
  }

  if (appointments[appointmentIndex].status === 'Cancelled') {
    return res.status(400).json({
      success: false,
      message: `Appointment #${id} is already cancelled.`
    });
  }

  // Update status to Cancelled
  appointments[appointmentIndex].status = 'Cancelled';
  appointments[appointmentIndex].cancelledAt = new Date().toISOString();
  writeJson(APPOINTMENTS_FILE, appointments);

  console.log(`[CANCELLATION] #${id} cancelled.`);

  return res.status(200).json({
    success: true,
    message: `Appointment #${id} cancelled successfully.`,
    appointment: appointments[appointmentIndex]
  });
});

// Fallback for unmatched API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

module.exports = app;
