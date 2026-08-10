import axios from "axios";
import { httpError } from "../../utils/http-error.js";

const API_KEY = process.env.LIVENESS_API_KEY;
const API_URL = process.env.LIVENESS_API_URL;
const TIMEOUT_MS = 10_000;

const http = axios.create({
  baseURL: API_URL,
  timeout: TIMEOUT_MS,
  headers: { "x-api-key": API_KEY },
});

async function post(path, body) {
  if (!API_KEY || !API_URL) {
    throw httpError(500, "Liveness integration is not configured — set LIVENESS_API_KEY and LIVENESS_API_URL");
  }

  try {
    const response = await http.post(path, body);
    return response.data;
  } catch (err) {
    if (err.response) {
      throw httpError(502, err.response.data?.error || "Liveness service request failed");
    }
    throw httpError(503, "Liveness service is unreachable");
  }
}

export function enroll(livenessResult, name) {
  return post("/enroll", { name, ...livenessResult });
}

export function verifyOne(livenessResult, targetId) {
  return post("/verify-one", { ...livenessResult, targetId });
}
