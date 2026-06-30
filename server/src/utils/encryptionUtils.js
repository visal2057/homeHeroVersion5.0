import crypto from 'crypto';

// Two-way encryption for sensitive values we must store but may need to read
// back later (e.g. a provider's bank account number). Passwords use one-way
// hashing instead (see passwordUtils.js); a bank account is different because
// it is data, not a secret to compare against.
//
// We use AES-256-GCM. GCM also produces an "auth tag" that lets decryption
// detect if the stored value was tampered with.

const SECRET = process.env.PAYMENT_ENC_SECRET || 'dev_payment_encryption_secret';

// AES-256 needs a 32-byte key. scrypt turns our secret text into one.
const KEY = crypto.scryptSync(SECRET, 'homehero-payment-salt', 32);

export function encrypt(plainText) {
  const iv = crypto.randomBytes(12); // GCM standard IV size
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const encrypted = Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Keep the iv, tag and data together so decrypt() has everything it needs.
  return [iv.toString('hex'), tag.toString('hex'), encrypted.toString('hex')].join(':');
}

export function decrypt(cipherText) {
  const [ivHex, tagHex, dataHex] = cipherText.split(':');
  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]);
  return decrypted.toString('utf8');
}
