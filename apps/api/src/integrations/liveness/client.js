import axios from "axios";
import { httpError } from "../../utils/http-error.js";

const TIMEOUT_MS = 15_000;

async function post(path, body) {
  const apiKey = process.env.LIVENESS_API_KEY;
  const rawApiUrl = process.env.LIVENESS_API_URL;

  if (!apiKey || !rawApiUrl) {
    throw httpError(
      500,
      "Liveness integration is not configured — set LIVENESS_API_KEY and LIVENESS_API_URL in apps/api/.env",
    );
  }

  const baseURL = rawApiUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const fullUrl = `${baseURL}${normalizedPath}`;

  try {
    const response = await axios.post(fullUrl, body, {
      timeout: TIMEOUT_MS,
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      const errDetail =
        error.response.data?.error ||
        error.response.data?.message ||
        "Liveness service request failed";
      throw httpError(502, errDetail);
    }
    console.error("Liveness connection error:", error.message);
    throw httpError(503, "Liveness service is unreachable");
  }
}

export function enroll(livenessResult, name) {
  return post("/enroll", { name, ...livenessResult });
}

export function verify(livenessResult, threshold) {
  return post("/verify", { ...livenessResult, threshold });
}

export function verifyOne(livenessResult, targetId) {
  return post("/verify-one", { ...livenessResult, targetId });
}
