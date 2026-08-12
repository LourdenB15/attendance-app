import * as checkInService from "../services/check-in.service.js";
import { checkInSchema } from "../schemas/check-in.schema.js";

export async function checkIn(req, res) {
  const validation = checkInSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }

  const { sessionId, ...livenessResult } = validation.data;

  try {
    const result = await checkInService.checkIn(req.user.sub, sessionId, livenessResult);
    if (!result.present) {
      return res.status(200).json({ present: false, message: "Face not recognized" });
    }
    return res.status(200).json({
      present: true,
      overrideProtected: result.overrideProtected,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error("Check-in error:", error);
    res.status(500).json({ error: "Failed to check in" });
  }
}
