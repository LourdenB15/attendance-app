import * as enrollmentsRepository from "../repositories/biometric-enrollments.repository.js";
import * as usersRepository from "../repositories/users.repository.js";
import { enroll } from "../integrations/liveness/client.js";

export async function enrollStudent(studentId, livenessResult) {
  const student = await usersRepository.findById(studentId);
  if (!student) {
    const error = new Error("Student not found");
    error.status = 404;
    throw error;
  }

  const saasEnrollment = await enroll(livenessResult, student.full_name);
  const enrollment = await enrollmentsRepository.replaceActiveEnrollment(studentId, saasEnrollment.id);

  return enrollment;
}
