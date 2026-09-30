// apps/api/src/schemas/auth.schema.js
import { z } from "zod";

export const passwordComplexitySchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(72, "Password must not exceed 72 characters")
  .regex(/[A-Z]/, "Password must have at least 1 upper case.")
  .regex(/[a-z]/, "Password must have at least 1 lower case.")
  .regex(/[0-9]/, "Password must have at least 1 number.");

export const registerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: passwordComplexitySchema,
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordComplexitySchema,
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: passwordComplexitySchema,
});

export const googleLoginSchema = z.object({
  credential: z.string().min(1, "Google credential is required"),
});
