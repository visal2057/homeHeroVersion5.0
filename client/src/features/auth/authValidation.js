const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,30}$/;
const SRI_LANKAN_PHONE_PATTERN = /^(?:\+94|0)[0-9]{9}$/;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export function validateUsername(value) {
  if (!value) return 'Username is required';
  if (!USERNAME_PATTERN.test(value)) return 'Username must be 3-30 characters using letters, numbers or underscore';
  return null;
}

export function validateEmail(value) {
  if (!value) return 'Email is required';
  if (!EMAIL_PATTERN.test(value)) return 'Enter a valid email address';
  return null;
}

export function validatePhone(value) {
  if (!value) return 'Phone number is required';
  if (!SRI_LANKAN_PHONE_PATTERN.test(value)) return 'Enter a valid Sri Lankan phone number';
  return null;
}

export function validatePassword(value) {
  if (!value) return 'Password is required';
  if (!PASSWORD_PATTERN.test(value)) return 'Password must be at least 8 characters and include a letter and a number';
  return null;
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return null;
}

export function validateRequired(value, label) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return `${label} is required`;
  }
  return null;
}
