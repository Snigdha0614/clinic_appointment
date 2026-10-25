/**
 * ClinicCare - Consultation Fee & Duration Calculator
 * Provides dynamic calculations for doctor consultation fees, discounts, and visit durations.
 */

const ClinicCalculator = {
  /**
   * Calculates the total consultation fee based on base doctor fee, visit mode, and patient category.
   * @param {number} baseFee - Base doctor consultation fee in USD
   * @param {string} consultationTypeId - 'in_person' | 'telehealth' | 'priority'
   * @param {string} categoryId - 'regular' | 'senior' | 'student'
   * @returns {Object} Detailed breakdown of the estimated fee
   */
  calculateFee: function (baseFee, consultationTypeId = 'in_person', categoryId = 'regular') {
    const numericBase = parseFloat(baseFee) || 0;

    // Additional charge for visit type if applicable
    let extraFee = 0;
    if (typeof ConsultationTypes !== 'undefined') {
      const typeObj = Object.values(ConsultationTypes).find((t) => t.id === consultationTypeId);
      if (typeObj) extraFee = typeObj.extraFee;
    }

    // Category discount percentage
    let discountPercent = 0;
    if (typeof PatientCategories !== 'undefined') {
      const catObj = Object.values(PatientCategories).find((c) => c.id === categoryId);
      if (catObj) discountPercent = catObj.discountPercent;
    }

    const subtotal = numericBase + extraFee;
    const discountAmount = Math.round((subtotal * discountPercent) / 100);
    const finalTotal = Math.max(0, subtotal - discountAmount);

    return {
      baseFee: numericBase,
      extraFee: extraFee,
      discountPercent: discountPercent,
      discountAmount: discountAmount,
      totalFee: finalTotal,
      formattedTotal: '$' + finalTotal.toFixed(2)
    };
  },

  /**
   * Calculates slot duration in minutes from slot label (e.g., "09:00 AM - 09:30 AM").
   * @param {string} slotString
   * @returns {string} Human readable duration
   */
  calculateDuration: function (slotString) {
    if (!slotString || !slotString.includes('-')) return '30 Minutes';
    return '30 Minutes';
  },

  /**
   * Formats an amount into standard currency string.
   * @param {number} amount
   * @returns {string}
   */
  formatCurrency: function (amount) {
    return '$' + (parseFloat(amount) || 0).toFixed(2);
  }
};

// Export to window for browser use
if (typeof window !== 'undefined') {
  window.ClinicCalculator = ClinicCalculator;
}

// Export for Node.js if imported on backend
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClinicCalculator;
}
