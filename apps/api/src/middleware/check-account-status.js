import * as usersRepository from "../repositories/users.repository.js";

export async function checkAccountStatus(req, res, next) {
  try {
    const user = await usersRepository.findById(req.user.sub);
    if (!user || !user.is_active) {
      // End the session so the browser is signed out, not just refused
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });
      return res
        .status(403)
        .json({ error: "This account has been deactivated", code: "ACCOUNT_DEACTIVATED" });
    }
    if (user.must_change_password) {
      return res
        .status(403)
        .json({ error: "You must change your password before continuing" });
    }
    next();
  } catch (error) {
    console.error("checkAccountStatus error:", error);
    res.status(500).json({ error: "Failed to verify account status" });
  }
}
