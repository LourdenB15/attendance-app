import { z } from "zod";

export const checkInSchema = z.object({
  sessionId: z.string().uuid("sessionId must be a valid UUID"),
  descriptor: z.array(z.number()).length(1792, "Descriptor must be exactly 1792 dimensions"),
  sessionToken: z.string().min(1, "Session token is required"),
  timestamp: z.number(),
  challenges: z.array(z.string()).min(1, "Challenges are required"),
  integrity: z.string().min(1, "Integrity hash is required"),
  antiSpoofing: z.any().optional(),
});
