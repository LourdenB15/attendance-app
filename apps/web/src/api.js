// apps/web/src/api.js

const API_BASE = "/api";

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include", // send httpOnly JWT cookies automatically
  };

  if (options.body && typeof options.body === "object") {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);

  if (response.status === 204) {
    return null;
  }

  let data;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message =
      (data && data.error) ||
      (typeof data === "string" && data) ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

// Authentication API
export const authApi = {
  register: (body) => request("/auth/register", { method: "POST", body }),
  verifyEmail: (payload) =>
    request("/auth/verify-email", {
      method: "POST",
      body: typeof payload === "string" ? { code: payload } : payload,
    }),
  resendVerification: (email) =>
    request("/auth/resend-verification", { method: "POST", body: { email } }),
  login: (body) => request("/auth/login", { method: "POST", body }),
  loginWithGoogle: (credential) =>
    request("/auth/google", { method: "POST", body: { credential } }),
  getMe: () => request("/auth/me", { method: "GET" }),
  logout: () => request("/auth/logout", { method: "POST" }),
  changePassword: (body) =>
    request("/auth/change-password", { method: "POST", body }),
  forgotPassword: (email) =>
    request("/auth/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (body) =>
    request("/auth/reset-password", { method: "POST", body }),
};

// Admin API
export const adminApi = {
  getUsers: (role) => {
    const q = role && role !== "ALL" ? `?role=${encodeURIComponent(role)}` : "";
    return request(`/admin/users${q}`, { method: "GET" });
  },
  createProfessor: (body) =>
    request("/admin/professors", { method: "POST", body }),
  updateUserRole: (id, role) =>
    request(`/admin/users/${id}/role`, { method: "PATCH", body: { role } }),
  deactivateUser: (id) =>
    request(`/admin/users/${id}/deactivate`, { method: "POST" }),
  reactivateUser: (id) =>
    request(`/admin/users/${id}/reactivate`, { method: "POST" }),
};

// Classes API (Professor)
export const classesApi = {
  getClasses: () => request("/classes", { method: "GET" }),
  createClass: (body) => request("/classes", { method: "POST", body }),
  updateClass: (id, body) =>
    request(`/classes/${id}`, { method: "PATCH", body }),
  archiveClass: (id) => request(`/classes/${id}/archive`, { method: "POST" }),
  getClassStudents: (classId) =>
    request(`/classes/${classId}/students`, { method: "GET" }),
  dropStudent: (classId, studentId) =>
    request(`/classes/${classId}/students/${studentId}/drop`, {
      method: "POST",
    }),
};

// Sessions & Attendance API (Professor)
export const sessionsApi = {
  getActiveSession: (classId) =>
    request(`/sessions/active?classId=${encodeURIComponent(classId)}`, { method: "GET" }),
  openSession: (body) => request("/sessions", { method: "POST", body }),
  closeSession: (id) => request(`/sessions/${id}/close`, { method: "POST" }),
  getSessionAttendance: (sessionId) =>
    request(`/sessions/${sessionId}/attendance`, { method: "GET" }),
  overrideAttendance: (sessionId, body) =>
    request(`/sessions/${sessionId}/attendance`, { method: "POST", body }),
};

// Student API (Enrollments & Records)
export const studentApi = {
  getMyClasses: () => request("/enrollments", { method: "GET" }),
  joinClass: (joinCode) =>
    request("/enrollments", { method: "POST", body: { joinCode } }),
  getMyAttendance: () => request("/attendance", { method: "GET" }),
};

// Biometric & Check-in API
export const livenessApi = {
  enrollBiometric: (livenessResult) =>
    request("/biometric-enrollments", {
      method: "POST",
      body: livenessResult,
    }),
  checkIn: (sessionId, livenessResult) =>
    request("/check-ins", {
      method: "POST",
      body: { sessionId, ...livenessResult },
    }),
};
