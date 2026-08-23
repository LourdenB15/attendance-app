// apps/api/src/utils/http-error.js
export function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}
