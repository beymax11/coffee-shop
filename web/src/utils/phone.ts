/**
 * Formats a raw phone number into standard international format (+63...)
 */
export const formatPhoneNumber = (rawPhone: string): string => {
  let cleaned = rawPhone.trim().replace(/\s+/g, "").replace(/[-()]/g, "");
  if (!cleaned) return "";

  if (cleaned.startsWith("+63")) {
    return cleaned;
  }
  if (cleaned.startsWith("63")) {
    return "+" + cleaned;
  }
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }
  return "+63" + cleaned;
};

/**
 * Formats an international phone number (+63...) into local format (09...) for display
 */
export const formatDisplayPhone = (phone?: string): string => {
  if (!phone) return "n/a";
  let cleaned = phone.trim().replace(/\s+/g, "");
  if (cleaned.startsWith("+63")) {
    return "0" + cleaned.substring(3);
  }
  if (cleaned.startsWith("63")) {
    return "0" + cleaned.substring(2);
  }
  return cleaned;
};
