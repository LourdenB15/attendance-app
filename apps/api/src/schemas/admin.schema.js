import { z } from "zod";

export const createProfessorSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
});
