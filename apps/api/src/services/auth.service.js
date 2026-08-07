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

export async function login(email, password) {
  const user = await usersRepository.findByEmail(email);

  if (!user) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  if (!user.is_active) {
    const error = new Error("This account has been deactivated");
    error.status = 403;
    throw error;
  }

  const token = issueToken(user);
  const { password_hash, ...safeUser } = user;
  return { user: safeUser, token };
}
