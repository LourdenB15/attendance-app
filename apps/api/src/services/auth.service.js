// apps/api/src/services/auth.service.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as usersRepository from "../repositories/users.repository.js";
import crypto from "crypto";
import * as resetTokensRepository from "../repositories/password-reset-tokens.repository.js";
import * as emailVerificationTokensRepository from "../repositories/email-verification-tokens.repository.js";
import * as emailService from "./email.service.js";
import { httpError } from "../utils/http-error.js";
import { OAuth2Client } from "google-auth-library";

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret";
const SALT_ROUNDS = 10;
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
const VERIFY_CODE_TTL_MS = 15 * 60 * 1000; // 15 minutes for 6-digit code
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

function issueToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "24h",
  });
}

function generate6DigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function register(fullName, email, password) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await usersRepository.createUser(
    fullName,
    email,
    passwordHash,
    "STUDENT",
    false,
    false, // is_email_verified = false
  );

  // Generate 6-Digit OTP Code
  const code = generate6DigitCode();
  const codeHash = crypto.createHash("sha256").update(code).digest("hex");
  const expiresAt = new Date(Date.now() + VERIFY_CODE_TTL_MS);

  await emailVerificationTokensRepository.addToken(user.id, codeHash, expiresAt);
  await emailService.sendVerificationEmail(user.email, code);

  return {
    message: "Registration successful! Enter the 6-digit code sent to your email to activate your account.",
    email: user.email,
  };
}

export async function verifyEmail({ email, code, token }) {
  const inputCode = code || token;
  if (!inputCode) {
    throw httpError(400, "Verification code is required");
  }

  const codeHash = crypto.createHash("sha256").update(inputCode.trim()).digest("hex");

  let record = await emailVerificationTokensRepository.findByTokenHash(codeHash);

  // If not found by direct hash and email is provided, check user's latest token
  if (!record && email) {
    const user = await usersRepository.findByEmail(email.trim());
    if (user) {
      const latest = await emailVerificationTokensRepository.findLatestUnusedByUser(user.id);
      if (latest && latest.token_hash === codeHash) {
        record = latest;
      }
    }
  }

  const invalid =
    !record || record.used_at || new Date(record.expires_at) < new Date();
  if (invalid) {
    throw httpError(400, "Invalid or expired 6-digit verification code");
  }

  const user = await usersRepository.setEmailVerified(record.user_id);
  await emailVerificationTokensRepository.markUsed(record.id);

  const sessionToken = issueToken(user);
  const { password_hash, ...safeUser } = user;
  return { user: safeUser, token: sessionToken };
}

export async function resendVerification(email) {
  const user = await usersRepository.findByEmail(email.trim());
  if (!user) {
    return { message: "If an account exists, a new 6-digit verification code was sent." };
  }

  if (user.is_email_verified) {
    throw httpError(400, "This email is already verified. You can log in directly.");
  }

  const code = generate6DigitCode();
  const codeHash = crypto.createHash("sha256").update(code).digest("hex");
  const expiresAt = new Date(Date.now() + VERIFY_CODE_TTL_MS);

  await emailVerificationTokensRepository.addToken(user.id, codeHash, expiresAt);
  await emailService.sendVerificationEmail(user.email, code);

  return { message: "A new 6-digit verification code has been dispatched." };
}

export async function login(email, password) {
  const user = await usersRepository.findByEmail(email);

  if (!user || !user.password_hash) {
    throw httpError(401, "Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw httpError(401, "Invalid credentials");
  }

  if (!user.is_active) {
    throw httpError(403, "This account has been deactivated");
  }

  if (user.role === "STUDENT" && user.is_email_verified === false) {
    throw httpError(403, "Please verify your email before logging in. Enter the 6-digit code sent to your inbox.");
  }

  const token = issueToken(user);
  const { password_hash, ...safeUser } = user;
  return { user: safeUser, token };
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await usersRepository.findById(userId);
  if (!user) {
    throw httpError(404, "User not found");
  }

  if (user.password_hash) {
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      throw httpError(401, "Current password is incorrect");
    }
  }

  if (currentPassword === newPassword) {
    throw httpError(400, "New password must be different from the current password");
  }

  const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await usersRepository.updatePassword(userId, newPasswordHash);
}

export async function forgotPassword(email) {
  const user = await usersRepository.findByEmail(email);
  if (!user) return;

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await resetTokensRepository.addToken(user.id, tokenHash, expiresAt);
  await emailService.sendPasswordResetEmail(user.email, token);
}

export async function resetPassword(token, newPassword) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const record = await resetTokensRepository.findByTokenHash(tokenHash);

  const invalid =
    !record || record.used_at || new Date(record.expires_at) < new Date();
  if (invalid) {
    throw httpError(400, "Invalid or expired reset token");
  }

  const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await usersRepository.updatePassword(record.user_id, newPasswordHash);
  await resetTokensRepository.markUsed(record.id);
}

export async function getCurrentUser(userId) {
  const user = await usersRepository.findById(userId);
  if (!user) {
    throw httpError(404, "User not found");
  }
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

export async function loginWithGoogle(idToken) {
  const clientId = process.env.GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw httpError(500, "Google sign-in is not configured on the server (GOOGLE_CLIENT_ID is missing in apps/api/.env)");
  }

  const client = new OAuth2Client(clientId);
  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: clientId,
    });
    payload = ticket.getPayload();
  } catch (err) {
    console.error("verifyIdToken error:", err);
    throw httpError(401, "Invalid Google credential");
  }

  if (!payload.email_verified) {
    throw httpError(403, "Google account email is not verified");
  }

  const { sub: googleId, email, name } = payload;

  let user = await usersRepository.findByGoogleId(googleId);

  if (!user) {
    const existing = await usersRepository.findByEmail(email);
    if (existing) {
      user = await usersRepository.linkGoogleAccount(existing.id, googleId);
    } else {
      const adminEmail = process.env.ADMIN_EMAIL;
      const initialRole =
        adminEmail && email.toLowerCase() === adminEmail.toLowerCase()
          ? "ADMIN"
          : "STUDENT";
      user = await usersRepository.createGoogleUser(name, email, googleId, initialRole);
    }
  }

  if (!user.is_active) {
    throw httpError(403, "This account has been deactivated");
  }

  const token = issueToken(user);
  const { password_hash, ...safeUser } = user;
  return { user: safeUser, token };
}
