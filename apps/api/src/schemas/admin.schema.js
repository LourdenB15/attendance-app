import { z } from "zod";
import { passwordComplexitySchema } from "./auth.schema.js";

export const createProfessorSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: passwordComplexitySchema.optional().or(z.literal("")),
});
