import bcrypt from "bcrypt";
import crypto from "crypto";
import * as usersRepository from "../repositories/users.repository.js";
import * as emailService from "./email.service.js";

const SALT_ROUNDS = 10;

export async function createProfessor(fullName, email) {
  const tempPassword = crypto.randomBytes(12).toString("base64url");
  const passwordHash = await bcrypt.hash(tempPassword, SALT_ROUNDS);

  const user = await usersRepository.createUser(
    fullName,
    email,
    passwordHash,
    "PROFESSOR",
    true,
  );

  await emailService.sendTempPasswordEmail(user.email, tempPassword);
  return user;
}
