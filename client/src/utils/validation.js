/**
 * Validates Sri Lankan National Identity Card (NIC) numbers.
 * Supports both:
 * - Old format: 9 digits followed by 'V' or 'X' (case-insensitive) (e.g., 991234567V)
 * - New format: 12 digits (e.g., 199912345678)
 * 
 * @param {string} nic - The NIC number to validate
 * @returns {boolean} - True if valid or empty (since field is optional), false if invalid format
 */
export function validateSriLankanNIC(nic) {
    if (!nic || nic.trim() === "") return true; // Optional field
    const trimmed = nic.trim();
    const oldFormat = /^[0-9]{9}[vVxX]$/;
    const newFormat = /^[0-9]{12}$/;
    return oldFormat.test(trimmed) || newFormat.test(trimmed);
}
