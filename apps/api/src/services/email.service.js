// apps/api/src/services/email.service.js
import { Resend } from "resend";

const APP_URL = process.env.APP_URL || "http://localhost:5173";
const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const FROM = `Attendance Tracker <${FROM_ADDRESS}>`;
const BRAND_COLOR = "#4f46e5";

function getClient() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

async function send({ label, to, subject, html, text }) {
  const resend = getClient();
  if (!resend) {
    console.warn(`⚠️ RESEND_API_KEY not configured. ${label} not sent.`);
    return;
  }

  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html, text });
    if (error) {
      console.error(`Failed to send ${label} via Resend:`, error);
    }
  } catch (err) {
    console.error(`Failed to send ${label} via Resend (network error):`, err);
  }
}

// ---------------------------------------------------------------------------
// Shared layout. Email clients ignore most modern CSS, so this uses tables and
// inline styles only. `content` is trusted HTML built by the helpers below.
// ---------------------------------------------------------------------------

function layout({ preheader, heading, content }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${heading}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
          <tr>
            <td style="background-color:${BRAND_COLOR};padding:24px 32px;">
              <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.2px;">Attendance Tracker</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 16px;color:#0f172a;font-size:22px;font-weight:700;line-height:1.3;">${heading}</h1>
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.5;">
                This is an automated message from Attendance Tracker. Please don't reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

const paragraph = (text) =>
  `<p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">${text}</p>`;

const note = (text) =>
  `<p style="margin:16px 0 0;color:#64748b;font-size:13px;line-height:1.5;">${text}</p>`;

// Large, easy-to-copy value such as a code or a temporary password
const highlightBox = (value) =>
  `<div style="margin:8px 0 24px;padding:16px;background-color:#eef2ff;border:1px solid #c7d2fe;border-radius:12px;text-align:center;">
    <span style="font-family:'SFMono-Regular',Consolas,'Liberation Mono',monospace;font-size:26px;font-weight:700;letter-spacing:4px;color:#1e1b4b;">${value}</span>
  </div>`;

const button = (href, label) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
    <tr>
      <td style="border-radius:10px;background-color:${BRAND_COLOR};">
        <a href="${href}" style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:10px;">${label}</a>
      </td>
    </tr>
  </table>`;

// ---------------------------------------------------------------------------
// Emails
// ---------------------------------------------------------------------------

export async function sendVerificationEmail(to, code) {
  await send({
    label: "verification email",
    to,
    subject: "Your Attendance Tracker verification code",
    html: layout({
      preheader: `Your verification code is ${code}. It expires in 15 minutes.`,
      heading: "Verify your email",
      content: [
        paragraph("Welcome to Attendance Tracker! Enter this code to activate your student account:"),
        highlightBox(code),
        paragraph("This code expires in <strong>15 minutes</strong>."),
        note("If you didn't create an account, you can safely ignore this email."),
      ].join(""),
    }),
    text: [
      "Verify your email",
      "",
      "Welcome to Attendance Tracker! Enter this code to activate your student account:",
      "",
      code,
      "",
      "This code expires in 15 minutes.",
      "If you didn't create an account, you can safely ignore this email.",
    ].join("\n"),
  });
}

export async function sendPasswordResetEmail(to, token) {
  const resetLink = `${APP_URL}/?token=${token}`;
  await send({
    label: "password reset email",
    to,
    subject: "Reset your Attendance Tracker password",
    html: layout({
      preheader: "Use this link to set a new password. It expires in 30 minutes.",
      heading: "Reset your password",
      content: [
        paragraph("We received a request to reset your password. Click the button below to choose a new one:"),
        button(resetLink, "Reset password"),
        paragraph("This link expires in <strong>30 minutes</strong> and can only be used once."),
        note(
          `Button not working? Copy and paste this link into your browser:<br><a href="${resetLink}" style="color:${BRAND_COLOR};word-break:break-all;">${resetLink}</a>`,
        ),
        note("If you didn't request a password reset, you can safely ignore this email. Your password won't change."),
      ].join(""),
    }),
    text: [
      "Reset your password",
      "",
      "We received a request to reset your password. Open this link to choose a new one:",
      resetLink,
      "",
      "This link expires in 30 minutes and can only be used once.",
      "If you didn't request a password reset, you can safely ignore this email.",
    ].join("\n"),
  });
}

export async function sendTempPasswordEmail(to, tempPassword) {
  await send({
    label: "temp password email",
    to,
    subject: "Your Attendance Tracker professor account",
    html: layout({
      preheader: "Your professor account is ready. Sign in with the temporary password inside.",
      heading: "Your professor account is ready",
      content: [
        paragraph("An administrator created an Attendance Tracker professor account for you. Sign in with this email address and the temporary password below:"),
        highlightBox(tempPassword),
        button(APP_URL, "Sign in"),
        paragraph("You'll be asked to choose your own password right after signing in."),
        note("Didn't expect this email? Please contact your administrator."),
      ].join(""),
    }),
    text: [
      "Your professor account is ready",
      "",
      "An administrator created an Attendance Tracker professor account for you.",
      "Sign in with this email address and the temporary password below:",
      "",
      tempPassword,
      "",
      `Sign in: ${APP_URL}`,
      "You'll be asked to choose your own password right after signing in.",
    ].join("\n"),
  });
}
