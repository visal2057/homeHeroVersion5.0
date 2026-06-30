import { query } from '../../db/query.js';

// Read a provider's saved payee details. We never select the encrypted
// account number itself here - only the last four digits are ever shown.
export function getPaymentSettings(providerUserId) {
  return query(
    `SELECT bank_name, branch_name, account_holder_name, account_number_last_four, updated_at
     FROM provider_payment_settings
     WHERE provider_user_id = $1`,
    [providerUserId],
  );
}

// Create the row, or overwrite it if the provider already has one.
// There is exactly one row per provider (provider_user_id is the primary key),
// so ON CONFLICT lets "save" handle both first-time and edit.
export function upsertPaymentSettings(providerUserId, s) {
  return query(
    `INSERT INTO provider_payment_settings
       (provider_user_id, account_number_ciphertext, account_number_last_four,
        bank_name, branch_name, account_holder_name)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (provider_user_id) DO UPDATE SET
       account_number_ciphertext = EXCLUDED.account_number_ciphertext,
       account_number_last_four  = EXCLUDED.account_number_last_four,
       bank_name                 = EXCLUDED.bank_name,
       branch_name               = EXCLUDED.branch_name,
       account_holder_name       = EXCLUDED.account_holder_name,
       updated_at                = now()
     RETURNING bank_name, branch_name, account_holder_name, account_number_last_four, updated_at`,
    [providerUserId, s.ciphertext, s.lastFour, s.bankName, s.branchName, s.accountHolderName],
  );
}
