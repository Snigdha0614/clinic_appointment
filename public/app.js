/**
 * ClinicCare - Frontend Browser Application (public/app.js)
 * Handles doctor listing, dynamic fee calculations, appointment booking,
 * client-side validations, real-time alerts, and appointment cancellations.
 */

// Global state in browser memory
let doctorsList = [];
let appointmentsList = [];

// DOM Elements
const alertContainer = document.getElementById('alertContainer');
const doctorsListContainer = document.getElementById('doctorsList');
const appointmentForm = document.getElementById('appointmentForm');
const doctorSelect = document.getElementById('doctorSelect');
const appointmentDateInput = document.getElementById('appointmentDate');
const appointmentTimeSelect = document.getElementById('appointmentTime');
const patientCategorySelect = document.getElementById('patientCategory');
const feeBreakdownNote = document.getElementById('feeBreakdownNote');
const totalFeeAmount = document.getElementById('totalFeeAmount');
const appointmentsTableBody = document.getElementById('appointmentsTableBody');
const appointmentCountBadge = document.getElementById('appointmentCountBadge');
const refreshAppointmentsBtn = document.getElementById('refreshAppointmentsBtn');

// Modal Elements
const slipModal = document.getElementById('slipModal');
const closeSlipBtn = document.getElementById('closeSlipBtn');
const dismissSlipBtn = document.getElementById('dismissSlipBtn');
const printSlipBtn = document.getElementById('printSlipBtn');

/**
 * 1. Initialize Application on DOM Ready
 */
document.addEventListener('DOMContentLoaded', () => {
  setupDateLimits();
  populateTimeSlots();
  loadDoctors();
  loadAppointments();
  setupEventListeners();

  // Set current year in footer
  const yearSpan = document.getElementById('currentYear');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();
});

/**
 * 2. Setup minimum date constraint (Prevent Past Dates)
 */
function setupDateLimits() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  // Enforce HTML5 min attribute on date picker
  if (appointmentDateInput) {
    appointmentDateInput.min = todayStr;
    // Default to tomorrow's date for convenience
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomYyyy = tomorrow.getFullYear();
    const tomMm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const tomDd = String(tomorrow.getDate()).padStart(2, '0');
    appointmentDateInput.value = `${tomYyyy}-${tomMm}-${tomDd}`;
  }
}

/**
 * 3. Populate Time Slots dropdown from types.js
 */
function populateTimeSlots() {
  if (!appointmentTimeSelect) return;
  appointmentTimeSelect.innerHTML = '<option value="">-- Choose Time Slot --</option>';

  const slots = (typeof TimeSlots !== 'undefined' && TimeSlots.length > 0)
    ? TimeSlots
    : [
        '09:00 AM - 09:30 AM',
        '09:30 AM - 10:00 AM',
        '10:00 AM - 10:30 AM',
        '10:30 AM - 11:00 AM',
        '11:00 AM - 11:30 AM',
        '11:30 AM - 12:00 PM',
        '02:00 PM - 02:30 PM',
        '02:30 PM - 03:00 PM',
        '03:00 PM - 03:30 PM',
        '03:30 PM - 04:00 PM'
      ];

  slots.forEach((slot) => {
    const opt = document.createElement('option');
    opt.value = slot;
    opt.textContent = slot;
    appointmentTimeSelect.appendChild(opt);
  });
}

/**
 * 4. Fetch and Render Available Doctors from Express API
 */
async function loadDoctors() {
  try {
    const res = await fetch('/api/doctors');
    if (!res.ok) throw new Error('Failed to load doctors list from server.');
    const data = await res.json();
    doctorsList = data.doctors || [];

    renderDoctorCards(doctorsList);
    populateDoctorSelect(doctorsList);
  } catch (err) {
    console.error('loadDoctors error:', err);
    showAlert('Error loading doctors directory: ' + err.message, 'error');
    if (doctorsListContainer) {
      doctorsListContainer.innerHTML = '<p style="color: #dc2626; text-align: center; grid-column: 1/-1;">Could not connect to backend server. Make sure server.js is running.</p>';
    }
  }
}

/**
 * Render Doctors Cards into the DOM
 */
function renderDoctorCards(doctors) {
  if (!doctorsListContainer) return;
  doctorsListContainer.innerHTML = '';

  if (doctors.length === 0) {
    doctorsListContainer.innerHTML = '<p style="text-align: center; color: #64748b; grid-column: 1/-1;">No doctors available at this time.</p>';
    return;
  }

  doctors.forEach((doc) => {
    const card = document.createElement('div');
    card.className = 'doctor-card';
    card.innerHTML = `
      <div class="doctor-card-top">
        <img src="${doc.image}" alt="${doc.name}" class="doctor-img" onerror="this.src='https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop'">
        <div class="doctor-info">
          <h4>${doc.name}</h4>
          <span class="doctor-spec">${doc.specialization}</span>
          <div class="doctor-qual">${doc.qualifications}</div>
        </div>
      </div>
      <div class="doctor-details-row">
        <div>
          <span class="detail-label">Experience</span>
          <span class="detail-value">${doc.experience}</span>
        </div>
        <div>
          <span class="detail-label">Available Days</span>
          <span class="detail-value" style="font-size: 0.8rem;">${doc.availableDays ? doc.availableDays.slice(0, 3).join(', ') + '...' : 'Mon - Fri'}</span>
        </div>
        <div style="text-align: right;">
          <span class="detail-label">Consultation Fee</span>
          <span class="detail-value" style="color: #0284c7; font-size: 1.05rem;">$${doc.fee}</span>
        </div>
      </div>
      <div class="doctor-card-bottom">
        <button type="button" class="btn-select-doctor" onclick="preselectDoctor('${doc.id}')">
          📅 Book Appointment
        </button>
      </div>
    `;
    doctorsListContainer.appendChild(card);
  });
}

/**
 * Populate the select dropdown with doctors
 */
function populateDoctorSelect(doctors) {
  if (!doctorSelect) return;
  doctorSelect.innerHTML = '<option value="">-- Choose a Doctor --</option>';

  doctors.forEach((doc) => {
    const opt = document.createElement('option');
    opt.value = doc.id;
    opt.textContent = `${doc.name} (${doc.specialization}) - $${doc.fee}`;
    doctorSelect.appendChild(opt);
  });
}

/**
 * Pre-select doctor from doctor card button and scroll to form
 */
window.preselectDoctor = function (doctorId) {
  if (doctorSelect) {
    doctorSelect.value = doctorId;
    updateFeeEstimate();
  }
  const bookSection = document.getElementById('book');
  if (bookSection) {
    bookSection.scrollIntoView({ behavior: 'smooth' });
  }
};

/**
 * 5. Dynamic Fee Calculation using calculator.js
 */
function updateFeeEstimate() {
  const selectedDocId = doctorSelect ? doctorSelect.value : '';
  const categoryId = patientCategorySelect ? patientCategorySelect.value : 'regular';

  if (!selectedDocId) {
    if (totalFeeAmount) totalFeeAmount.textContent = '$0.00';
    if (feeBreakdownNote) feeBreakdownNote.textContent = 'Select a doctor to calculate the fee';
    return;
  }

  const doctor = doctorsList.find((d) => d.id === selectedDocId);
  if (!doctor) return;

  // Use calculator.js if loaded
  if (typeof ClinicCalculator !== 'undefined') {
    const estimate = ClinicCalculator.calculateFee(doctor.fee, 'in_person', categoryId);
    if (totalFeeAmount) totalFeeAmount.textContent = estimate.formattedTotal;
    if (feeBreakdownNote) {
      if (estimate.discountAmount > 0) {
        feeBreakdownNote.textContent = `Base fee: $${estimate.baseFee} - ${estimate.discountPercent}% Category Discount (-$${estimate.discountAmount})`;
      } else {
        feeBreakdownNote.textContent = `Standard consultation fee for ${doctor.name}`;
      }
    }
  } else {
    // Fallback if calculator.js isn't available
    if (totalFeeAmount) totalFeeAmount.textContent = `$${doctor.fee}.00`;
    if (feeBreakdownNote) feeBreakdownNote.textContent = `Consultation with ${doctor.name}`;
  }
}

/**
 * 6. Fetch and Render Booked Appointments Table
 */
async function loadAppointments() {
  try {
    const res = await fetch('/api/appointments');
    if (!res.ok) throw new Error('Failed to fetch appointments.');
    const data = await res.json();
    appointmentsList = data.appointments || [];

    renderAppointmentsTable(appointmentsList);
  } catch (err) {
    console.error('loadAppointments error:', err);
    if (appointmentsTableBody) {
      appointmentsTableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; color: #dc2626; padding: 20px;">
            Unable to load appointments from server. Please refresh.
          </td>
        </tr>
      `;
    }
  }
}

/**
 * Render the appointment rows into the HTML table
 */
function renderAppointmentsTable(appointments) {
  if (!appointmentsTableBody) return;
  appointmentsTableBody.innerHTML = '';

  if (appointmentCountBadge) {
    appointmentCountBadge.textContent = `${appointments.length} Booking${appointments.length === 1 ? '' : 's'}`;
  }

  if (appointments.length === 0) {
    appointmentsTableBody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="table-empty-state">
            <div class="empty-icon">📅</div>
            <h4>No Bookings Found</h4>
            <p>You have not booked any clinic appointments yet. Fill out the form above to book a doctor.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  appointments.forEach((app) => {
    const tr = document.createElement('tr');

    const statusBadgeClass =
      app.status === 'Confirmed'
        ? 'badge-confirmed'
        : app.status === 'Cancelled'
        ? 'badge-cancelled'
        : 'badge-completed';

    const isCancelled = app.status === 'Cancelled';

    tr.innerHTML = `
      <td>
        <span class="patient-name-cell">${escapeHtml(app.patientName)}</span>
        <span class="patient-phone-sub">📞 ${escapeHtml(app.phone)}</span>
      </td>
      <td>
        <span class="doctor-cell">${escapeHtml(app.doctorName)}</span>
        <span class="doctor-spec-sub">${escapeHtml(app.specialization || '')}</span>
      </td>
      <td>
        <span class="date-cell">${escapeHtml(app.date)}</span>
      </td>
      <td>
        <span class="time-cell">🕒 ${escapeHtml(app.time)}</span>
      </td>
      <td style="max-width: 220px; font-size: 0.8rem; color: #475569;">
        ${escapeHtml(app.reason || 'General checkup')}
      </td>
      <td style="font-weight: 700; color: #0284c7;">
        $${app.fee}
      </td>
      <td>
        <span class="badge ${statusBadgeClass}">${app.status}</span>
      </td>
      <td style="text-align: right; white-space: nowrap;">
        <button
          type="button"
          class="btn-action-print"
          title="Print official appointment confirmation slip"
          onclick="openSlipModal('${app.id}')"
        >
          Slip
        </button>
        ${
          !isCancelled
            ? `<button
                type="button"
                class="btn-action-cancel"
                onclick="cancelAppointment('${app.id}')"
              >
                Cancel
              </button>`
            : `<span style="font-size: 0.75rem; color: #94a3b8; margin-left: 8px;">Cancelled</span>`
        }
      </td>
    `;
    appointmentsTableBody.appendChild(tr);
  });
}

/**
 * 7. Handle Appointment Booking Form Submission
 */
async function handleBookingSubmit(e) {
  e.preventDefault();

  const patientName = document.getElementById('patientName').value.trim();
  const phone = document.getElementById('patientPhone').value.trim();
  const doctorId = document.getElementById('doctorSelect').value;
  const date = document.getElementById('appointmentDate').value;
  const time = document.getElementById('appointmentTime').value;
  const reason = document.getElementById('visitReason').value.trim();
  const category = patientCategorySelect ? patientCategorySelect.value : 'regular';

  // Client-side Validation Checks
  if (!patientName || !phone || !doctorId || !date || !time || !reason) {
    showAlert('Please fill in all required fields marked with an asterisk (*).', 'error');
    return;
  }

  // Validate past date
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  if (date < todayStr) {
    showAlert('Cannot schedule an appointment for a past date. Please pick today or a future date.', 'error');
    return;
  }

  // Basic phone validation
  if (phone.replace(/\D/g, '').length < 7) {
    showAlert('Please provide a valid phone number with at least 7 digits.', 'error');
    return;
  }

  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing Booking...';
  }

  try {
    const response = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientName,
        phone,
        doctorId,
        date,
        time,
        reason,
        category
      })
    });

    const result = await response.json();

    if (!response.ok) {
      // Backend returned validation error or duplicate slot conflict (409)
      throw new Error(result.message || 'Failed to book appointment.');
    }

    // Success!
    showAlert(`Appointment successfully booked for ${result.appointment.patientName} with ${result.appointment.doctorName}!`, 'success');

    // Reset Form
    appointmentForm.reset();
    setupDateLimits();
    updateFeeEstimate();

    // Reload table
    await loadAppointments();

    // Show Printable Slip
    openSlipModal(result.appointment.id);

    // Scroll to appointments table
    const apptsSection = document.getElementById('appointments');
    if (apptsSection) {
      setTimeout(() => apptsSection.scrollIntoView({ behavior: 'smooth' }), 500);
    }
  } catch (err) {
    console.error('Booking error:', err);
    showAlert(err.message || 'Unable to complete appointment booking. Please check slot availability.', 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm & Book Appointment';
    }
  }
}

/**
 * 8. Cancel an Appointment
 */
window.cancelAppointment = async function (id) {
  const confirmCancel = window.confirm(`Are you sure you want to cancel appointment #${id}? This will free up the slot.`);
  if (!confirmCancel) return;

  try {
    const res = await fetch(`/api/appointments/${id}/cancel`, {
      method: 'POST'
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || 'Failed to cancel appointment.');
    }

    showAlert(`Appointment #${id} has been successfully cancelled.`, 'info');
    await loadAppointments();
  } catch (err) {
    console.error('Cancel error:', err);
    showAlert(err.message || 'Failed to cancel appointment.', 'error');
  }
};

/**
 * 9. Appointment Slip Modal Handlers
 */
window.openSlipModal = function (appointmentId) {
  const app = appointmentsList.find((a) => a.id === appointmentId);
  if (!app) return;

  document.getElementById('slipId').textContent = '#' + app.id.toUpperCase();
  document.getElementById('slipPatient').textContent = app.patientName;
  document.getElementById('slipPhone').textContent = app.phone;
  document.getElementById('slipDoctor').textContent = app.doctorName;
  document.getElementById('slipSpec').textContent = app.specialization || 'Specialist Consultation';
  document.getElementById('slipDate').textContent = app.date;
  document.getElementById('slipTime').textContent = app.time;
  document.getElementById('slipFee').textContent = '$' + app.fee;
  document.getElementById('slipReason').textContent = app.reason;

  if (slipModal) {
    slipModal.classList.add('active');
  }
};

function closeSlipModal() {
  if (slipModal) slipModal.classList.remove('active');
}

/**
 * 10. Alert Notification Banner Helper
 */
function showAlert(message, type = 'info') {
  if (!alertContainer) return;

  const alertClass =
    type === 'success'
      ? 'alert-success'
      : type === 'error'
      ? 'alert-error'
      : 'alert-info';

  const icon = type === 'success' ? '✓ ' : type === 'error' ? '⚠ ' : 'ℹ ';

  alertContainer.innerHTML = `
    <div class="alert-box ${alertClass}">
      <span><strong>${icon}</strong> ${escapeHtml(message)}</span>
      <button class="alert-close" onclick="this.parentElement.remove()">&times;</button>
    </div>
  `;

  // Auto-scroll to top to see alert
  alertContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // Auto-dismiss after 6 seconds
  setTimeout(() => {
    if (alertContainer.firstChild) {
      alertContainer.innerHTML = '';
    }
  }, 6000);
}

/**
 * 11. Helper to escape HTML characters
 */
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 12. Setup Event Listeners
 */
function setupEventListeners() {
  // Appointment form submit
  if (appointmentForm) {
    appointmentForm.addEventListener('submit', handleBookingSubmit);
  }

  // Doctor select change
  if (doctorSelect) {
    doctorSelect.addEventListener('change', updateFeeEstimate);
  }

  // Category change
  if (patientCategorySelect) {
    patientCategorySelect.addEventListener('change', updateFeeEstimate);
  }

  // Refresh appointments button
  if (refreshAppointmentsBtn) {
    refreshAppointmentsBtn.addEventListener('click', () => {
      loadAppointments();
      showAlert('Appointments table refreshed.', 'info');
    });
  }

  // Modal close buttons
  if (closeSlipBtn) closeSlipBtn.addEventListener('click', closeSlipModal);
  if (dismissSlipBtn) dismissSlipBtn.addEventListener('click', closeSlipModal);
  if (printSlipBtn) printSlipBtn.addEventListener('click', () => window.print());

  // Close modal when clicking outside
  if (slipModal) {
    slipModal.addEventListener('click', (e) => {
      if (e.target === slipModal) closeSlipModal();
    });
  }
}
