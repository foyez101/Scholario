const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// Resend's free tier (no verified custom domain) can only deliver to the
// email address the Resend account itself was signed up with. That's a
// Resend limitation, not something this code can work around - for testing,
// register/reset using that same email address.
async function sendEmail({ to, subject, html }) {
  await resend.emails.send({
    from: 'Scholario <onboarding@resend.dev>',
    to,
    subject,
    html,
  });
}

// A random 6-digit code, e.g. "042817".
function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendVerificationEmail(to, name, code) {
  await sendEmail({
    to,
    subject: 'Verify your Scholario account',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#0f9d8b;">Scholario</h2>
        <p>Hi ${name},</p>
        <p>Use this code to verify your account. It expires in 15 minutes.</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${code}</p>
        <p style="color:#6b7280; font-size: 13px;">If you didn't create a Scholario account, you can ignore this email.</p>
      </div>
    `,
  });
}

async function sendPasswordResetEmail(to, name, code) {
  await sendEmail({
    to,
    subject: 'Reset your Scholario password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#0f9d8b;">Scholario</h2>
        <p>Hi ${name},</p>
        <p>Use this code to reset your password. It expires in 15 minutes.</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${code}</p>
        <p style="color:#6b7280; font-size: 13px;">If you didn't request this, you can ignore this email - your password won't change.</p>
      </div>
    `,
  });
}

module.exports = { generateCode, sendVerificationEmail, sendPasswordResetEmail };
