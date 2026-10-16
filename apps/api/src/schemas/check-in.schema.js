import { z } from "zod";

const REQUIRED_ACTIVE_CHALLENGES = ["BLINK", "TURN_LEFT", "TURN_RIGHT"];

export const checkInSchema = z.object({
  sessionId: z.string().uuid("sessionId must be a valid UUID"),
  descriptor: z.array(z.number()).length(128, "Descriptor must be exactly 128 dimensions"),
  sessionToken: z.string().min(1, "Session token is required"),
  timestamp: z.number(),
  challenges: z
    .array(z.string())
    .min(1, "Challenges are required")
    .refine(
      (challenges) =>
        REQUIRED_ACTIVE_CHALLENGES.every((required) => challenges.includes(required)),
      {
        message:
          "Active liveness challenges (BLINK, TURN_LEFT, TURN_RIGHT) are required for attendance check-in",
      },
    ),
  integrity: z.string().min(1, "Integrity hash is required"),
  antiSpoofing: z.any().optional(),
});
