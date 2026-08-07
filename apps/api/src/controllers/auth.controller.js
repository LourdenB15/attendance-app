import * as authService from "../services/auth.service.js";
import { registerSchema, loginSchema, changePasswordSchema, forgotPasswordSchema, resetPasswordSchema } from "../schemas/auth.schema.js";

export async function register(req, res) {
  const validation = registerSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }

  const { fullName, email, password } = validation.data;

  try {
    const { user, token } = await authService.register(
      fullName,
      email,
      password,
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(201).json({ ...user });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "Email already registered" });
    }
    console.error("Register error:", error);
    res.status(500).json({ error: "Failed to create account" });
  }
}

export async function login(req, res) {
  const validation = loginSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }

  const { email, password } = validation.data;

  try {
    const { user, token } = await authService.login(email, password);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ ...user });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to log in" });
  }
}

export async function changePassword(req, res) {
  const validation = changePasswordSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }

  const { currentPassword, newPassword } = validation.data;

  try {
    await authService.changePassword(req.user.sub, currentPassword, newPassword);
    res.status(204).send();
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error("Change password error:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
}

export async function forgotPassword(req, res) {
  const validation = forgotPasswordSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }
  try {
    await authService.forgotPassword(validation.data.email);
    res.json({ message: "If that email is registered, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function resetPassword(req, res) {
  const validation = resetPasswordSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }
  const { token, newPassword } = validation.data;
  try {
    await authService.resetPassword(token, newPassword);
    res.status(204).send();
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
}
