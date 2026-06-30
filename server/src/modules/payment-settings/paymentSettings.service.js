import { encrypt } from '../../utils/encryptionUtils.js';
import { getPaymentSettings, upsertPaymentSettings } from './paymentSettings.queries.js';

// Convert a database row into the shape the frontend expects.
// The full account number is never part of this - only the last four digits.
function toShape(row) {
  if (!row) return null;
  return {
    bankName: row.bank_name,
    branchName: row.branch_name,
    accountHolderName: row.account_holder_name,
    accountLastFour: row.account_number_last_four,
    updatedAt: row.updated_at,
  };
}

export async function getMyPaymentSettings(providerUserId) {
  const { rows } = await getPaymentSettings(providerUserId);
  return toShape(rows[0]); // null if not set up yet
}

export async function saveMyPaymentSettings(providerUserId, input) {
  // Encrypt the account number before it ever touches the database, and keep
  // the last four digits separately so we can display them without decrypting.
  const ciphertext = encrypt(input.accountNumber);
  const lastFour = input.accountNumber.slice(-4);

  const { rows } = await upsertPaymentSettings(providerUserId, {
    ciphertext,
    lastFour,
    bankName: input.bankName,
    branchName: input.branchName,
    accountHolderName: input.accountHolderName,
  });
  return toShape(rows[0]);
}
