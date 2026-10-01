// apps/api/src/services/admin.service.js
import bcrypt from "bcrypt";
import crypto from "crypto";
import * as usersRepository from "../repositories/users.repository.js";
import * as emailService from "./email.service.js";
import { httpError } from "../utils/http-error.js";

const SALT_ROUNDS = 10;
const VALID_ROLES = ["ADMIN", "PROFESSOR", "STUDENT"];

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
