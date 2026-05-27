import { Resend } from 'resend';
import { env } from '../config/env.js';
function buildOtpHtml(title, body, otp, expiryMinutes) {
    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:40px 16px;background:#f5f0eb;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.08);">
    <div style="background:#2D2D2D;padding:32px 40px;text-align:center;">
      <p style="color:#C8956C;font-size:24px;font-weight:800;margin:0;letter-spacing:-0.5px;">BasantiShop</p>
      <p style="color:rgba(255,255,255,0.45);font-size:11px;margin:6px 0 0;text-transform:uppercase;letter-spacing:2px;">Basanti Variety Store</p>
    </div>
    <div style="padding:40px 40px 32px;">
      <h2 style="color:#2D2D2D;font-size:20px;font-weight:700;margin:0 0 12px;">${title}</h2>
      <p style="color:#777;font-size:15px;line-height:1.7;margin:0 0 28px;">${body}</p>
      <div style="text-align:center;background:#fdf8f4;border-radius:16px;padding:28px;border:2px dashed #e8d5c4;">
        <p style="color:#aaa;font-size:11px;text-transform:uppercase;letter-spacing:3px;margin:0 0 10px;">Your verification code</p>
        <span style="font-size:40px;font-weight:800;letter-spacing:14px;color:#C8956C;">${otp}</span>
      </div>
      <p style="color:#bbb;font-size:13px;text-align:center;margin:20px 0 0;line-height:1.6;">
        Expires in <strong>${expiryMinutes} minutes</strong>. Never share this code with anyone.
      </p>
    </div>
    <div style="background:#faf7f4;padding:20px 40px;text-align:center;border-top:1px solid #f0e8e0;">
      <p style="color:#ccc;font-size:12px;margin:0;">
        © ${new Date().getFullYear()} BasantiShop &mdash; If you didn&apos;t request this, you can safely ignore this email.
      </p>
    </div>
  </div>
</body>
</html>`;
}
function extractOtp(html) {
    const m = html.match(/letter-spacing:14px[^>]*>(\d{6})</);
    return m?.[1] ?? '(see HTML)';
}
async function send(to, subject, html) {
    if (!env.RESEND_API_KEY) {
        const otp = extractOtp(html);
        console.log(`\n${'─'.repeat(50)}`);
        console.log(`[EMAIL - no RESEND_API_KEY configured]`);
        console.log(`To      : ${to}`);
        console.log(`Subject : ${subject}`);
        console.log(`OTP CODE: ${otp}`);
        console.log(`${'─'.repeat(50)}\n`);
        return;
    }
    const resend = new Resend(env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
        from: env.SMTP_FROM,
        to,
        subject,
        html,
    });
    if (error) {
        console.error(`[EMAIL ERROR] Failed to send to ${to}:`, error.message);
        const e = new Error('Failed to send email. Please try again later.');
        e.status = 503;
        throw e;
    }
    console.log(`[EMAIL] Sent to ${to} — "${subject}"`);
}
export const emailService = {
    async sendRegistrationOtp(email, name, otp) {
        const html = buildOtpHtml(`Verify your email, ${name}!`, 'Welcome to BasantiShop! Use the code below to verify your email address and complete your registration.', otp, 10);
        await send(email, `${otp} — Verify your BasantiShop account`, html);
    },
    async sendLoginOtp(email, otp) {
        const html = buildOtpHtml('Your login code', 'Use the code below to sign in to your BasantiShop account.', otp, 10);
        await send(email, `${otp} — Your BasantiShop login code`, html);
    },
    async sendPasswordResetOtp(email, otp) {
        const html = buildOtpHtml('Reset your password', "We received a request to reset your BasantiShop password. Use the code below to set a new password. If you didn't request this, ignore this email.", otp, 15);
        await send(email, `${otp} — Reset your BasantiShop password`, html);
    },
};
//# sourceMappingURL=email.service.js.map