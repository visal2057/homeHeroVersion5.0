import crypto from 'crypto';

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const ALL = UPPER + LOWER + DIGITS;

function randomChar(pool) {
  return pool[crypto.randomInt(pool.length)];
}

export function generateUserToken() {
  const required = [randomChar(UPPER), randomChar(LOWER), randomChar(DIGITS)];
  const rest = Array.from({ length: 3 }, () => randomChar(ALL));
  const chars = [...required, ...rest];

  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}
