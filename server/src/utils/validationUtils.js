/**
 * Validation Utilities
 * Handles form validations and data checks
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format (international)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if phone is in valid format
 */
export const validatePhone = (phone) => {
  // Simple validation: at least 7 digits
  const phoneRegex = /^[\d\s\-\+\(\)]{7,}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate tour date (minimum 2 days ahead)
 * @param {string|Date} startDate - Tour start date
 * @returns {boolean} True if date is valid
 */
export const validateTourDate = (startDate) => {
  const tourDate = new Date(startDate);
  const today = new Date();
  const twoDaysLater = new Date();
  twoDaysLater.setDate(twoDaysLater.getDate() + 2);

  return tourDate >= twoDaysLater;
};

/**
 * Validate number of guests
 * @param {number} adults - Number of adults
 * @param {number} children - Number of children
 * @returns {boolean} True if valid number of guests
 */
export const validateGuestCount = (adults = 1, children = 0) => {
  const total = adults + children;
  return total >= 1 && total <= 100; // Min 1, max 100
};

/**
 * Validate pickup location (not empty)
 * @param {string} location - Pickup location
 * @returns {boolean} True if location is valid
 */
export const validatePickupLocation = (location) => {
  return location && location.trim().length >= 3;
};

/**
 * Validate name (at least 2 characters)
 * @param {string} name - Full name
 * @returns {boolean} True if name is valid
 */
export const validateName = (name) => {
  return name && name.trim().length >= 2;
};

/**
 * Validate nationality (not empty)
 * @param {string} nationality - Nationality
 * @returns {boolean} True if nationality is valid
 */
export const validateNationality = (nationality) => {
  return nationality && nationality.trim().length >= 2;
};

/**
 * Validate inquiry form data completely
 * @param {Object} formData - Form data object
 * @returns {Object} Validation result { valid: boolean, errors: Object }
 */
export const validateInquiryForm = (formData) => {
  const errors = {};

  // Validate full name
  if (!validateName(formData.fullName)) {
    errors.fullName = "Full name must be at least 2 characters";
  }

  // Validate email
  if (!formData.email) {
    errors.email = "Email is required";
  } else if (!validateEmail(formData.email)) {
    errors.email = "Invalid email format";
  }

  // Validate phone
  if (!formData.phone) {
    errors.phone = "Phone number is required";
  } else if (!validatePhone(formData.phone)) {
    errors.phone = "Invalid phone number format";
  }

  // Validate nationality
  if (!validateNationality(formData.nationality)) {
    errors.nationality = "Nationality is required";
  }

  // Validate start date
  if (!formData.startDate) {
    errors.startDate = "Tour date is required";
  } else if (!validateTourDate(formData.startDate)) {
    errors.startDate = "Tour date must be at least 2 days from today";
  }

  // Validate pickup location
  if (!validatePickupLocation(formData.pickupLocation)) {
    errors.pickupLocation = "Pickup location must be at least 3 characters";
  }

  // Validate guest count
  if (!validateGuestCount(formData.numberOfAdults, formData.numberOfChildren)) {
    errors.guests = "Invalid number of guests";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate booking status transition
 * @param {string} currentStatus - Current booking status
 * @param {string} newStatus - New booking status
 * @returns {boolean} True if transition is allowed
 */
export const isValidStatusTransition = (currentStatus, newStatus) => {
  const validTransitions = {
    payment_pending: ["half_paid", "cancelled"],
    half_paid: ["completed", "cancelled"],
    completed: ["cancelled"],
    cancelled: [],
  };

  const allowedTransitions = validTransitions[currentStatus] || [];
  return allowedTransitions.includes(newStatus);
};

/**
 * Validate refund eligibility
 * @param {Date} tourDate - Tour start date
 * @param {string} bookingStatus - Current booking status
 * @returns {Object} Refund eligibility { eligible: boolean, reason?: string }
 */
export const validateRefundEligibility = (tourDate, bookingStatus) => {
  // Can only refund completed bookings
  if (bookingStatus !== "completed") {
    return {
      eligible: false,
      reason: "Only completed bookings can be refunded",
    };
  }

  const now = new Date();
  const hoursUntilTour = (new Date(tourDate) - now) / (1000 * 60 * 60);

  // Free cancellation up to 24 hours before tour
  if (hoursUntilTour >= 24) {
    return {
      eligible: true,
      refundPercentage: 100,
      reason: "Full refund eligible",
    };
  }

  // Partial refund between 24 hours and tour time
  if (hoursUntilTour > 0) {
    return {
      eligible: true,
      refundPercentage: 50,
      reason: "50% refund eligible",
    };
  }

  // No refund after tour starts
  return {
    eligible: false,
    reason: "Tour has already started",
  };
};

/**
 * Validate payment verification data
 * @param {Object} paymentData - Payment verification data
 * @returns {Object} Validation result { valid: boolean, errors: Object }
 */
export const validatePaymentVerification = (paymentData) => {
  const errors = {};

  if (!paymentData.bookingId) {
    errors.bookingId = "Booking ID is required";
  }

  if (!paymentData.transactionId) {
    errors.transactionId = "Transaction ID is required";
  }

  if (!paymentData.paymentMethod) {
    errors.paymentMethod = "Payment method is required";
  }

  const validMethods = ["card", "bank", "cash", "payhere"];
  if (paymentData.paymentMethod && !validMethods.includes(paymentData.paymentMethod)) {
    errors.paymentMethod = "Invalid payment method";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
