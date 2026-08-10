import * as enrollmentService from "../services/biometric-enrollment.service.js";
import { enrollBiometricSchema } from "../schemas/biometric-enrollment.schema.js";

export async function enrollBiometric(req, res) {
  const validation = enrollBiometricSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }

  try {
    const enrollment = await enrollmentService.enrollStudent(
      req.user.sub,
      validation.data,
    );

    res.status(201).json({
      id: enrollment.id,
      status: enrollment.status,
      enrolledAt: enrollment.enrolled_at,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error("Biometric enrollment error:", error);
    res.status(500).json({ error: "Failed to enroll biometric" });
  }
}
