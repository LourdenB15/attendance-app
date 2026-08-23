// apps/api/src/services/admin.service.js
import crypto from "crypto";
import bcrypt from "bcrypt";
import * as usersRepository from "../repositories/users.repository.js";

export async function createProfessor(fullName, email) {
  const temporaryPassword = crypto.randomBytes(6).toString("base64url");
  const passwordHash = await bcrypt.hash(temporaryPassword, 10);

  const user = await usersRepository.createUser(
    fullName,
    email,
    passwordHash,
    "PROFESSOR",
    true, // must_change_password = true
  );

  console.log(`[INVITE EMAIL SIMULATION] Professor ${fullName} (${email}) created. Temporary password: ${temporaryPassword}`);
  return { user, temporaryPassword };
}

export async function listUsers(role) {
  return usersRepository.findAll(role);
}

export async function deactivateUser(userId) {
  return usersRepository.setActive(userId, false);
}
