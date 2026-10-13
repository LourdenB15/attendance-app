// apps/api/tests/metadata-nav.test.js
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test("Task 1 & 2: Navigation Logo & Metadata Verification", async (t) => {
  const indexPath = path.resolve(__dirname, "../../web/index.html");
  const indexContent = fs.readFileSync(indexPath, "utf-8");

  const headerPath = path.resolve(__dirname, "../../web/src/components/layout/Header.jsx");
  const headerContent = fs.readFileSync(headerPath, "utf-8");

  const appLayoutPath = path.resolve(__dirname, "../../web/src/components/layout/AppLayout.jsx");
  const appLayoutContent = fs.readFileSync(appLayoutPath, "utf-8");

  await t.test("Navigation Logo is a functional, accessible link to homepage", () => {
    assert.match(headerContent, /onNavigateHome/);
    assert.match(headerContent, /<a[\s\S]*?href="\/"[\s\S]*?aria-label="Attendance Live Home"/);
    assert.match(headerContent, /onClick=\{handleHomeClick\}/);
    assert.match(appLayoutContent, /onNavigateHome=\{\(\) => handleNavSelect\(defaultNav\)\}/);
  });

  await t.test("Metadata contains accurate page title and meta description", () => {
    assert.match(indexContent, /<title>Attendance Live — Smart Classroom Attendance & Biometric Verification<\/title>/);
    assert.match(indexContent, /<meta name="description" content="AI-powered biometric classroom attendance system with active liveness verification, real-time sync, and anti-spoofing protection\." \/>/);
  });

  await t.test("Metadata contains canonical URL pointing to https://www.attendance-app.online/", () => {
    assert.match(indexContent, /<link rel="canonical" href="https:\/\/www\.attendance-app\.online\/" \/>/);
  });

  await t.test("Metadata contains OpenGraph tags consistent with Liveness", () => {
    assert.match(indexContent, /<meta property="og:type" content="website" \/>/);
    assert.match(indexContent, /<meta property="og:url" content="https:\/\/www\.attendance-app\.online\/" \/>/);
    assert.match(indexContent, /<meta property="og:title" content="Attendance Live — Smart Classroom Attendance & Biometric Verification" \/>/);
    assert.match(indexContent, /<meta property="og:image" content="https:\/\/www\.attendance-app\.online\/favicon\.svg" \/>/);
    assert.match(indexContent, /<meta property="og:site_name" content="Attendance Live" \/>/);
  });

  await t.test("Metadata contains Twitter card tags", () => {
    assert.match(indexContent, /<meta name="twitter:card" content="summary" \/>/);
    assert.match(indexContent, /<meta name="twitter:url" content="https:\/\/www\.attendance-app\.online\/" \/>/);
    assert.match(indexContent, /<meta name="twitter:title" content="Attendance Live — Smart Classroom Attendance & Biometric Verification" \/>/);
    assert.match(indexContent, /<meta name="twitter:image" content="https:\/\/www\.attendance-app\.online\/favicon\.svg" \/>/);
  });

  await t.test("Metadata contains mobile theme color and PWA configuration", () => {
    assert.match(indexContent, /<meta name="theme-color" content="#1a73e8" \/>/);
    assert.match(indexContent, /<meta name="apple-mobile-web-app-title" content="Attendance Live" \/>/);
    assert.match(indexContent, /<link rel="apple-touch-icon" href="\/favicon\.svg" \/>/);
  });

  await t.test("Metadata contains robots directive and Schema.org JSON-LD", () => {
    assert.match(indexContent, /<meta name="robots" content="index, follow" \/>/);
    assert.match(indexContent, /"applicationCategory": "EducationalApplication"/);
  });
});
