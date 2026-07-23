// Live input masks for the card payment forms (client card payment and
// membership payment). These only affect what the user sees as they type;
// validation and submission still work off the same digit-only values.

// "1234567890123456" -> "1234 5678 9012 3456" (capped at 16 digits).
export function formatCardNumber(value) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.match(/.{1,4}/g)?.join(' ') ?? '';
}

// "0429" -> "04/29" (capped at 4 digits: MM then YY).
export function formatExpiryDate(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

// Digits only, capped at 3 (CVV).
export function formatCVV(value) {
  return value.replace(/\D/g, '').slice(0, 3);
}
