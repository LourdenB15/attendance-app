import { z } from "zod";

export const overrideAttendanceSchema = z.object({
  studentId: z.string().uuid("studentId must be a valid UUID"),
  status: z.enum(["PRESENT", "ABSENT"], "status must be PRESENT or ABSENT"),
  reason: z.string().max(255).optional(),
});
