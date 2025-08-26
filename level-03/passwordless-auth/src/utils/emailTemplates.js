export function magicLinkEmail({ appUrl, email, link, code, ttlMinutes }) {
  const subject = `Your sign-in link for ${new URL(appUrl).host}`;
  const text = `Sign in to ${appUrl}\n\nUse this link (valid for ${ttlMinutes} minutes):\n${link}\n\nOr enter this code: ${code}\n\nIf you did not request this, you can ignore this email.`;
  const html = `
  <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; padding:24px">
    <h2>Sign in to ${new URL(appUrl).host}</h2>
    <p>Click the button below to sign in. This link expires in <b>${ttlMinutes} minutes</b>.</p>
    <p style="margin:24px 0">
      <a href="${link}" style="background:#111;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">Sign in</a>
    </p>
    <p>Or enter this 6-digit code:</p>
    <div style="font-size:28px; font-weight:700; letter-spacing:4px;">${code}</div>
    <p style="color:#666;margin-top:24px">If you didn't request this, you can safely ignore this email.</p>
  </div>`;
  return { subject, text, html };
}
