import crypto from "crypto";
import * as classesRepository from "../repositories/classes.repository.js";
import { httpError } from "../utils/http-error.js";

const JOIN_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const JOIN_CODE_LENGTH = 6;
const MAX_JOIN_CODE_ATTEMPTS = 5;
const UNIQUE_VIOLATION = "23505";

function generateJoinCode() {
  let code = "";
  for (let i = 0; i < JOIN_CODE_LENGTH; i++) {
    code += JOIN_CODE_ALPHABET[crypto.randomInt(JOIN_CODE_ALPHABET.length)];
  }
  return code;
}

export async function createClass(professorId, name, semester, section) {
  for (let attempt = 0; attempt < MAX_JOIN_CODE_ATTEMPTS; attempt++) {
    const joinCode = generateJoinCode();
    try {
      return await classesRepository.createClass(
        professorId,
        name,
        semester,
        section,
        joinCode,
      );
    } catch (error) {
      if (error.code === UNIQUE_VIOLATION) {
        if (error.constraint === "classes_join_code_key") continue;
        if (error.constraint === "classes_professor_name_semester_section_key") {
          throw httpError(
            409,
            "You already have a class with this name, semester, and section",
          );
        }
      }
      throw error;
    }
  }
  throw httpError(500, "Could not generate a unique join code — please try again");
}


export async function listClasses(professorId) {
  return classesRepository.findByProfessor(professorId);
}
