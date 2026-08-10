import axios from "axios";

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
    const error = new Error(
      "Liveness integration is not configured — set LIVENESS_API_KEY and LIVENESS_API_URL",
    );
    error.status = 500;
    throw error;
  }

  try {
    const response = await http.post(path, body);
    return response.data;
  } catch (err) {
    if (err.response) {
      const error = new Error(
        err.response.data?.error || "Liveness service request failed",
      );
      error.status = 502;
      throw error;
    }
    const error = new Error("Liveness service is unreachable");
    error.status = 503;
    throw error;
  }
}

export function enroll(livenessResult, name) {
  return post("/enroll", { name, ...livenessResult });
}

export function verifyOne(livenessResult, targetId) {
  return post("/verify-one", { ...livenessResult, targetId });
}
