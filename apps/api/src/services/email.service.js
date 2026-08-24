// apps/api/src/services/email.service.js
import nodemailer from "nodemailer";

const APP_URL = process.env.APP_URL || "http://localhost:5173";

function getTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return null;
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

export async function sendVerificationEmail(to, code) {
  console.log(`\n📧 [EMAIL VERIFICATION CODE DISPATCH] To: ${to}\n🔢 Verification Code: ${code}\n`);

  const transporter = getTransporter();
  if (!transporter) {
    console.warn("⚠️ GMAIL_USER or GMAIL_APP_PASSWORD not configured. Use the terminal code above.");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Attendance App" <${process.env.GMAIL_USER}>`,
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
  } catch (err) {
    console.error("Failed to send verification email via Gmail:", err);
  }
}

export async function sendPasswordResetEmail(to, token) {
  const resetLink = `${APP_URL}/?token=${token}`;
  console.log(`\n📧 [PASSWORD RESET DISPATCH] To: ${to}\n🔗 Reset Link: ${resetLink}\n`);

  const transporter = getTransporter();
  if (!transporter) {
    console.warn("⚠️ GMAIL_USER or GMAIL_APP_PASSWORD not configured.");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Attendance App" <${process.env.GMAIL_USER}>`,
      to,
      subject: "Reset your password",
      html: `<p>Reset your password using the link below. It expires in 30 minutes.</p>
             <p><a href="${resetLink}">${resetLink}</a></p>
             <p>If you didn't request this, ignore this email.</p>`,
    });
  } catch (err) {
    console.error("Failed to send reset email via Gmail:", err);
  }
}

export async function sendTempPasswordEmail(to, tempPassword) {
  console.log(`\n📧 [TEMP PASSWORD DISPATCH] To: ${to}\n🔑 Temporary Password: ${tempPassword}\n`);

  const transporter = getTransporter();
  if (!transporter) {
    console.warn("⚠️ GMAIL_USER or GMAIL_APP_PASSWORD not configured.");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Attendance App" <${process.env.GMAIL_USER}>`,
      to,
      subject: "Your attendance app account",
      html: `<p>An account has been created for you.</p>
             <p>Temporary password: <strong>${tempPassword}</strong></p>
             <p>Log in with it — you'll be asked to set a new password right away.</p>`,
    });
  } catch (err) {
    console.error("Failed to send temp password email via Gmail:", err);
  }
}
