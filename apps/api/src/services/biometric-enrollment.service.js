import * as enrollmentsRepository from "../repositories/biometric-enrollments.repository.js";
import * as usersRepository from "../repositories/users.repository.js";
import { enroll } from "../integrations/liveness/client.js";
import { httpError } from "../utils/http-error.js";

export async function enrollStudent(studentId, livenessResult) {
  const student = await usersRepository.findById(studentId);
  if (!student) {
    throw httpError(404, "Student not found");
  }

  const saasEnrollment = await enroll(livenessResult, student.full_name);
  const enrollment = await enrollmentsRepository.replaceActiveEnrollment(studentId, saasEnrollment.id);

  return enrollment;
}
