import { z } from "zod";

export const createClassSchema = z.object({
  name: z.string().min(1, "Class name is required").max(255, "Class name is too long"),
  semester: z.string().min(1, "Semester is required").max(12, "Semester is too long"),
  section: z.string().min(1, "Section is required").max(10, "Section is too long"),
});

export const updateClassSchema = z.object({
    name: z.string().min(1, "Class name is required").max(255).optional(),
    semester: z.string().min(1, "Semester is required").max(12).optional(),
    section: z.string().min(1, "Section is required").max(10).optional(),
  })
  .refine((data) => data.name !== undefined || data.semester !== undefined || data.section !== undefined, {
    message: "At least one field (name, semester, section) must be provided",
  });
