import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import jwt from "jsonwebtoken";

const isDev = process.env.NODE_ENV !== "production";

// Count each signed-in user separately, so students sharing one school network
// (one public IP) don't share a single limit. Anyone not signed in, or with an
// invalid token, is counted by IP. This runs before `authenticate`, so the
// token is checked here.
function userOrIpKey(req) {
  const token = req.cookies?.token;
  if (token) {
    try {
      const { sub } = jwt.verify(token, process.env.JWT_SECRET);
      if (sub) return `user:${sub}`;
    } catch {
      // expired or tampered token: fall back to the IP
    }
  }
  return `ip:${ipKeyGenerator(req.ip)}`;
}

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.API_RATE_LIMIT_MAX) || (isDev ? 5000 : 1500),
  keyGenerator: userOrIpKey,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // Per IP, so it must allow a whole class signing in from one school network
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts, please try again later" },
});

// Key by the email in the request body (normalized like the Zod schemas);
// fall back to the IP when there's no email
function emailOrIpKey(req) {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  return email ? `email:${email}` : `ip:${ipKeyGenerator(req.ip)}`;
}

// Stops password guessing against one account. Only failed logins count, so
// signing in correctly never uses up the limit. Temporary, so nobody can lock
// someone else out for good.
export const loginEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.LOGIN_EMAIL_RATE_LIMIT_MAX) || 10,
  keyGenerator: emailOrIpKey,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many failed sign-in attempts. Please try again in 15 minutes." },
});

// Stops someone flooding an inbox through "forgot password" or "resend code"
export const emailSendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: Number(process.env.EMAIL_SEND_RATE_LIMIT_MAX) || 5,
  keyGenerator: emailOrIpKey,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many emails requested. Please try again later." },
});

