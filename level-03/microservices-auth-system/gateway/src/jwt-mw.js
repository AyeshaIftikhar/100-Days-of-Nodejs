import jwt from 'jose';
import { createPublicKey } from 'crypto';

function importPemPublicKey(pem) {
  // return KeyLike for jose
  const key = createPublicKey(pem);
  return key.export({ type: 'spki', format: 'pem' });
}

export async function verifyAccessToken(token) {
  const publicKeyPem = process.env.JWT_PUBLIC_KEY;
  if (!publicKeyPem) throw new Error('JWT_PUBLIC_KEY not set');

  try {
    const key = importPemPublicKey(publicKeyPem);
    const { payload } = await jwt.jwtVerify(token, jwt.importSPKI(publicKeyPem, 'RS256'));
    return payload;
  } catch (e) {
    throw e;
  }
}

export async function jwtMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing bearer token' });
  try {
    const payload = await verifyAccessToken(token);
    if (process.env.REQUIRE_EMAIL_VERIFICATION === 'true' && !payload.emailVerified) {
      return res.status(403).json({ error: 'Email not verified' });
    }
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
