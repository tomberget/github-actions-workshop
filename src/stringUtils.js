/**
 * String utility functions
 */

/**
 * Capitalizes the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} The capitalized string
 */
export function capitalize(str) {
  if (typeof str !== "string") {
    throw new TypeError("Input must be a string");
  }
  if (str.length === 0) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Reverses a string
 * @param {string} str - The string to reverse
 * @returns {string} The reversed string
 */
export function reverse(str) {
  if (typeof str !== "string") {
    throw new TypeError("Input must be a string");
  }
  return str.split("").reverse().join("");
}

/**
 * Checks if a string is a palindrome
 * @param {string} str - The string to check
 * @returns {boolean} True if the string is a palindrome
 */
export function isPalindrome(str) {
  if (typeof str !== "string") {
    throw new TypeError("Input must be a string");
  }
  const normalized = str.toLowerCase().replace(/[^a-z0-9]/g, "");
  return normalized === normalized.split("").reverse().join("");
}

/**
 * Truncates a string to a specified length and adds ellipsis
 * @param {string} str - The string to truncate
 * @param {number} maxLength - The maximum length
 * @returns {string} The truncated string
 */
export function truncate(str, maxLength) {
  if (typeof str !== "string") {
    throw new TypeError("Input must be a string");
  }
  if (typeof maxLength !== "number" || maxLength < 0) {
    throw new TypeError("maxLength must be a non-negative number");
  }
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength) + "...";
}
