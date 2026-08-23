import { z } from "zod";

export const openSessionSchema = z.object({
  classId: z.string().uuid("classId must be a valid UUID"),
  durationMinutes: z.number().int().positive().max(1440).optional(),
  label: z.string().max(255).optional(),
});
