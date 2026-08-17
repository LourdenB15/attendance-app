import * as usersRepository from "../repositories/users.repository.js";

export async function checkAccountStatus(req, res, next) {
  try {
    const user = await usersRepository.findById(req.user.sub);
    if (!user || !user.is_active) {
      return res.status(403).json({ error: "This account has been deactivated" });
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
