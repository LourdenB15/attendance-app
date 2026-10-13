// apps/api/tests/verify-email.test.js
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test("Task 4: Six-Digit Email Verification Backspace & Navigation Logic", async (t) => {
  const componentPath = path.resolve(__dirname, "../../web/src/components/auth/VerifyEmailView.jsx");
  const content = fs.readFileSync(componentPath, "utf-8");

  await t.test("Backspace clears current digit when populated and maintains focus", () => {
    assert.match(content, /if \(e\.key === "Backspace"\) \{[\s\S]*?if \(digits\[index\]\) \{[\s\S]*?newDigits\[index\] = ""/);
  });

  await t.test("Backspace moves focus to previous input and clears it when current input is empty", () => {
    assert.match(content, /else if \(index > 0\) \{[\s\S]*?newDigits\[index - 1\] = ""[\s\S]*?inputRefs\.current\[index - 1\]\?\.focus\(\)/);
  });

  await t.test("Backspace prevents default event to prevent unintended browser back navigation", () => {
    assert.match(content, /if \(e\.key === "Backspace"\) \{\s*e\.preventDefault\(\);/);
  });

  await t.test("Arrow keys navigate left and right between inputs", () => {
    assert.match(content, /if \(e\.key === "ArrowLeft" && index > 0\)/);
    assert.match(content, /if \(e\.key === "ArrowRight" && index < 5\)/);
  });

  await t.test("Delete key clears populated value without navigating", () => {
    assert.match(content, /if \(e\.key === "Delete"\)/);
  });

  await t.test("onKeyDown passes SyntheticEvent e to handleKeyDown rather than e.key string", () => {
    assert.match(content, /onKeyDown=\{\(e\) => handleKeyDown\(idx, e\)\}/);
  });

  await t.test("Typing over an existing single digit overwrites it with the new digit", () => {
    assert.match(content, /if \(cleanVal\.length === 2 && digits\[index\]\) \{[\s\S]*?const char = cleanVal\.charAt\(cleanVal\.length - 1\);[\s\S]*?newDigits\[index\] = char;/);
  });

  await t.test("Pasting a 6-digit code distributes digits across all inputs and auto-submits", () => {
    assert.match(content, /handlePaste = \(e\) =>/);
    assert.match(content, /pasteDigits\.length === 6[\s\S]*?submitCode\(newDigits\.join\(""\)\)/);
  });

  await t.test("Inputs have one-time-code autocomplete and accessible labels", () => {
    assert.match(content, /autoComplete="one-time-code"/);
    assert.match(content, /aria-label=\{`Digit \$\{idx \+ 1\} of 6`\}/);
    assert.match(content, /maxLength=\{2\}/);
  });
});
