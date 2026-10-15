// apps/api/src/services/email.service.js
import { Resend } from "resend";

const APP_URL = process.env.APP_URL || "https://attendance-app.online";
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
// inline styles only. Synchronized with the Attendance Live UI.
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
<body style="margin:0;padding:0;background-color:#f8fafd;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${safePreheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafd;padding:36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #dadce0;box-shadow:0 1px 3px rgba(60,64,67,0.08);font-family:-apple-system,BlinkMacSystemFont,'Google Sans','Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
          <!-- Brand Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg, #1a73e8 0%, #1557b0 100%);background-color:#1a73e8;padding:22px 30px;border-radius:12px 12px 0 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle;padding-right:12px;">
                    <img src="https://attendance-app.online/apple-touch-icon.png" width="38" height="38" style="display:block;border-radius:8px;border:1px solid rgba(255,255,255,0.3);" alt="Attendance Live" />
                  </td>
                  <td style="vertical-align:middle;">
                    <div style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.2px;line-height:1.2;">Attendance Live</div>
                    <div style="color:#d2e3fc;font-size:12px;font-weight:500;margin-top:2px;">Smart Classroom Attendance</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 16px;color:#202124;font-size:22px;font-weight:700;line-height:1.3;letter-spacing:-0.2px;">${safeHeading}</h1>
              ${content}
            </td>
          </tr>
          <!-- Security & Footer -->
          <tr>
            <td style="padding:20px 32px;background-color:#f8f9fa;border-top:1px solid #dadce0;">
              <div style="margin-bottom:8px;">
                <span style="display:inline-block;padding:3px 8px;background-color:#e6f4ea;color:#137333;font-size:10px;font-weight:700;text-transform:uppercase;border-radius:4px;letter-spacing:0.5px;">
                  🛡️ Anti-Spoofing & Biometric Verification
                </span>
              </div>
              <p style="margin:0;color:#5f6368;font-size:12px;line-height:1.5;">
                This is an automated notification from <strong>Attendance Live</strong>. Please do not reply directly to this email.
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
  `<div style="margin:12px 0 24px;padding:18px 24px;background-color:#f8fafd;border:2px solid #1a73e8;border-radius:10px;text-align:center;">
    <span style="display:block;font-family:'SFMono-Regular',Consolas,'Liberation Mono',monospace;font-size:32px;font-weight:800;letter-spacing:6px;color:#1a73e8;line-height:1.2;">${escapeHtml(value)}</span>
    <span style="display:block;margin-top:6px;font-size:11px;font-weight:600;color:#5f6368;text-transform:uppercase;letter-spacing:1px;">Security Verification Code</span>
  </div>`;

const button = (href, label) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:12px 0 24px;">
    <tr>
      <td style="border-radius:8px;background-color:#1a73e8;">
        <a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;background-color:#1a73e8;">${escapeHtml(label)}</a>
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
        paragraph("Welcome to Attendance Live! Enter this 6-digit code to activate your account and verify your identity:"),
        highlightBox(code),
        paragraph("This verification code expires in <strong>15 minutes</strong>."),
        note("If you didn&#039;t create an account with Attendance Live, you can safely ignore this email."),
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
        paragraph("We received a request to reset your password for your Attendance Live account. Click the button below to choose a new one:"),
        button(resetLink, "Reset password"),
        paragraph("This link expires in <strong>30 minutes</strong> and can only be used once."),
        fallbackLink(resetLink),
        note("If you didn&#039;t request a password reset, you can safely ignore this email. Your password won&#039;t change."),
      ].join(""),
    }),
    text: [
      "Reset your password",
      "",
      "We received a request to reset your password for Attendance Live. Open this link to choose a new one:",
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
    subject: "Your Attendance Live professor account is ready",
    html: layout({
      preheader: "Your professor account is ready. Sign in with the temporary password inside.",
      heading: "Welcome to Attendance Live",
      content: [
        paragraph("An administrator created an Attendance Live professor account for you. Sign in with this email address and the temporary password below:"),
        highlightBox(tempPassword),
        button(APP_URL, "Sign in to Attendance Live"),
        paragraph("You&#039;ll be asked to choose your own secure password right after signing in."),
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
