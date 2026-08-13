const { google } = require('googleapis');

// Sends real mail through the Gmail API (HTTPS), using an OAuth2 refresh
// token tied to the account owner's own Gmail account. Unlike raw SMTP,
// this isn't blocked by hosting platforms that restrict outbound SMTP
// ports, and unlike a free-tier email service without a verified domain,
// it can deliver to any real recipient.
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

function encodeMessage({ to, subject, html }) {
  const messageParts = [
    `From: "Scholario" <${process.env.GMAIL_USER}>`,
    `To: ${to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    '',
    html,
  ];
  const message = messageParts.join('\n');

  return Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function sendEmail({ to, subject, html }) {
  const raw = encodeMessage({ to, subject, html });
  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
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
