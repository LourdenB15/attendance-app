import { z } from "zod";

export const joinClassSchema = z.object({
  joinCode: z.string().min(1, "Join code is required").max(12, "Invalid join code"),
});
