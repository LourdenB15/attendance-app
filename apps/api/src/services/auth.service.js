import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as usersRepository from "../repositories/users.repository.js";

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

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
