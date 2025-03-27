/**
 * Utilities for string operations used throughout the Blueprint compiler.
 */

/**
 * Escapes special HTML characters in a string to prevent XSS attacks.
 * @param {string} text - The text to escape
 * @returns {string} - The escaped text
 */
const escapeHTML = (text) => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Converts a camelCase string to kebab-case (lowercase with hyphens).
 * @param {string} str - The string to convert
 * @returns {string} - The converted string
 */
const toKebabCase = (str) => {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
};

/**
 * Stringify an object while handling circular references.
 * @param {Object} obj - The object to stringify
 * @returns {string} - JSON string representation
 */
const safeStringify = (obj) => {
  const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
      if (key === "parent") return "[Circular:Parent]";
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return "[Circular]";
        }
        seen.add(value);
      }
      return value;
    };
  };

  try {
    return JSON.stringify(obj, getCircularReplacer(), 2);
  } catch (err) {
    return `[Unable to stringify: ${err.message}]`;
  }
};

/**
 * Generates a random ID string suitable for use as an HTML element ID.
 * @param {number} [length=8] - The length of the random ID
 * @returns {string} - A random alphanumeric ID with bp_ prefix
 */
const generateRandomId = (length = 8) => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'bp_';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

module.exports = {
  escapeHTML,
  toKebabCase,
  safeStringify,
  generateRandomId
}; 