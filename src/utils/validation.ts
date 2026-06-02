/**
 * Comprehensive email validation utility
 * Supports standard email formats and most common domains
 */

/**
 * Validates email format using a simple regex pattern
 * @param email - Email address to validate
 * @returns true if email is valid, false otherwise
 */
export const validateEmail = (email: string): boolean => {
  // Simple email validation - just check for @ and . in proper places
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates phone number in Vietnamese format
 * Accepts formats: 0xxxxxxxxx (10 digits starting with 0)
 * The second digit must be 3, 5, 7, 8, or 9
 * @param phone - Phone number to validate
 * @returns true if valid Vietnamese phone, false otherwise
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone || phone.trim().length === 0) {
    return false;
  }
  // Remove all non-numeric characters
  const cleanedPhone = phone.replace(/\D/g, "");
  // Vietnamese phone: 10 digits, starts with 0, second digit is 3, 5, 7, 8, or 9
  const phoneRegex = /^0[35789][0-9]{8}$/;
  return phoneRegex.test(cleanedPhone);
};

/**
 * Validates date string in DD/MM/YYYY or YYYY-MM-DD format
 * @param dateStr - Date string to validate
 * @returns Date object if valid, null otherwise
 */
export const validateDate = (dateStr: string): Date | null => {
  if (dateStr.includes("-")) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date;
  }
  
  const [day, month, year] = dateStr.split("/");
  if (!day || !month || !year) return null;
  
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  if (isNaN(date.getTime())) return null;
  
  return date;
};

/**
 * Validates password strength
 * Requirements:
 * - At least 8 characters
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one digit
 * @param password - Password to validate
 * @returns { isValid: boolean, errors: string[] }
 */
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Mật khẩu phải có ít nhất 8 ký tự");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất một ký tự viết hoa");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất một ký tự viết thường");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất một chữ số");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates full name (non-empty string)
 * @param name - Name to validate
 * @returns true if valid, false otherwise
 */
export const validateFullName = (name: string): boolean => {
  return name.trim().length > 0;
};
