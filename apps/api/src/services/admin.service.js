// apps/api/src/services/admin.service.js
import bcrypt from "bcrypt";
import crypto from "crypto";
import * as usersRepository from "../repositories/users.repository.js";
import * as emailService from "./email.service.js";
import { httpError } from "../utils/http-error.js";
import { normalizeEmail } from "../utils/normalize-email.js";

const SALT_ROUNDS = 10;
const VALID_ROLES = ["ADMIN", "PROFESSOR", "STUDENT"];

// Makes sure the admin from ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD can sign in.
// Safe to run on every start:
// - no account yet:            create it with ADMIN_PASSWORD
// - account has no password:   set ADMIN_PASSWORD (e.g. it was created via Google)
// - account has a password:    leave it alone, so the admin's own password sticks
// Either way the admin must choose a new password at first sign-in, because
// ADMIN_PASSWORD is readable by anyone with access to the server settings.
export async function ensureAdminAccount() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.warn("ADMIN_NAME, ADMIN_EMAIL or ADMIN_PASSWORD is not set. Skipping admin setup.");
    return;
  }

  const email = normalizeEmail(ADMIN_EMAIL);
  const existing = await usersRepository.findByEmail(email);

  if (!existing) {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);
    await usersRepository.createUser(ADMIN_NAME, email, passwordHash, "ADMIN", true, true);
    console.log(`Admin account created for ${email}.`);
    return;
  }

  if (existing.role !== "ADMIN") {
    console.warn(`ADMIN_EMAIL ${email} belongs to a ${existing.role} account. Not changing it.`);
    return;
  }

  if (!existing.password_hash) {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);
    await usersRepository.setPasswordRequiringChange(existing.id, passwordHash);
    console.log(`Admin ${email} had no password, so ADMIN_PASSWORD was set.`);
  }
}

export async function createProfessor(fullName, email) {
  const tempPassword = crypto.randomBytes(12).toString("base64url");
  const passwordHash = await bcrypt.hash(tempPassword, SALT_ROUNDS);

  const user = await usersRepository.createUser(
    fullName,
    email,
    passwordHash,
    "PROFESSOR",
    true,
    true,
  );

  await emailService.sendTempPasswordEmail(user.email, tempPassword);
  return user;
}

export async function listUsers(role) {
  return usersRepository.findAll(role);
}

export async function updateUserRole(callerId, userId, newRole) {
  if (!VALID_ROLES.includes(newRole)) {
    throw httpError(400, `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}`);
  }

  if (callerId === userId && newRole !== "ADMIN") {
    throw httpError(400, "You cannot demote your own administrator account");
  }

  const updated = await usersRepository.updateRole(userId, newRole);
  if (!updated) {
    throw httpError(404, "User not found");
  }
  return updated;
}

export async function deactivateUser(callerId, userId) {
  if (callerId === userId) {
    throw httpError(400, "You cannot deactivate your own account");
  }
  const updated = await usersRepository.setActive(userId, false);
  if (!updated) {
    throw httpError(404, "User not found");
  }
  return updated;
}

export async function reactivateUser(userId) {
  const updated = await usersRepository.setActive(userId, true);
  if (!updated) {
    throw httpError(404, "User not found");
  }
  return updated;
}
