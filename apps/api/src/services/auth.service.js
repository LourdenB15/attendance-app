import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as usersRepository from "../repositories/users.repository.js";
import crypto from "crypto";
import * as resetTokensRepository from "../repositories/password-reset-tokens.repository.js";
import * as emailService from "./email.service.js";
import { httpError } from "../utils/http-error.js";

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

function issueToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "24h",
  });
}

export async function register(fullName, email, password) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await usersRepository.createUser(
    fullName,
    email,
    passwordHash,
    "STUDENT",
    false,
  );

  const token = issueToken(user);
  return { user, token };
}

export async function login(email, password) {
  const user = await usersRepository.findByEmail(email);

  if (!user) {
    throw httpError(401, "Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw httpError(401, "Invalid credentials");
  }

  if (!user.is_active) {
    throw httpError(403, "This account has been deactivated");
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

  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) {
    throw httpError(401, "Current password is incorrect");
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