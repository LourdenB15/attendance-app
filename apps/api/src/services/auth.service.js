// apps/api/src/services/auth.service.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as usersRepository from "../repositories/users.repository.js";
import { httpError } from "../utils/http-error.js";
import { OAuth2Client } from "google-auth-library";

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret";
const SALT_ROUNDS = 10;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

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

  const token = issueToken(user);
  const { password_hash: _hash, ...safeUser } = user;
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
    throw httpError(400, "New password must be different from current password");
  }

  const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await usersRepository.updatePassword(userId, newPasswordHash);
}

export async function getCurrentUser(userId) {
  const user = await usersRepository.findById(userId);
  if (!user) {
    throw httpError(404, "User not found");
  }
  const { password_hash: _hash, ...safeUser } = user;
  return safeUser;
}

export async function loginWithGoogle(idToken) {
  if (!GOOGLE_CLIENT_ID || !googleClient) {
    throw httpError(500, "Google sign-in is not configured on the server");
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    throw httpError(401, "Invalid Google credential");
  }

  if (!payload || !payload.email_verified) {
    throw httpError(403, "Google account email is not verified");
  }

  const { sub: googleId, email, name } = payload;
  let user = await usersRepository.findByGoogleId(googleId);

  if (!user) {
    const existing = await usersRepository.findByEmail(email);
    if (existing) {
      if (existing.role !== "STUDENT") {
        throw httpError(403, "Google sign-in is only available for student accounts");
      }
      user = await usersRepository.linkGoogleAccount(existing.id, googleId);
    } else {
      user = await usersRepository.createGoogleStudent(name, email, googleId);
    }
  }

  if (user.role !== "STUDENT") {
    throw httpError(403, "Google sign-in is only available for student accounts");
  }

  const token = issueToken(user);
  const { password_hash: _hash, ...safeUser } = user;
  return { user: safeUser, token };
}
