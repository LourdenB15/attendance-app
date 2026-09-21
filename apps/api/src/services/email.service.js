// apps/api/src/services/email.service.js
import { Resend } from "resend";

const APP_URL = process.env.APP_URL || "http://localhost:5173";
const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const FROM = `Attendance App <${FROM_ADDRESS}>`;
const isDev = process.env.NODE_ENV !== "production";

function getClient() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

async function send({ label, to, subject, html }) {
  const resend = getClient();
  if (!resend) {
    console.warn(`⚠️ RESEND_API_KEY not configured. ${label} not sent.`);
    return;
  }

  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) {
      console.error(`Failed to send ${label} via Resend:`, error);
    }
  } catch (err) {
    console.error(`Failed to send ${label} via Resend (network error):`, err);
  }
}

export async function sendVerificationEmail(to, code) {
  if (isDev) {
    console.log(`\n📧 [EMAIL VERIFICATION CODE DISPATCH] To: ${to}\n🔢 Verification Code: ${code}\n`);
  }

  await send({
    label: "verification email",
    to,
    subject: `Your Verification Code: ${code} - Attendance Tracker`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; text-align: center;">
        <h2 style="color: #4f46e5; margin-bottom: 8px;">Welcome to Attendance Tracker!</h2>
        <p style="color: #475569; font-size: 14px; margin-bottom: 20px;">Please enter the 6-digit code below to activate your student account:</p>
        <div style="margin: 24px 0;">
          <span style="font-size: 32px; font-family: monospace; font-weight: 900; letter-spacing: 8px; color: #1e1b4b; background: #eef2ff; padding: 12px 24px; border-radius: 12px; border: 1px dashed #6366f1; display: inline-block;">
            ${code}
          </span>
        </div>
        <p style="color: #94a3b8; font-size: 12px;">This verification code will expire in 15 minutes.</p>
        <p style="color: #94a3b8; font-size: 11px; margin-top: 16px;">If you didn't create an account, please disregard this email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to, token) {
  const resetLink = `${APP_URL}/?token=${token}`;
  if (isDev) {
    console.log(`\n📧 [PASSWORD RESET DISPATCH] To: ${to}\n🔗 Reset Link: ${resetLink}\n`);
  }

  await send({
    label: "password reset email",
    to,
    subject: "Reset your password",
    html: `<p>Reset your password using the link below. It expires in 30 minutes.</p>
           <p><a href="${resetLink}">${resetLink}</a></p>
           <p>If you didn't request this, ignore this email.</p>`,
  });
}

export async function sendTempPasswordEmail(to, tempPassword) {
  if (isDev) {
    console.log(`\n📧 [TEMP PASSWORD DISPATCH] To: ${to}\n🔑 Temporary Password: ${tempPassword}\n`);
  }

  await send({
    label: "temp password email",
    to,
    subject: "Your attendance app account",
    html: `<p>An account has been created for you.</p>
           <p>Temporary password: <strong>${tempPassword}</strong></p>
           <p>Log in with it — you'll be asked to set a new password right away.</p>`,
  });
}
