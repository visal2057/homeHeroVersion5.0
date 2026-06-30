// All money formatting and fee maths for the client payment screens live
// here, so there is a single place to explain and to change if the rate moves.

// HomeHero keeps 5% of the service amount on CARD payments.
export const PLATFORM_FEE_RATE = 0.05;

// Format a number as Sri Lankan Rupees, e.g. 10000 -> "LKR 10,000.00".
export function formatLKR(amount) {
  return `LKR ${Number(amount ?? 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;
}

// Work out the fee and total for a CARD payment.
// IMPORTANT: this is only to *show* the client what they will pay.
// The backend calculates the fee again before charging, so a tampered
// frontend value can never change what is actually stored.
export function calculateCardTotals(serviceAmount) {
  const amount = Number(serviceAmount ?? 0);
  // Round to 2 decimals so we never show fractions of a cent.
  const platformFee = Math.round(amount * PLATFORM_FEE_RATE * 100) / 100;
  return { serviceAmount: amount, platformFee, total: amount + platformFee };
}
