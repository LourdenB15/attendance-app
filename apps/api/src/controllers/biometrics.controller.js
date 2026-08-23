// apps/api/src/controllers/biometrics.controller.js
import * as biometricsService from "../services/biometrics.service.js";

export async function enrollBiometric(req, res) {
  try {
    const result = await biometricsService.enrollBiometric(req.user.sub, req.body);
    res.status(201).json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    console.error("Biometric enrollment error:", error);
    res.status(500).json({ error: "Failed to enroll biometric" });
  }
}

export async function checkIn(req, res) {
  const sessionId = req.params.sessionId || req.body.sessionId;
  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }

  try {
    const result = await biometricsService.checkIn(req.user.sub, sessionId, req.body);
    res.status(200).json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    console.error("Check-in error:", error);
    res.status(500).json({ error: "Failed to verify identity and check in" });
  }
}
