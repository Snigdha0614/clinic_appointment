/**
 * ClinicCare - Shared Types, Constants & Enums
 * Defines the standard constants used across the clinic appointment booking system.
 */

const AppointmentStatus = {
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed'
};

const TimeSlots = [
  '09:00 AM - 09:30 AM',
  '09:30 AM - 10:00 AM',
  '10:00 AM - 10:30 AM',
  '10:30 AM - 11:00 AM',
  '11:00 AM - 11:30 AM',
  '11:30 AM - 12:00 PM',
  '02:00 PM - 02:30 PM',
  '02:30 PM - 03:00 PM',
  '03:00 PM - 03:30 PM',
  '03:30 PM - 04:00 PM',
  '04:00 PM - 04:30 PM',
  '04:30 PM - 05:00 PM'
];

const ConsultationTypes = {
  IN_PERSON: { id: 'in_person', label: 'In-Person Clinic Visit', extraFee: 0 },
  TELEHEALTH: { id: 'telehealth', label: 'Online Telehealth Video Consult', extraFee: 0 },
  PRIORITY: { id: 'priority', label: 'Priority / Urgent Walk-in Slot', extraFee: 15 }
};

const PatientCategories = {
  REGULAR: { id: 'regular', label: 'General Patient', discountPercent: 0 },
  SENIOR: { id: 'senior', label: 'Senior Citizen (60+ yrs) - 15% Off', discountPercent: 15 },
  STUDENT: { id: 'student', label: 'Student - 10% Off', discountPercent: 10 }
};

// Export to window for browser use
if (typeof window !== 'undefined') {
  window.AppointmentStatus = AppointmentStatus;
  window.TimeSlots = TimeSlots;
  window.ConsultationTypes = ConsultationTypes;
  window.PatientCategories = PatientCategories;
}

// Export for Node.js if imported on backend
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AppointmentStatus,
    TimeSlots,
    ConsultationTypes,
    PatientCategories
  };
}
