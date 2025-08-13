
import crypto from 'crypto';

const ALG = 'aes-256-gcm';
const NONCE_BYTES = 12; // GCM recommended
const SALT_BYTES = 16;

export function randomBytes(n) {
  return crypto.randomBytes(n);
}

export function b64(buf) {
  return Buffer.from(buf).toString('base64');
}

export function fromB64(str) {
  return Buffer.from(str, 'base64');
}

// Derive a 32-byte key using scrypt
export async function deriveKey(password, salt, { N = 16384, r = 8, p = 1 } = {}) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 32, { N, r, p }, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
}

export async function encrypt(key, plaintext) {
  const iv = randomBytes(NONCE_BYTES);
  const cipher = crypto.createCipheriv(ALG, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    iv: b64(iv),
    tag: b64(tag),
    ct: b64(ciphertext)
  };
}

export async function decrypt(key, { iv, tag, ct }) {
  const ivBuf = fromB64(iv);
  const tagBuf = fromB64(tag);
  const ctBuf = fromB64(ct);
  const decipher = crypto.createDecipheriv(ALG, key, ivBuf);
  decipher.setAuthTag(tagBuf);
  const plaintext = Buffer.concat([decipher.update(ctBuf), decipher.final()]);
  return plaintext;
}

// Build a verifier by encrypting a fixed string
export async function buildKeyVerifier(key) {
  const packed = await encrypt(key, Buffer.from('verify-key'));
  return packed;
}

export async function verifyKey(key, verifier) {
  try {
    const plain = await decrypt(key, verifier);
    return plain.toString() === 'verify-key';
  } catch {
    return false;
  }
}
