export function generatePassword(length = 20, opts = { symbols: true }) {
  const lowers = 'abcdefghijklmnopqrstuvwxyz';
  const uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  const symbols = '!@#$%^&*()-_=+[]{};:,.<>?';
  let charset = lowers + uppers + digits + (opts.symbols ? symbols : '');
  let res = '';
  const bytes = crypto.getRandomValues
    ? crypto.getRandomValues(new Uint8Array(length))
    : Buffer.from(require('crypto').randomBytes(length));
  for (let i = 0; i < length; i++) {
    res += charset[bytes[i] % charset.length];
  }
  return res;
}

export function mask(str, show = 2) {
  if (!str) return '';
  const s = String(str);
  if (s.length <= show) return '*'.repeat(s.length);
  return s.slice(0, show) + '*'.repeat(s.length - show);
}
