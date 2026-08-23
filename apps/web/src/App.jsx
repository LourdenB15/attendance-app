// apps/web/src/App.jsx
import { useState, useEffect, useCallback } from "react";
import {
  authApi,
  adminApi,
  classesApi,
  sessionsApi,
  studentApi,
  livenessApi,
} from "./api";
import { LivenessCamera } from "./LivenessCamera";

export default function App() {
  // Global auth state
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [globalMessage, setGlobalMessage] = useState(null);

  // Active tab / navigation state
  const [authTab, setAuthTab] = useState("login"); // "login" | "register" | "forgot" | "reset"
  const [adminTab, setAdminTab] = useState("users"); // "users" | "create-prof"
  const [profTab, setProfTab] = useState("classes"); // "classes" | "class-detail"
  const [studentTab, setStudentTab] = useState("classes"); // "classes" | "enroll-face" | "check-in" | "history"

  // Form states
  const [loginForm, setLoginForm] = useState({ email: "", password: "", googleCredential: "" });
  const [registerForm, setRegisterForm] = useState({ fullName: "", email: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetForm, setResetForm] = useState({ token: "", newPassword: "" });
  const [changePasswordForm, setChangePasswordForm] = useState({ currentPassword: "", newPassword: "" });

  // Admin states
  const [userList, setUserList] = useState([]);
  const [adminRoleFilter, setAdminRoleFilter] = useState("ALL");
  const [createProfForm, setCreateProfForm] = useState({ fullName: "", email: "" });

  // Professor states
  const [professorClasses, setProfessorClasses] = useState([]);
  const [createClassForm, setCreateClassForm] = useState({ name: "", semester: "", section: "" });
  const [selectedClass, setSelectedClass] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [openSessionForm, setOpenSessionForm] = useState({ durationMinutes: 60, label: "" });
  const [activeSession, setActiveSession] = useState(null);
  const [sessionAttendance, setSessionAttendance] = useState([]);
  const [overrideForm, setOverrideForm] = useState({ studentId: "", status: "PRESENT", reason: "" });
  const [editingClass, setEditingClass] = useState(null);

  // Student states
  const [studentClasses, setStudentClasses] = useState([]);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [checkInSessionId, setCheckInSessionId] = useState("");
  const [showFaceEnrollCamera, setShowFaceEnrollCamera] = useState(false);
  const [showCheckInCamera, setShowCheckInCamera] = useState(false);
  const [isFaceEnrolled, setIsFaceEnrolled] = useState(false);

  // Helper for message banners
  const showMessage = useCallback((type, text) => {
    setGlobalMessage({ type, text });
  }, []);

  const clearMessage = useCallback(() => {
    setGlobalMessage(null);
  }, []);

  const loadAdminUsers = useCallback(async (role) => {
    try {
      const users = await adminApi.getUsers(role);
      setUserList(users);
    } catch (err) {
      showMessage("error", err.message);
    }
  }, [showMessage]);

  const loadProfessorClasses = useCallback(async () => {
    try {
      const classes = await classesApi.getClasses();
      setProfessorClasses(classes);
    } catch (err) {
      showMessage("error", err.message);
    }
  }, [showMessage]);

  const loadStudentClasses = useCallback(async () => {
    try {
      const classes = await studentApi.getMyClasses();
      setStudentClasses(classes);
    } catch (err) {
      showMessage("error", err.message);
    }
  }, [showMessage]);

  const loadStudentAttendance = useCallback(async () => {
    try {
      const att = await studentApi.getMyAttendance();
      setStudentAttendance(att);
    } catch (err) {
      showMessage("error", err.message);
    }
  }, [showMessage]);

  // 1. Session check on boot
  useEffect(() => {
    async function checkSession() {
      try {
        const user = await authApi.getMe();
        setCurrentUser(user);
      } catch {
        setCurrentUser(null);
      } finally {
        setAuthLoading(false);
      }
    }
    checkSession();
  }, []);

  // 2. Load role-specific data when user changes
  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      if (!currentUser) return;

      if (currentUser.role === "ADMIN") {
        try {
          const users = await adminApi.getUsers(adminRoleFilter);
          if (!ignore) setUserList(users);
        } catch (err) {
          if (!ignore) showMessage("error", err.message);
        }
      } else if (currentUser.role === "PROFESSOR") {
        try {
          const classes = await classesApi.getClasses();
          if (!ignore) setProfessorClasses(classes);
        } catch (err) {
          if (!ignore) showMessage("error", err.message);
        }
      } else if (currentUser.role === "STUDENT") {
        try {
          const [classes, att] = await Promise.all([
            studentApi.getMyClasses(),
            studentApi.getMyAttendance(),
          ]);
          if (!ignore) {
            setStudentClasses(classes);
            setStudentAttendance(att);
          }
        } catch (err) {
          if (!ignore) showMessage("error", err.message);
        }
      }
    }

    fetchData();
    return () => {
      ignore = true;
    };
  }, [currentUser, adminRoleFilter, showMessage]);

  const handleCreateProfessor = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createProfessor(createProfForm);
      showMessage("success", `Professor account created for ${createProfForm.email}. An invitation email with temporary password has been sent.`);
      setCreateProfForm({ fullName: "", email: "" });
      loadAdminUsers(adminRoleFilter);
      setAdminTab("users");
    } catch (err) {
      showMessage("error", err.message);
    }
  };

  const handleDeactivateUser = async (userId) => {
    if (!window.confirm("Are you sure you want to deactivate this user?")) return;
    try {
      await adminApi.deactivateUser(userId);
      showMessage("success", "User deactivated successfully.");
      loadAdminUsers(adminRoleFilter);
    } catch (err) {
      showMessage("error", err.message);
    }
  };



  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      const created = await classesApi.createClass(createClassForm);
      showMessage("success", `Class "${created.name}" created! Join Code: ${created.join_code}`);
      setCreateClassForm({ name: "", semester: "", section: "" });
      loadProfessorClasses();
    } catch (err) {
      showMessage("error", err.message);
    }
  };

  const handleUpdateClass = async (e) => {
    e.preventDefault();
    if (!editingClass) return;
    try {
      await classesApi.updateClass(editingClass.id, {
        name: editingClass.name,
        semester: editingClass.semester,
        section: editingClass.section,
      });
      showMessage("success", "Class updated successfully.");
      setEditingClass(null);
      loadProfessorClasses();
    } catch (err) {
      showMessage("error", err.message);
    }
  };

  const handleArchiveClass = async (classId) => {
    if (!window.confirm("Are you sure you want to archive this class?")) return;
    try {
      await classesApi.archiveClass(classId);
      showMessage("success", "Class archived successfully.");
      loadProfessorClasses();
      if (selectedClass && selectedClass.id === classId) {
        setSelectedClass(null);
        setProfTab("classes");
      }
    } catch (err) {
      showMessage("error", err.message);
    }
  };

  const handleSelectClass = async (cls) => {
    setSelectedClass(cls);
    setProfTab("class-detail");
    loadClassStudents(cls.id);
  };

  const loadClassStudents = async (classId) => {
    try {
      const students = await classesApi.getClassStudents(classId);
      setClassStudents(students);
    } catch (err) {
      showMessage("error", err.message);
    }
  };

  const handleDropStudent = async (studentId) => {
    if (!selectedClass) return;
    if (!window.confirm("Are you sure you want to drop this student from the class?")) return;
    try {
      await classesApi.dropStudent(selectedClass.id, studentId);
      showMessage("success", "Student dropped from class.");
      loadClassStudents(selectedClass.id);
    } catch (err) {
      showMessage("error", err.message);
    }
  };

  const handleOpenSession = async (e) => {
    e.preventDefault();
    if (!selectedClass) return;
    try {
      const session = await sessionsApi.openSession({
        classId: selectedClass.id,
        durationMinutes: Number(openSessionForm.durationMinutes) || 60,
        label: openSessionForm.label || undefined,
      });
      setActiveSession(session);
      showMessage("success", `Attendance session opened! Session ID: ${session.id}`);
      loadSessionAttendance(session.id);
    } catch (err) {
      showMessage("error", err.message);
    }
  };

  const handleCloseSession = async () => {
    if (!activeSession) return;
    try {
      await sessionsApi.closeSession(activeSession.id);
      showMessage("success", "Attendance session closed.");
      setActiveSession(null);
      setSessionAttendance([]);
    } catch (err) {
      showMessage("error", err.message);
    }
  };

  const loadSessionAttendance = async (sessionId) => {
    try {
      const att = await sessionsApi.getSessionAttendance(sessionId);
      setSessionAttendance(att);
    } catch (err) {
      showMessage("error", err.message);
    }
  };

  const handleManualOverride = async (e) => {
    e.preventDefault();
    if (!activeSession) return;
    try {
      await sessionsApi.overrideAttendance(activeSession.id, {
        studentId: overrideForm.studentId,
        status: overrideForm.status,
        reason: overrideForm.reason || undefined,
      });
      showMessage("success", "Attendance override recorded.");
      setOverrideForm({ studentId: "", status: "PRESENT", reason: "" });
      loadSessionAttendance(activeSession.id);
    } catch (err) {
      showMessage("error", err.message);
    }
  };



  const handleJoinClass = async (e) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    try {
      await studentApi.joinClass(joinCodeInput.trim().toUpperCase());
      showMessage("success", "Successfully enrolled into class!");
      setJoinCodeInput("");
      loadStudentClasses();
      loadStudentAttendance();
    } catch (err) {
      showMessage("error", err.message);
    }
  };

  const handleFaceEnrollmentSuccess = async (livenessResult) => {
    setShowFaceEnrollCamera(false);
    try {
      await livenessApi.enrollBiometric(livenessResult);
      setIsFaceEnrolled(true);
      showMessage("success", "Biometric face enrolled successfully!");
    } catch (err) {
      showMessage("error", err.message);
    }
  };

  const handleCheckInSuccess = async (livenessResult) => {
    setShowCheckInCamera(false);
    if (!checkInSessionId.trim()) {
      showMessage("error", "Please provide a valid Session ID before scanning.");
      return;
    }
    try {
      const result = await livenessApi.checkIn(checkInSessionId.trim(), livenessResult);
      if (result.present) {
        showMessage("success", "Check-in successful! Attendance marked as PRESENT.");
      } else {
        showMessage("error", result.message || "Face not recognized. Check-in failed.");
      }
      loadStudentAttendance();
    } catch (err) {
      showMessage("error", err.message);
    }
  };

  // Auth form submissions
  const handleLogin = async (e) => {
    e.preventDefault();
    clearMessage();
    try {
      const user = await authApi.login({
        email: loginForm.email,
        password: loginForm.password,
      });
      setCurrentUser(user);
      showMessage("success", `Welcome back, ${user.full_name}!`);
    } catch (err) {
      showMessage("error", err.message);
    }
  };

  const handleGoogleLogin = async (e) => {
    e.preventDefault();
    clearMessage();
    if (!loginForm.googleCredential.trim()) {
      showMessage("error", "Please enter a Google ID Token credential.");
      return;
    }
    try {
      const user = await authApi.loginWithGoogle(loginForm.googleCredential.trim());
      setCurrentUser(user);
      showMessage("success", `Google sign-in successful! Welcome, ${user.full_name}.`);
    } catch (err) {
      showMessage("error", err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    clearMessage();
    try {
      const user = await authApi.register({
        fullName: registerForm.fullName,
        email: registerForm.email,
        password: registerForm.password,
      });
      setCurrentUser(user);
      showMessage("success", `Account created! Welcome, ${user.full_name}.`);
    } catch (err) {
      showMessage("error", err.message);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    clearMessage();
    try {
      const res = await authApi.forgotPassword(forgotEmail);
      showMessage("info", res.message || "If registered, a password reset link has been dispatched.");
      setForgotEmail("");
    } catch (err) {
      showMessage("error", err.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearMessage();
    try {
      await authApi.resetPassword({
        token: resetForm.token,
        newPassword: resetForm.newPassword,
      });
      showMessage("success", "Password reset successfully! You can now log in with your new password.");
      setResetForm({ token: "", newPassword: "" });
      setAuthTab("login");
    } catch (err) {
      showMessage("error", err.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    clearMessage();
    try {
      await authApi.changePassword(changePasswordForm);
      showMessage("success", "Password changed successfully!");
      setChangePasswordForm({ currentPassword: "", newPassword: "" });
      // Update currentUser to clear must_change_password flag
      setCurrentUser((prev) => ({ ...prev, must_change_password: false }));
    } catch (err) {
      showMessage("error", err.message);
    }
  };

  const handleLogout = async () => {
    clearMessage();
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      setCurrentUser(null);
      setSelectedClass(null);
      setActiveSession(null);
      showMessage("info", "Logged out successfully.");
    }
  };

  // Loading view
  if (authLoading) {
    return (
      <div style={{ padding: "24px", fontFamily: "sans-serif" }}>
        <h2>Loading Attendance Tracker...</h2>
        <p>Checking authentication session...</p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // UNAUTHENTICATED VIEWS
  // -------------------------------------------------------------
  if (!currentUser) {
    return (
      <div style={{ maxWidth: "600px", margin: "32px auto", padding: "16px", fontFamily: "sans-serif" }}>
        <header>
          <h1>Attendance Tracker with Liveness</h1>
          <p>Active Liveness & Face Identity Verification System</p>
        </header>

        {globalMessage && (
          <div
            style={{
              padding: "12px",
              margin: "12px 0",
              border: "1px solid",
              borderColor:
                globalMessage.type === "error"
                  ? "red"
                  : globalMessage.type === "success"
                  ? "green"
                  : "blue",
              backgroundColor:
                globalMessage.type === "error"
                  ? "#ffe6e6"
                  : globalMessage.type === "success"
                  ? "#e6ffe6"
                  : "#e6f2ff",
            }}
          >
            <strong>[{globalMessage.type.toUpperCase()}]:</strong> {globalMessage.text}
          </div>
        )}

        {/* Auth Navigation */}
        <nav style={{ marginBottom: "16px" }}>
          <button
            type="button"
            onClick={() => { setAuthTab("login"); clearMessage(); }}
            style={{ fontWeight: authTab === "login" ? "bold" : "normal", marginRight: "8px" }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setAuthTab("register"); clearMessage(); }}
            style={{ fontWeight: authTab === "register" ? "bold" : "normal", marginRight: "8px" }}
          >
            Student Sign Up
          </button>
          <button
            type="button"
            onClick={() => { setAuthTab("forgot"); clearMessage(); }}
            style={{ fontWeight: authTab === "forgot" ? "bold" : "normal", marginRight: "8px" }}
          >
            Forgot Password
          </button>
          <button
            type="button"
            onClick={() => { setAuthTab("reset"); clearMessage(); }}
            style={{ fontWeight: authTab === "reset" ? "bold" : "normal" }}
          >
            Reset Password (Token)
          </button>
        </nav>

        {/* Tab 1: Login */}
        {authTab === "login" && (
          <fieldset>
            <legend><strong>Account Login</strong></legend>
            <form onSubmit={handleLogin}>
              <div style={{ margin: "10px 0" }}>
                <label htmlFor="login-email">Email:</label><br />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  style={{ width: "100%", padding: "6px" }}
                />
              </div>
              <div style={{ margin: "10px 0" }}>
                <label htmlFor="login-password">Password:</label><br />
                <input
                  id="login-password"
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  style={{ width: "100%", padding: "6px" }}
                />
              </div>
              <button type="submit" style={{ padding: "8px 16px" }}>Log In</button>
            </form>

            <hr style={{ margin: "20px 0" }} />

            <form onSubmit={handleGoogleLogin}>
              <h4>Or Sign In with Google (Student)</h4>
              <div style={{ margin: "10px 0" }}>
                <label htmlFor="google-credential">Google Credential (ID Token):</label><br />
                <input
                  id="google-credential"
                  type="text"
                  placeholder="Paste Google JWT credential..."
                  value={loginForm.googleCredential}
                  onChange={(e) => setLoginForm({ ...loginForm, googleCredential: e.target.value })}
                  style={{ width: "100%", padding: "6px" }}
                />
              </div>
              <button type="submit" style={{ padding: "6px 12px" }}>Sign In with Google</button>
            </form>
          </fieldset>
        )}

        {/* Tab 2: Register (Student) */}
        {authTab === "register" && (
          <fieldset>
            <legend><strong>Student Registration</strong></legend>
            <form onSubmit={handleRegister}>
              <div style={{ margin: "10px 0" }}>
                <label htmlFor="reg-fullname">Full Name:</label><br />
                <input
                  id="reg-fullname"
                  type="text"
                  required
                  value={registerForm.fullName}
                  onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                  style={{ width: "100%", padding: "6px" }}
                />
              </div>
              <div style={{ margin: "10px 0" }}>
                <label htmlFor="reg-email">Email:</label><br />
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  style={{ width: "100%", padding: "6px" }}
                />
              </div>
              <div style={{ margin: "10px 0" }}>
                <label htmlFor="reg-password">Password (min 8 characters):</label><br />
                <input
                  id="reg-password"
                  type="password"
                  required
                  minLength={8}
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  style={{ width: "100%", padding: "6px" }}
                />
              </div>
              <button type="submit" style={{ padding: "8px 16px" }}>Register Student Account</button>
            </form>
          </fieldset>
        )}

        {/* Tab 3: Forgot Password */}
        {authTab === "forgot" && (
          <fieldset>
            <legend><strong>Request Password Reset</strong></legend>
            <form onSubmit={handleForgotPassword}>
              <div style={{ margin: "10px 0" }}>
                <label htmlFor="forgot-email">Registered Email Address:</label><br />
                <input
                  id="forgot-email"
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  style={{ width: "100%", padding: "6px" }}
                />
              </div>
              <button type="submit" style={{ padding: "8px 16px" }}>Send Reset Link</button>
            </form>
          </fieldset>
        )}

        {/* Tab 4: Reset Password */}
        {authTab === "reset" && (
          <fieldset>
            <legend><strong>Reset Password using Token</strong></legend>
            <form onSubmit={handleResetPassword}>
              <div style={{ margin: "10px 0" }}>
                <label htmlFor="reset-token">Reset Token:</label><br />
                <input
                  id="reset-token"
                  type="text"
                  required
                  placeholder="Paste token from email link..."
                  value={resetForm.token}
                  onChange={(e) => setResetForm({ ...resetForm, token: e.target.value })}
                  style={{ width: "100%", padding: "6px" }}
                />
              </div>
              <div style={{ margin: "10px 0" }}>
                <label htmlFor="reset-newpassword">New Password (min 8 characters):</label><br />
                <input
                  id="reset-newpassword"
                  type="password"
                  required
                  minLength={8}
                  value={resetForm.newPassword}
                  onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
                  style={{ width: "100%", padding: "6px" }}
                />
              </div>
              <button type="submit" style={{ padding: "8px 16px" }}>Set New Password</button>
            </form>
          </fieldset>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED HEADER & ROLE VIEWS
  // -------------------------------------------------------------
  return (
    <div style={{ maxWidth: "900px", margin: "20px auto", padding: "16px", fontFamily: "sans-serif" }}>
      {/* Top Application Header */}
      <header style={{ borderBottom: "2px solid #ccc", paddingBottom: "12px", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0 }}>Attendance Tracker</h2>
            <small>
              Signed in as: <strong>{currentUser.full_name}</strong> ({currentUser.email}) | Role:{" "}
              <mark><strong>{currentUser.role}</strong></mark>
            </small>
          </div>
          <button type="button" onClick={handleLogout} style={{ padding: "6px 12px" }}>
            Logout
          </button>
        </div>
      </header>

      {/* Global Status / Alert Banner */}
      {globalMessage && (
        <div
          style={{
            padding: "10px",
            margin: "10px 0",
            border: "1px solid",
            borderColor:
              globalMessage.type === "error"
                ? "red"
                : globalMessage.type === "success"
                ? "green"
                : "blue",
            backgroundColor:
              globalMessage.type === "error"
                ? "#ffe6e6"
                : globalMessage.type === "success"
                ? "#e6ffe6"
                : "#e6f2ff",
          }}
        >
          <strong>[{globalMessage.type.toUpperCase()}]:</strong> {globalMessage.text}
          <button
            type="button"
            onClick={clearMessage}
            style={{ float: "right", background: "none", border: "none", cursor: "pointer" }}
          >
            ✖
          </button>
        </div>
      )}

      {/* Mandatory Change Password Panel (If Admin generated temp password) */}
      {currentUser.must_change_password && (
        <fieldset style={{ borderColor: "orange", backgroundColor: "#fffdf0", margin: "16px 0" }}>
          <legend><strong>⚠️ Mandatory Action: Update Temporary Password</strong></legend>
          <p>Your account was initialized with a temporary password. You must set a new password to continue.</p>
          <form onSubmit={handleChangePassword}>
            <div style={{ margin: "8px 0" }}>
              <label htmlFor="must-change-curr">Current Temporary Password:</label><br />
              <input
                id="must-change-curr"
                type="password"
                required
                value={changePasswordForm.currentPassword}
                onChange={(e) => setChangePasswordForm({ ...changePasswordForm, currentPassword: e.target.value })}
                style={{ padding: "6px", width: "300px" }}
              />
            </div>
            <div style={{ margin: "8px 0" }}>
              <label htmlFor="must-change-new">New Password (min 8 characters):</label><br />
              <input
                id="must-change-new"
                type="password"
                required
                minLength={8}
                value={changePasswordForm.newPassword}
                onChange={(e) => setChangePasswordForm({ ...changePasswordForm, newPassword: e.target.value })}
                style={{ padding: "6px", width: "300px" }}
              />
            </div>
            <button type="submit" style={{ padding: "6px 14px" }}>Save New Password</button>
          </form>
        </fieldset>
      )}

      {/* ========================================================= */}
      {/* 1. ADMIN ROLE VIEW                                        */}
      {/* ========================================================= */}
      {currentUser.role === "ADMIN" && (
        <main>
          <h3>Admin Management Console</h3>
          <nav style={{ marginBottom: "16px" }}>
            <button
              type="button"
              onClick={() => setAdminTab("users")}
              style={{ fontWeight: adminTab === "users" ? "bold" : "normal", marginRight: "8px" }}
            >
              User Directory
            </button>
            <button
              type="button"
              onClick={() => setAdminTab("create-prof")}
              style={{ fontWeight: adminTab === "create-prof" ? "bold" : "normal" }}
            >
              + Create Professor
            </button>
          </nav>

          {adminTab === "create-prof" && (
            <fieldset>
              <legend><strong>Create New Professor Account</strong></legend>
              <form onSubmit={handleCreateProfessor}>
                <div style={{ margin: "10px 0" }}>
                  <label htmlFor="prof-name">Full Name:</label><br />
                  <input
                    id="prof-name"
                    type="text"
                    required
                    value={createProfForm.fullName}
                    onChange={(e) => setCreateProfForm({ ...createProfForm, fullName: e.target.value })}
                    style={{ width: "320px", padding: "6px" }}
                  />
                </div>
                <div style={{ margin: "10px 0" }}>
                  <label htmlFor="prof-email">Email Address:</label><br />
                  <input
                    id="prof-email"
                    type="email"
                    required
                    value={createProfForm.email}
                    onChange={(e) => setCreateProfForm({ ...createProfForm, email: e.target.value })}
                    style={{ width: "320px", padding: "6px" }}
                  />
                </div>
                <button type="submit" style={{ padding: "8px 16px" }}>Create & Send Temp Password</button>
              </form>
            </fieldset>
          )}

          {adminTab === "users" && (
            <div>
              <div style={{ margin: "10px 0", display: "flex", gap: "10px", alignItems: "center" }}>
                <label htmlFor="admin-role-filter"><strong>Filter by Role:</strong></label>
                <select
                  id="admin-role-filter"
                  value={adminRoleFilter}
                  onChange={(e) => {
                    setAdminRoleFilter(e.target.value);
                    loadAdminUsers(e.target.value);
                  }}
                  style={{ padding: "4px 8px" }}
                >
                  <option value="ALL">All Roles</option>
                  <option value="PROFESSOR">Professors</option>
                  <option value="STUDENT">Students</option>
                  <option value="ADMIN">Admins</option>
                </select>
                <button type="button" onClick={() => loadAdminUsers(adminRoleFilter)}>Refresh Users</button>
              </div>

              <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
                <thead>
                  <tr style={{ background: "#eee" }}>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userList.length === 0 ? (
                    <tr>
                      <td colSpan="6" align="center">No users found.</td>
                    </tr>
                  ) : (
                    userList.map((u) => (
                      <tr key={u.id}>
                        <td>{u.full_name}</td>
                        <td>{u.email}</td>
                        <td><strong>{u.role}</strong></td>
                        <td>{u.is_active ? <span style={{ color: "green" }}>ACTIVE</span> : <span style={{ color: "red" }}>DEACTIVATED</span>}</td>
                        <td>{new Date(u.created_at).toLocaleDateString()}</td>
                        <td>
                          {u.is_active && u.id !== currentUser.id && (
                            <button
                              type="button"
                              onClick={() => handleDeactivateUser(u.id)}
                              style={{ color: "red", cursor: "pointer" }}
                            >
                              Deactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      )}

      {/* ========================================================= */}
      {/* 2. PROFESSOR ROLE VIEW                                    */}
      {/* ========================================================= */}
      {currentUser.role === "PROFESSOR" && (
        <main>
          <h3>Professor Portal</h3>
          <nav style={{ marginBottom: "16px" }}>
            <button
              type="button"
              onClick={() => { setProfTab("classes"); setSelectedClass(null); }}
              style={{ fontWeight: profTab === "classes" ? "bold" : "normal", marginRight: "8px" }}
            >
              My Classes
            </button>
            {selectedClass && (
              <button
                type="button"
                onClick={() => setProfTab("class-detail")}
                style={{ fontWeight: profTab === "class-detail" ? "bold" : "normal" }}
              >
                Class: {selectedClass.name} ({selectedClass.section})
              </button>
            )}
          </nav>

          {/* Tab: Classes List & Create */}
          {profTab === "classes" && (
            <div>
              {/* Create Class Form */}
              <fieldset style={{ marginBottom: "20px" }}>
                <legend><strong>Create New Class</strong></legend>
                <form onSubmit={handleCreateClass} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <div>
                    <label htmlFor="class-name">Class Name:</label><br />
                    <input
                      id="class-name"
                      type="text"
                      required
                      placeholder="e.g. CS101"
                      value={createClassForm.name}
                      onChange={(e) => setCreateClassForm({ ...createClassForm, name: e.target.value })}
                      style={{ padding: "6px" }}
                    />
                  </div>
                  <div>
                    <label htmlFor="class-semester">Semester:</label><br />
                    <input
                      id="class-semester"
                      type="text"
                      required
                      placeholder="e.g. Fall 2026"
                      value={createClassForm.semester}
                      onChange={(e) => setCreateClassForm({ ...createClassForm, semester: e.target.value })}
                      style={{ padding: "6px" }}
                    />
                  </div>
                  <div>
                    <label htmlFor="class-section">Section:</label><br />
                    <input
                      id="class-section"
                      type="text"
                      required
                      placeholder="e.g. Sec-A"
                      value={createClassForm.section}
                      onChange={(e) => setCreateClassForm({ ...createClassForm, section: e.target.value })}
                      style={{ padding: "6px" }}
                    />
                  </div>
                  <div style={{ alignSelf: "flex-end" }}>
                    <button type="submit" style={{ padding: "8px 16px" }}>Create Class</button>
                  </div>
                </form>
              </fieldset>

              {/* Edit Class Modal / Panel */}
              {editingClass && (
                <fieldset style={{ marginBottom: "20px", background: "#f9f9f9" }}>
                  <legend><strong>Edit Class: {editingClass.name}</strong></legend>
                  <form onSubmit={handleUpdateClass} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <div>
                      <label htmlFor="edit-name">Name:</label><br />
                      <input
                        id="edit-name"
                        type="text"
                        value={editingClass.name}
                        onChange={(e) => setEditingClass({ ...editingClass, name: e.target.value })}
                        style={{ padding: "6px" }}
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-semester">Semester:</label><br />
                      <input
                        id="edit-semester"
                        type="text"
                        value={editingClass.semester}
                        onChange={(e) => setEditingClass({ ...editingClass, semester: e.target.value })}
                        style={{ padding: "6px" }}
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-section">Section:</label><br />
                      <input
                        id="edit-section"
                        type="text"
                        value={editingClass.section}
                        onChange={(e) => setEditingClass({ ...editingClass, section: e.target.value })}
                        style={{ padding: "6px" }}
                      />
                    </div>
                    <div style={{ alignSelf: "flex-end" }}>
                      <button type="submit" style={{ padding: "6px 12px", marginRight: "6px" }}>Save Changes</button>
                      <button type="button" onClick={() => setEditingClass(null)}>Cancel</button>
                    </div>
                  </form>
                </fieldset>
              )}

              {/* Classes Table */}
              <h4>Your Created Classes</h4>
              <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#eee" }}>
                    <th>Name</th>
                    <th>Semester</th>
                    <th>Section</th>
                    <th>Join Code</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {professorClasses.length === 0 ? (
                    <tr>
                      <td colSpan="6" align="center">No classes created yet.</td>
                    </tr>
                  ) : (
                    professorClasses.map((cls) => (
                      <tr key={cls.id}>
                        <td><strong>{cls.name}</strong></td>
                        <td>{cls.semester}</td>
                        <td>{cls.section}</td>
                        <td>
                          <code style={{ fontSize: "1.1em", fontWeight: "bold", color: "#0066cc" }}>
                            {cls.join_code}
                          </code>
                        </td>
                        <td>{cls.is_archived ? <span style={{ color: "gray" }}>ARCHIVED</span> : <span style={{ color: "green" }}>ACTIVE</span>}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleSelectClass(cls)}
                            style={{ marginRight: "6px" }}
                          >
                            Manage Class
                          </button>
                          {!cls.is_archived && (
                            <>
                              <button
                                type="button"
                                onClick={() => setEditingClass(cls)}
                                style={{ marginRight: "6px" }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleArchiveClass(cls.id)}
                                style={{ color: "red" }}
                              >
                                Archive
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab: Class Detail & Session Management */}
          {profTab === "class-detail" && selectedClass && (
            <div>
              <div style={{ background: "#f0f4f8", padding: "12px", marginBottom: "16px", borderRadius: "4px" }}>
                <h4 style={{ margin: 0 }}>
                  {selectedClass.name} — Section: {selectedClass.section} ({selectedClass.semester})
                </h4>
                <p style={{ margin: "4px 0 0" }}>
                  Student Join Code: <strong>{selectedClass.join_code}</strong> | Status:{" "}
                  {selectedClass.is_archived ? "ARCHIVED" : "ACTIVE"}
                </p>
              </div>

              {/* 1. Open Session Section */}
              {!selectedClass.is_archived && (
                <fieldset style={{ marginBottom: "20px" }}>
                  <legend><strong>Open Attendance Session</strong></legend>
                  {activeSession ? (
                    <div style={{ backgroundColor: "#e6ffe6", padding: "10px", border: "1px solid green" }}>
                      <p>
                        🟢 <strong>Session is currently OPEN!</strong><br />
                        <strong>Session ID:</strong> <code>{activeSession.id}</code><br />
                        <strong>Label:</strong> {activeSession.label || "(No label)"}<br />
                        <strong>Expires At:</strong> {new Date(activeSession.expires_at).toLocaleTimeString()}
                      </p>
                      <button type="button" onClick={handleCloseSession} style={{ padding: "6px 12px", color: "red" }}>
                        Close Session Now
                      </button>
                      <button
                        type="button"
                        onClick={() => loadSessionAttendance(activeSession.id)}
                        style={{ marginLeft: "10px", padding: "6px 12px" }}
                      >
                        🔄 Refresh Live Attendance
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleOpenSession} style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                      <div>
                        <label htmlFor="sess-duration">Duration (Minutes):</label><br />
                        <input
                          id="sess-duration"
                          type="number"
                          min="1"
                          max="1440"
                          required
                          value={openSessionForm.durationMinutes}
                          onChange={(e) => setOpenSessionForm({ ...openSessionForm, durationMinutes: e.target.value })}
                          style={{ padding: "6px", width: "120px" }}
                        />
                      </div>
                      <div>
                        <label htmlFor="sess-label">Session Label (optional):</label><br />
                        <input
                          id="sess-label"
                          type="text"
                          placeholder="e.g. Lecture 1 - Introduction"
                          value={openSessionForm.label}
                          onChange={(e) => setOpenSessionForm({ ...openSessionForm, label: e.target.value })}
                          style={{ padding: "6px", width: "240px" }}
                        />
                      </div>
                      <button type="submit" style={{ padding: "8px 16px" }}>Open Session</button>
                    </form>
                  )}
                </fieldset>
              )}

              {/* 2. Live Session Attendance & Manual Overrides */}
              {activeSession && (
                <div style={{ marginBottom: "24px" }}>
                  <h4>Live Session Attendance Roster</h4>
                  <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse", marginBottom: "12px" }}>
                    <thead>
                      <tr style={{ background: "#eee" }}>
                        <th>Student Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Source</th>
                        <th>Recorded At</th>
                        <th>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessionAttendance.length === 0 ? (
                        <tr>
                          <td colSpan="6" align="center">No enrolled students in this class yet.</td>
                        </tr>
                      ) : (
                        sessionAttendance.map((rec) => (
                          <tr key={rec.student_id}>
                            <td>{rec.full_name}</td>
                            <td>{rec.email}</td>
                            <td>
                              <strong>
                                {rec.status === "PRESENT" ? (
                                  <span style={{ color: "green" }}>PRESENT</span>
                                ) : (
                                  <span style={{ color: "red" }}>ABSENT</span>
                                )}
                              </strong>
                            </td>
                            <td>{rec.source || "—"}</td>
                            <td>{rec.recorded_at ? new Date(rec.recorded_at).toLocaleTimeString() : "—"}</td>
                            <td>{rec.override_reason || "—"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {/* Manual Override Form */}
                  <fieldset>
                    <legend><strong>Manual Attendance Override</strong></legend>
                    <form onSubmit={handleManualOverride} style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-end" }}>
                      <div>
                        <label htmlFor="ovr-student">Select Student:</label><br />
                        <select
                          id="ovr-student"
                          required
                          value={overrideForm.studentId}
                          onChange={(e) => setOverrideForm({ ...overrideForm, studentId: e.target.value })}
                          style={{ padding: "6px" }}
                        >
                          <option value="">-- Choose Student --</option>
                          {sessionAttendance.map((s) => (
                            <option key={s.student_id} value={s.student_id}>
                              {s.full_name} ({s.status})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="ovr-status">Override Status:</label><br />
                        <select
                          id="ovr-status"
                          value={overrideForm.status}
                          onChange={(e) => setOverrideForm({ ...overrideForm, status: e.target.value })}
                          style={{ padding: "6px" }}
                        >
                          <option value="PRESENT">PRESENT</option>
                          <option value="ABSENT">ABSENT</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="ovr-reason">Reason (optional):</label><br />
                        <input
                          id="ovr-reason"
                          type="text"
                          placeholder="e.g. Excused medical absence"
                          value={overrideForm.reason}
                          onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
                          style={{ padding: "6px", width: "200px" }}
                        />
                      </div>
                      <button type="submit" style={{ padding: "6px 14px" }}>Save Override</button>
                    </form>
                  </fieldset>
                </div>
              )}

              {/* 3. Enrolled Students Table */}
              <h4>Enrolled Students ({classStudents.length})</h4>
              <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#eee" }}>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Enrolled Via</th>
                    <th>Status</th>
                    <th>Joined On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classStudents.length === 0 ? (
                    <tr>
                      <td colSpan="6" align="center">No students currently enrolled. Share join code: <strong>{selectedClass.join_code}</strong></td>
                    </tr>
                  ) : (
                    classStudents.map((s) => (
                      <tr key={s.student_id}>
                        <td>{s.full_name}</td>
                        <td>{s.email}</td>
                        <td>{s.enrolled_via}</td>
                        <td>{s.status}</td>
                        <td>{new Date(s.enrolled_at).toLocaleDateString()}</td>
                        <td>
                          {s.status === "ACTIVE" && (
                            <button
                              type="button"
                              onClick={() => handleDropStudent(s.student_id)}
                              style={{ color: "red" }}
                            >
                              Drop Student
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      )}

      {/* ========================================================= */}
      {/* 3. STUDENT ROLE VIEW                                      */}
      {/* ========================================================= */}
      {currentUser.role === "STUDENT" && (
        <main>
          <h3>Student Portal</h3>
          <nav style={{ marginBottom: "16px" }}>
            <button
              type="button"
              onClick={() => setStudentTab("classes")}
              style={{ fontWeight: studentTab === "classes" ? "bold" : "normal", marginRight: "8px" }}
            >
              My Classes
            </button>
            <button
              type="button"
              onClick={() => setStudentTab("enroll-face")}
              style={{ fontWeight: studentTab === "enroll-face" ? "bold" : "normal", marginRight: "8px" }}
            >
              Biometric Face Setup
            </button>
            <button
              type="button"
              onClick={() => setStudentTab("check-in")}
              style={{ fontWeight: studentTab === "check-in" ? "bold" : "normal", marginRight: "8px" }}
            >
              Check-In to Session
            </button>
            <button
              type="button"
              onClick={() => { setStudentTab("history"); loadStudentAttendance(); }}
              style={{ fontWeight: studentTab === "history" ? "bold" : "normal" }}
            >
              Attendance History
            </button>
          </nav>

          {/* Student Tab 1: Classes & Join Form */}
          {studentTab === "classes" && (
            <div>
              {/* Join Class Form */}
              <fieldset style={{ marginBottom: "20px" }}>
                <legend><strong>Join a Class</strong></legend>
                <form onSubmit={handleJoinClass} style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                  <div>
                    <label htmlFor="join-code">6-Character Join Code:</label><br />
                    <input
                      id="join-code"
                      type="text"
                      maxLength={12}
                      required
                      placeholder="e.g. ABC123"
                      value={joinCodeInput}
                      onChange={(e) => setJoinCodeInput(e.target.value)}
                      style={{ padding: "6px", textTransform: "uppercase", width: "160px" }}
                    />
                  </div>
                  <button type="submit" style={{ padding: "8px 16px" }}>Join Class</button>
                </form>
              </fieldset>

              <h4>Enrolled Classes</h4>
              <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#eee" }}>
                    <th>Class Name</th>
                    <th>Semester</th>
                    <th>Section</th>
                    <th>Join Code</th>
                    <th>Enrolled At</th>
                  </tr>
                </thead>
                <tbody>
                  {studentClasses.length === 0 ? (
                    <tr>
                      <td colSpan="5" align="center">You have not joined any classes yet. Enter a join code above to enroll.</td>
                    </tr>
                  ) : (
                    studentClasses.map((c) => (
                      <tr key={c.class_id}>
                        <td><strong>{c.name}</strong></td>
                        <td>{c.semester}</td>
                        <td>{c.section}</td>
                        <td><code>{c.join_code}</code></td>
                        <td>{new Date(c.enrolled_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Student Tab 2: Biometric Face Enrollment */}
          {studentTab === "enroll-face" && (
            <div>
              <fieldset>
                <legend><strong>Biometric Face Identity Enrollment</strong></legend>
                <p>
                  Before checking in to attendance sessions, you must register your biometric face descriptor.
                  The camera will guide you through active liveness challenges (e.g. blinking, head turns).
                </p>

                {isFaceEnrolled && (
                  <div style={{ color: "green", marginBottom: "12px" }}>
                    ✅ Face descriptor is active and enrolled! You can re-scan below if needed.
                  </div>
                )}

                {showFaceEnrollCamera ? (
                  <LivenessCamera
                    title="Face Enrollment Scanner"
                    onComplete={handleFaceEnrollmentSuccess}
                    onCancel={() => setShowFaceEnrollCamera(false)}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowFaceEnrollCamera(true)}
                    style={{ padding: "10px 20px", fontSize: "1em", cursor: "pointer" }}
                  >
                    📷 Start Face Enrollment Scan
                  </button>
                )}
              </fieldset>
            </div>
          )}

          {/* Student Tab 3: Session Check-In */}
          {studentTab === "check-in" && (
            <div>
              <fieldset>
                <legend><strong>Live Session Check-In</strong></legend>
                <p>Enter the Active Session ID provided by your professor and complete the face verification.</p>

                <div style={{ margin: "12px 0" }}>
                  <label htmlFor="chk-session-id"><strong>Session ID (UUID):</strong></label><br />
                  <input
                    id="chk-session-id"
                    type="text"
                    required
                    placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                    value={checkInSessionId}
                    onChange={(e) => setCheckInSessionId(e.target.value)}
                    style={{ width: "380px", padding: "6px" }}
                  />
                </div>

                {showCheckInCamera ? (
                  <LivenessCamera
                    title="Attendance Check-In Face Scan"
                    onComplete={handleCheckInSuccess}
                    onCancel={() => setShowCheckInCamera(false)}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!checkInSessionId.trim()) {
                        showMessage("error", "Please input a Session ID before opening camera.");
                        return;
                      }
                      setShowCheckInCamera(true);
                    }}
                    style={{ padding: "10px 20px", fontSize: "1em", cursor: "pointer" }}
                  >
                    🎥 Start Face Check-In Scan
                  </button>
                )}
              </fieldset>
            </div>
          )}

          {/* Student Tab 4: Attendance History */}
          {studentTab === "history" && (
            <div>
              <h4>My Attendance History</h4>
              <button type="button" onClick={loadStudentAttendance} style={{ marginBottom: "10px" }}>
                🔄 Refresh History
              </button>
              <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#eee" }}>
                    <th>Class</th>
                    <th>Section</th>
                    <th>Session Label</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Source</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {studentAttendance.length === 0 ? (
                    <tr>
                      <td colSpan="7" align="center">No attendance records found yet.</td>
                    </tr>
                  ) : (
                    studentAttendance.map((rec, idx) => (
                      <tr key={rec.session_id || idx}>
                        <td><strong>{rec.class_name}</strong></td>
                        <td>{rec.section}</td>
                        <td>{rec.session_label || "—"}</td>
                        <td>{new Date(rec.opened_at).toLocaleString()}</td>
                        <td>
                          <strong>
                            {rec.status === "PRESENT" ? (
                              <span style={{ color: "green" }}>PRESENT</span>
                            ) : (
                              <span style={{ color: "red" }}>ABSENT</span>
                            )}
                          </strong>
                        </td>
                        <td>{rec.source || "—"}</td>
                        <td>{rec.override_reason || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      )}

      {/* Shared Change Password Form in Footer / Settings */}
      {!currentUser.must_change_password && (
        <footer style={{ marginTop: "40px", borderTop: "1px solid #ccc", paddingTop: "16px" }}>
          <details>
            <summary><strong>Account Settings / Change Password</strong></summary>
            <form onSubmit={handleChangePassword} style={{ marginTop: "10px" }}>
              <div style={{ margin: "6px 0" }}>
                <label htmlFor="settings-curr-pass">Current Password:</label><br />
                <input
                  id="settings-curr-pass"
                  type="password"
                  required
                  value={changePasswordForm.currentPassword}
                  onChange={(e) => setChangePasswordForm({ ...changePasswordForm, currentPassword: e.target.value })}
                  style={{ padding: "4px", width: "240px" }}
                />
              </div>
              <div style={{ margin: "6px 0" }}>
                <label htmlFor="settings-new-pass">New Password (min 8 chars):</label><br />
                <input
                  id="settings-new-pass"
                  type="password"
                  required
                  minLength={8}
                  value={changePasswordForm.newPassword}
                  onChange={(e) => setChangePasswordForm({ ...changePasswordForm, newPassword: e.target.value })}
                  style={{ padding: "4px", width: "240px" }}
                />
              </div>
              <button type="submit" style={{ padding: "6px 12px", marginTop: "6px" }}>Update Password</button>
            </form>
          </details>
        </footer>
      )}
    </div>
  );
}
