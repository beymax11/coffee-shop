/**
 * Formats a string of digits into blocks of 4 for easy credit card typing.
 */
export function formatCardNumber(value: string): string {
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || "";
  const parts = [];

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }

  if (parts.length > 0) {
    return parts.join(" ");
  } else {
    // If not matching full block yet, show digits with spaces
    return v.replace(/(.{4})/g, "$1 ").trim().substring(0, 19);
  }
}

/**
 * Formats a string into MM/YY format for credit card expiry.
 */
export function formatCardExpiry(value: string): string {
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
  if (v.length >= 2) {
    return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
  }
  return v;
}

/**
 * Formats a telephone input into a clean (XXX) XXX-XXXX layout.
 */
export function formatPhoneNumber(value: string): string {
  const v = value.replace(/\D/g, "");
  if (v.length <= 3) return v;
  if (v.length <= 6) return `(${v.slice(0, 3)}) ${v.slice(3)}`;
  return `(${v.slice(0, 3)}) ${v.slice(3, 6)}-${v.slice(6, 10)}`;
}
