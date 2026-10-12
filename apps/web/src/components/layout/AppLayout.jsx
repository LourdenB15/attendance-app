import { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/useToast";
import { PasswordInput } from "../ui/PasswordInput";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Modal } from "../ui/Modal";
import { MustChangePasswordBanner } from "../auth/MustChangePasswordBanner";
import { PortalSkeleton } from "../ui/Skeleton";
import { ErrorBoundary } from "../ui/ErrorBoundary";
import {
  getUrlParams,
  updateUrlParams,
  saveSessionState,
  getSessionState,
} from "../../utils/navigation";

// Lazy-loaded role portals with Suspense code splitting
const AdminPortal = lazy(() =>
  import("../admin/AdminPortal").then((m) => ({ default: m.AdminPortal }))
);
const ProfessorPortal = lazy(() =>
  import("../professor/ProfessorPortal").then((m) => ({ default: m.ProfessorPortal }))
);
const StudentPortal = lazy(() =>
  import("../student/StudentPortal").then((m) => ({ default: m.StudentPortal }))
);

const getValidNavs = (userRole) => {
  const r = (userRole || "").toUpperCase();
  switch (r) {
    case "ADMIN":
      return ["users", "create-prof"];
    case "PROFESSOR":
      return ["classes", "archived-classes", "create-class"];
    case "STUDENT":
    default:
      return ["classes", "archived-classes", "enroll-face", "history"];
  }
};

const getDefaultNav = (userRole, isFaceEnrolled) => {
  const r = (userRole || "").toUpperCase();
  switch (r) {
    case "ADMIN":
      return "users";
    case "STUDENT":
      return !isFaceEnrolled ? "enroll-face" : "classes";
    case "PROFESSOR":
    default:
      return "classes";
  }
};

export function AppLayout() {
  const { currentUser, changePassword, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1024,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);

  const role = currentUser?.role?.toUpperCase() || "STUDENT";
  const validNavs = getValidNavs(role);
  const defaultNav = getDefaultNav(role, currentUser?.has_biometric_enrolled);

  const sanitizeNav = useCallback(
    (navCandidate) => {
      return validNavs.includes(navCandidate) ? navCandidate : defaultNav;
    },
    [validNavs, defaultNav],
  );

  // Restore navigation state from URL query params or sessionStorage fallback
  const initialParams = getUrlParams();
  const savedNav = getSessionState(`layout_${role}`);

  const [activeNav, setActiveNav] = useState(() => {
    const rawNav = initialParams.get("nav") || savedNav?.activeNav;
    return sanitizeNav(rawNav);
  });
  const [targetClassId, setTargetClassId] = useState(
    () => initialParams.get("classId") || savedNav?.targetClassId || null
  );
  const [navKey, setNavKey] = useState(0);

  // When user account or role changes, guarantee activeNav is strictly sanitized
  const prevUserIdRef = useRef(currentUser?.id);
  const prevRoleRef = useRef(role);
  useEffect(() => {
    if (prevUserIdRef.current !== currentUser?.id || prevRoleRef.current !== role) {
      prevUserIdRef.current = currentUser?.id;
      prevRoleRef.current = role;
      const currentValid = getValidNavs(role);
      const def = getDefaultNav(role, currentUser?.has_biometric_enrolled);
      const params = getUrlParams();
      const currentParamNav = params.get("nav");
      const cleanNav = currentValid.includes(currentParamNav) ? currentParamNav : def;
      setActiveNav(cleanNav);
      setTargetClassId(null);
      setNavKey((k) => k + 1);
    }
  }, [currentUser?.id, role, currentUser?.has_biometric_enrolled]);

  // Sync state to URL and sessionStorage
  useEffect(() => {
    updateUrlParams(
      {
        nav: activeNav,
        classId: targetClassId || null,
      },
      true
    );
    saveSessionState(`layout_${role}`, {
      activeNav,
      targetClassId,
    });
  }, [activeNav, targetClassId, role]);

  // Handle browser Back / Forward history navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = getUrlParams();
      const raw = params.get("nav");
      const nav = sanitizeNav(raw);
      const classId = params.get("classId") || null;
      setActiveNav(nav);
      setTargetClassId(classId);
      setNavKey((k) => k + 1);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [sanitizeNav]);

  const handleNavSelect = useCallback((navId) => {
    const cleanNav = sanitizeNav(navId);
    if (cleanNav === "classes" || cleanNav === "archived-classes") {
      setTargetClassId(null);
      updateUrlParams({ nav: cleanNav, classId: null }, false);
    } else {
      updateUrlParams({ nav: cleanNav }, false);
    }
    setActiveNav(cleanNav);
    setNavKey((k) => k + 1);
  }, [sanitizeNav]);

  const handleSelectClass = useCallback((cls) => {
    const cid = typeof cls === "object" ? cls.id || cls.class_id : cls;
    setTargetClassId(cid);
    setActiveNav("classes");
    updateUrlParams({ nav: "classes", classId: cid }, false);
    setNavKey((k) => k + 1);
  }, []);

  const handleClearTargetClass = useCallback(() => {
    setTargetClassId(null);
    updateUrlParams({ classId: null }, false);
    setNavKey((k) => k + 1);
  }, []);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // Google sign-ups have no password yet: they set one without a current password
  const hasPassword = currentUser.has_password !== false;

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("error", "New passwords do not match. Please re-enter.");
      return;
    }
    setLoading(true);
    try {
      await changePassword({
        currentPassword: hasPassword ? currentPassword : undefined,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSettingsOpen(false);
    } catch {
      // toast in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#202124] flex flex-col font-sans">
      {/* App Header */}
      <Header
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <div className="flex-1 flex flex-col">
        {/* Navigation Sidebar (sliding drawer with 300ms transition) */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentUser={currentUser}
          activeNav={activeNav}
          onNavSelect={handleNavSelect}
          onSelectClass={handleSelectClass}
          onOpenSettings={() => setSettingsOpen(true)}
          onLogout={logout}
        />

        {/* Main Content Area (smoothly offsets by w-72 when sidebar is open on desktop) */}
        <div
          className={`flex-1 ${
            sidebarOpen ? "lg:pl-72" : "lg:pl-0"
          } flex flex-col min-w-0 transition-all duration-300 ease-in-out`}
        >
          <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
            <MustChangePasswordBanner />

            {/* Portals load data the API refuses until the password is changed */}
            {!currentUser.must_change_password && (
              <ErrorBoundary onReset={() => handleNavSelect(defaultNav)}>
                <Suspense fallback={<PortalSkeleton role={role} />}>
                  {role === "ADMIN" && (
                    <AdminPortal
                      activeNav={activeNav}
                      navKey={navKey}
                      onNavSelect={handleNavSelect}
                    />
                  )}
                  {role === "PROFESSOR" && (
                    <ProfessorPortal
                      activeNav={activeNav}
                      navKey={navKey}
                      onNavSelect={handleNavSelect}
                      targetClassId={targetClassId}
                      onClearTargetClass={handleClearTargetClass}
                    />
                  )}
                  {role === "STUDENT" && (
                    <StudentPortal
                      activeNav={activeNav}
                      navKey={navKey}
                      onNavSelect={handleNavSelect}
                      targetClassId={targetClassId}
                      onClearTargetClass={handleClearTargetClass}
                    />
                  )}
                  {role !== "ADMIN" && role !== "PROFESSOR" && role !== "STUDENT" && (
                    <div className="bg-white rounded-2xl border border-[#dadce0] p-8 text-center max-w-md mx-auto my-12 shadow-xs">
                      <h3 className="text-base font-bold text-[#202124]">
                        Account Initializing
                      </h3>
                      <p className="text-xs text-[#5f6368] mt-1.5 leading-relaxed">
                        Your account role is currently being configured by an administrator. Please try refreshing or sign in again.
                      </p>
                      <button
                        type="button"
                        onClick={logout}
                        className="mt-4 px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </Suspense>
              </ErrorBoundary>
            )}
          </main>
        </div>
      </div>

      {/* Account Settings / Password Change Modal */}
      <Modal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title={hasPassword ? "Account Settings — Change Password" : "Account Settings — Set Password"}
        subtitle="Manage your credentials and login security"
      >
        {!hasPassword && (
          <div className="mb-4 p-3.5 rounded-xl bg-[#e8f0fe] border border-[#d2e3fc] text-xs text-[#1967d2]">
            You signed up with Google. Setting a password enables you to sign in with either Google or your email and password.
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          {hasPassword && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-1.5">
                Current Password
              </label>
              <PasswordInput
                required
                autoComplete="current-password"
                placeholder="Enter current password..."
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-1.5">
              New Password
            </label>
            <PasswordInput
              required
              autoComplete="new-password"
              placeholder="Enter new secure password..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-1.5">
              Confirm New Password
            </label>
            <PasswordInput
              required
              autoComplete="new-password"
              placeholder="Re-type new password..."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e8eaed]">
            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              className="px-4 py-2 text-sm font-medium text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124] rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-xs transition cursor-pointer"
            >
              {loading ? "Saving..." : hasPassword ? "Update Password" : "Set Password"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Educational Footer */}
      <footer className="bg-white border-t border-[#dadce0] py-4 text-center text-xs text-[#70757a]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Attendance Live • AI-Powered Biometric Liveness Verification</span>
          <span>© {new Date().getFullYear()} Attendance Live. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
