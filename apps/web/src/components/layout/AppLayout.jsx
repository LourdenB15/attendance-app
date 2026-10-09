// apps/web/src/components/layout/AppLayout.jsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/useToast";
import { PasswordInput } from "../ui/PasswordInput";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Modal } from "../ui/Modal";
import { MustChangePasswordBanner } from "../auth/MustChangePasswordBanner";
import { AdminPortal } from "../admin/AdminPortal";
import { ProfessorPortal } from "../professor/ProfessorPortal";
import { StudentPortal } from "../student/StudentPortal";

export function AppLayout() {
  const { currentUser, changePassword } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
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
      {/* Google Classroom Header */}
      <Header
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Google Classroom Collapsible Sidebar Drawer */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentUser={currentUser}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
        <MustChangePasswordBanner />

        {/* Portals load data the API refuses until the password is changed */}
        {!currentUser.must_change_password && (
          <>
            {currentUser.role === "ADMIN" && <AdminPortal />}
            {currentUser.role === "PROFESSOR" && <ProfessorPortal />}
            {currentUser.role === "STUDENT" && <StudentPortal />}
          </>
        )}
      </main>

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
              className="px-4 py-2 text-sm font-medium text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-xs transition"
            >
              {loading ? "Saving..." : hasPassword ? "Update Password" : "Set Password"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Subtle Educational Footer */}
      <footer className="bg-white border-t border-[#dadce0] py-4 text-center text-xs text-[#70757a]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Google Classroom Attendance Tracker • Biometric Liveness Verification</span>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="text-[#1a73e8] hover:underline font-medium"
          >
            {hasPassword ? "Change Password" : "Set Password"}
          </button>
        </div>
      </footer>
    </div>
  );
}
