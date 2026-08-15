import * as usersRepository from "../repositories/users.repository.js";

export async function requirePasswordChange(req, res, next) {
  try {
    const user = await usersRepository.findById(req.user.sub);
    if (user?.must_change_password) {
      return res
        .status(403)
        .json({ error: "You must change your password before continuing" });
    }
    next();
  } catch (error) {
    console.error("requirePasswordChange error:", error);
    res.status(500).json({ error: "Failed to verify account status" });
  }
}
