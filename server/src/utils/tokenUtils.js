/**
 * Token Utility Functions
 * Handles secure token generation, validation, and verification
 */

import crypto from "crypto";

/**
 * Generate a secure random token
 * @returns {string} 64-character hexadecimal token
 */
export const generateSecureToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Get token expiry time (48 hours from now)
 * @returns {Date} Date object representing 48 hours from now
 */
export const getTokenExpiry = () => {
  const now = new Date();
  now.setHours(now.getHours() + 48);
  return now;
};

/**
 * Check if token has expired
 * @param {Date} expiryTime - Token expiry timestamp
 * @returns {boolean} True if token has expired
 */
export const isTokenExpired = (expiryTime) => {
  const now = new Date();
  return now > new Date(expiryTime);
};

/**
 * Get hours remaining until token expiry
 * @param {Date} expiryTime - Token expiry timestamp
 * @returns {number} Hours remaining (rounded down)
 */
export const getHoursRemaining = (expiryTime) => {
  const now = new Date();
  const timeRemaining = new Date(expiryTime) - now;
  return Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60)));
};

/**
 * Verify token validity
 * @param {string} token - Token to verify
 * @param {string} storedToken - Token stored in database
 * @param {Date} tokenExpiryTime - Token expiry time
 * @returns {Object} Verification result { valid: boolean, error?: string }
 */
export const verifyToken = (token, storedToken, tokenExpiryTime) => {
  // Check if token matches
  if (token !== storedToken) {
    return {
      valid: false,
      error: "Invalid token",
    };
  }

  // Check if token has expired
  if (isTokenExpired(tokenExpiryTime)) {
    return {
      valid: false,
      error: "Token has expired",
    };
  }

  return {
    valid: true,
  };
};

/**
 * Revoke a token by setting it to null
 * @param {Object} booking - Booking object to update
 * @returns {Promise<void>}
 */
export const revokeToken = async (booking, tokenType = "paymentToken") => {
  booking[tokenType] = null;
  await booking.save();
};

/**
 * Refresh token expiry time to 48 hours from now
 * @param {Object} booking - Booking object to update
 * @returns {Promise<void>}
 */
export const refreshTokenExpiry = async (booking) => {
  booking.tokenExpiresAt = getTokenExpiry();
  await booking.save();
};

/**
 * Generate payment link
 * @param {string} bookingId - Booking ID
 * @param {string} paymentToken - Payment token
 * @param {string} baseUrl - Base URL (defaults to frontend URL)
 * @returns {string} Full payment URL
 */
export const generatePaymentLink = (bookingId, paymentToken, baseUrl) => {
  const url = baseUrl || process.env.FRONTEND_URL || "http://localhost:5174";
  return `${url}/booking/payment?bookingId=${bookingId}&token=${paymentToken}`;
};

/**
 * Generate tracking link
 * @param {string} bookingId - Booking ID
 * @param {string} trackingToken - Tracking token
 * @param {string} baseUrl - Base URL (defaults to frontend URL)
 * @returns {string} Full tracking URL
 */
export const generateTrackingLink = (bookingId, trackingToken, baseUrl) => {
  const url = baseUrl || process.env.FRONTEND_URL || "http://localhost:5174";
  return `${url}/booking/track?bookingId=${bookingId}&token=${trackingToken}`;
};

/**
 * Hash token for additional security (optional)
 * @param {string} token - Token to hash
 * @returns {string} Hashed token
 */
export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Compare plain token with hashed token
 * @param {string} plainToken - Plain token to check
 * @param {string} hashedToken - Hashed token from database
 * @returns {boolean} True if tokens match
 */
export const compareTokens = (plainToken, hashedToken) => {
  return hashToken(plainToken) === hashedToken;
};
