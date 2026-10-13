// apps/api/src/services/email.service.js
import { Resend } from "resend";

const APP_URL = process.env.APP_URL || "http://localhost:5173";
const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const FROM = `Attendance Live <${FROM_ADDRESS}>`;
const BRAND_COLOR = "#1a73e8";

function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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
  const safePreheader = escapeHtml(preheader);
  const safeHeading = escapeHtml(heading);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeHeading}</title>
</head>
<body style="margin:0;padding:0;background-color:#f8f9fa;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${safePreheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;padding:36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dadce0;font-family:'Google Sans',Roboto,-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;box-shadow:0 1px 3px rgba(60,64,67,0.08);">
          <!-- Brand Header -->
          <tr>
            <td style="background-color:#1a73e8;background:linear-gradient(135deg,#1a73e8 0%,#1557b0 100%);padding:24px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <div style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.2px;line-height:1.2;">Attendance Live</div>
                    <div style="color:#d2e3fc;font-size:11px;font-weight:500;letter-spacing:0.5px;text-transform:uppercase;margin-top:2px;">Classroom</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Card Body -->
          <tr>
            <td style="padding:32px 32px 28px;">
              <h1 style="margin:0 0 16px;color:#202124;font-size:22px;font-weight:700;line-height:1.3;letter-spacing:-0.2px;">${safeHeading}</h1>
              ${content}
            </td>
          </tr>

          <!-- Subtle Footer -->
          <tr>
            <td style="padding:20px 32px;background-color:#f8f9fa;border-top:1px solid #dadce0;">
              <p style="margin:0;color:#70757a;font-size:12px;line-height:1.5;">
                This is an automated message from Attendance Live. Please don&#039;t reply to this email.
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
  `<p style="margin:0 0 16px;color:#3c4043;font-size:14px;line-height:1.6;">${text}</p>`;

const note = (text) =>
  `<p style="margin:16px 0 0;color:#5f6368;font-size:12px;line-height:1.5;">${text}</p>`;

// Large, easy-to-copy value such as a code or a temporary password
const highlightBox = (value) =>
  `<div style="margin:8px 0 24px;padding:16px;background-color:#e8f0fe;border:1px solid #d2e3fc;border-radius:12px;text-align:center;">
    <span style="font-family:'Roboto Mono',Consolas,'Liberation Mono',monospace;font-size:26px;font-weight:700;letter-spacing:4px;color:#1a73e8;">${escapeHtml(value)}</span>
  </div>`;

const button = (href, label) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0 24px;">
    <tr>
      <td align="center" style="border-radius:24px;background-color:${BRAND_COLOR};">
        <a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 32px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:24px;letter-spacing:0.2px;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;

const fallbackLink = (href) =>
  `<div style="margin-top:24px;padding-top:16px;border-top:1px solid #dadce0;">
    <p style="margin:0 0 6px;color:#5f6368;font-size:12px;line-height:1.5;">
      Button not working? Copy and paste this link into your browser:
    </p>
    <p style="margin:0;font-size:12px;line-height:1.5;">
      <a href="${escapeHtml(href)}" style="color:${BRAND_COLOR};text-decoration:underline;word-break:break-all;">${escapeHtml(href)}</a>
    </p>
  </div>`;

// ---------------------------------------------------------------------------
// Emails
// ---------------------------------------------------------------------------

export async function sendVerificationEmail(to, code) {
  await send({
    label: "verification email",
    to,
    subject: "Your Attendance Live verification code",
    html: layout({
      preheader: `Your verification code is ${code}. It expires in 15 minutes.`,
      heading: "Verify your email",
      content: [
        paragraph("Welcome to Attendance Live! Enter this code to activate your student account:"),
        highlightBox(code),
        paragraph("This code expires in <strong>15 minutes</strong>."),
        note("If you didn&#039;t create an account, you can safely ignore this email."),
      ].join(""),
    }),
    text: [
      "Verify your email",
      "",
      "Welcome to Attendance Live! Enter this code to activate your student account:",
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
    subject: "Reset your Attendance Live password",
    html: layout({
      preheader: "Use this link to set a new password. It expires in 30 minutes.",
      heading: "Reset your password",
      content: [
        paragraph("We received a request to reset your password. Click the button below to choose a new one:"),
        button(resetLink, "Reset password"),
        paragraph("This link expires in <strong>30 minutes</strong> and can only be used once."),
        fallbackLink(resetLink),
        note("If you didn&#039;t request a password reset, you can safely ignore this email. Your password won&#039;t change."),
      ].join(""),
    }),
    text: [
      "Reset your password",
      "",
      "We received a request to reset your password. Open this link to choose a new one:",
      resetLink,
      "",
      "This link expires in 30 minutes and can only be used once.",
      "If you didn't request a password reset, you can safely ignore this email. Your password won't change.",
    ].join("\n"),
  });
}

export async function sendTempPasswordEmail(to, tempPassword) {
  await send({
    label: "temp password email",
    to,
    subject: "Your Attendance Live professor account",
    html: layout({
      preheader: "Your professor account is ready. Sign in with the temporary password inside.",
      heading: "Your professor account is ready",
      content: [
        paragraph("An administrator created an Attendance Live professor account for you. Sign in with this email address and the temporary password below:"),
        highlightBox(tempPassword),
        button(APP_URL, "Sign in"),
        paragraph("You&#039;ll be asked to choose your own password right after signing in."),
        note("Didn&#039;t expect this email? Please contact your administrator."),
      ].join(""),
    }),
    text: [
      "Your professor account is ready",
      "",
      "An administrator created an Attendance Live professor account for you.",
      "Sign in with this email address and the temporary password below:",
      "",
      tempPassword,
      "",
      `Sign in: ${APP_URL}`,
      "You'll be asked to choose your own password right after signing in.",
    ].join("\n"),
  });
}
