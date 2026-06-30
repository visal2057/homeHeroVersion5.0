import crypto from 'crypto';

// Simulated card payment gateway.
// A real system would call an external provider (Stripe, PayHere, etc.).
// For this project we fake it, but keep the same shape: take card details,
// return whether the charge succeeded plus a reference and card metadata.
// We never return or store the full card number.
export function processCardPayment({ cardNumber }) {
  // Pretend the bank declines this known test number, so we can demo the
  // "payment failed" screen on purpose.
  if (cardNumber.startsWith('4000')) {
    return { success: false };
  }

  // Work out the card brand from the first digit (same rule real gateways use).
  const brand = cardNumber.startsWith('4')
    ? 'Visa'
    : cardNumber.startsWith('5')
      ? 'Mastercard'
      : 'Card';

  return {
    success: true,
    reference: `HH-${Date.now()}-${crypto.randomInt(1000, 9999)}`,
    brand,
    lastFour: cardNumber.slice(-4),
  };
}
