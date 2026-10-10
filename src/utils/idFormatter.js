/**
 * ID & Code Formatter Utility
 * Provides clean sequential display indexing and formatted serial codes
 * (e.g., DEPT-001, EMP-001, POL-001, RSK-001, TRN-001, ASM-001)
 * across the Human Risk Intelligence Platform tables.
 */

/**
 * Formats a record into a clean serial code with prefix and 3-digit padding.
 * @param {string|number} id - Original database ID or UUID.
 * @param {number} index - 0-based index in the current list/table view.
 * @param {string} prefix - Prefix code (e.g. 'DEPT', 'EMP', 'POL', 'RSK', 'TRN', 'ASM').
 * @returns {string} Formatted code (e.g. 'DEPT-001', 'EMP-001').
 */
export const formatId = (id, index = 0, prefix = "") => {
  // If the record has a clean numerical ID (e.g., departments 1..4), we can reflect that,
  // otherwise fallback to clean sequential 1-based display index (index + 1).
  let seq;
  if (typeof id === "number" && Number.isInteger(id) && id > 0 && id <= 9999) {
    seq = id;
  } else if (typeof id === "string" && /^\d+$/.test(id.trim()) && Number(id) > 0 && Number(id) <= 9999) {
    seq = Number(id);
  } else {
    seq = index !== undefined && index !== null && !isNaN(index) ? index + 1 : 1;
  }

  if (prefix) {
    return `${prefix}-${String(seq).padStart(3, "0")}`;
  }
  return String(seq);
};

/**
 * Formats strictly by 1-based display index, guaranteeing monotonic sequential numbering (1, 2, 3...)
 * regardless of underlying database IDs.
 * @param {number} index - 0-based index.
 * @param {string} prefix - Optional prefix.
 * @returns {string}
 */
export const formatSequentialIndex = (index = 0, prefix = "") => {
  const seq = index !== undefined && index !== null && !isNaN(index) ? index + 1 : 1;
  if (prefix) {
    return `${prefix}-${String(seq).padStart(3, "0")}`;
  }
  return String(seq);
};

export default {
  formatId,
  formatSequentialIndex,
};
