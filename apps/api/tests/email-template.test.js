// apps/api/tests/email-template.test.js
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test("Email Service Template & Branding Verification", async (t) => {
  const emailServicePath = path.resolve(__dirname, "../src/services/email.service.js");
  const emailServiceContent = fs.readFileSync(emailServicePath, "utf-8");

  await t.test("Uses Attendance Live branding instead of Attendance Tracker", () => {
    assert.match(emailServiceContent, /FROM = `Attendance Live <\${FROM_ADDRESS}>`/);
    assert.match(emailServiceContent, /Reset your Attendance Live password/);
    assert.match(emailServiceContent, /Your Attendance Live verification code/);
    assert.match(emailServiceContent, /Your Attendance Live professor account/);
    assert.doesNotMatch(emailServiceContent, /FROM = `Attendance Tracker/);
  });

  await t.test("Uses #1a73e8 Google Blue brand color instead of #4f46e5 indigo", () => {
    assert.match(emailServiceContent, /BRAND_COLOR = "#1a73e8"/);
    assert.doesNotMatch(emailServiceContent, /BRAND_COLOR = "#4f46e5"/);
  });

  await t.test("Renders consistent card header with brand gradient and typography", () => {
    assert.match(emailServiceContent, /linear-gradient\(135deg,#1a73e8 0%,#1557b0 100%\)/);
    assert.match(emailServiceContent, /Attendance Live/);
    assert.match(emailServiceContent, /Classroom/);
  });

  await t.test("Includes rounded pill button and accessible typography", () => {
    assert.match(emailServiceContent, /border-radius:24px/);
    assert.match(emailServiceContent, /'Google Sans',Roboto/);
  });

  await t.test("Includes fallback link, 30-minute expiration notice, and security disclaimer", () => {
    assert.match(emailServiceContent, /Button not working\? Copy and paste this link into your browser:/);
    assert.match(emailServiceContent, /This link expires in <strong>30 minutes<\/strong> and can only be used once\./);
    assert.match(emailServiceContent, /If you didn't request a password reset, you can safely ignore this email\./);
  });

  await t.test("Escapes dynamic content to prevent HTML injection", () => {
    assert.match(emailServiceContent, /function escapeHtml/);
  });
});
