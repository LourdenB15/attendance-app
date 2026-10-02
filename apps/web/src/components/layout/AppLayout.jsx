// apps/web/src/components/layout/AppLayout.jsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/useToast";
import { PasswordInput } from "../ui/PasswordInput";
import { Header } from "./Header";
import { MustChangePasswordBanner } from "../auth/MustChangePasswordBanner";
import { AdminPortal } from "../admin/AdminPortal";
import { ProfessorPortal } from "../professor/ProfessorPortal";
import { StudentPortal } from "../student/StudentPortal";

export function AppLayout() {
  const { currentUser, changePassword } = useAuth();
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
    } catch {
      // toast in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Header />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex-1">
        <MustChangePasswordBanner />

        {/* Portals load data the API refuses until the password is changed, so hide them until then */}
        {!currentUser.must_change_password && (
          <>
            {currentUser.role === "ADMIN" && <AdminPortal />}
            {currentUser.role === "PROFESSOR" && <ProfessorPortal />}
            {currentUser.role === "STUDENT" && <StudentPortal />}
          </>
        )}
      </main>

      {/* Account Settings / Password Change Footer */}
      {!currentUser.must_change_password && (
        <footer className="bg-white border-t border-slate-200 py-6 mt-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <details className="group">
              <summary className="cursor-pointer text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-800 list-none flex items-center gap-1.5">
                <span className="group-open:rotate-90 transition-transform inline-block">▸</span>{" "}
                {hasPassword ? "Account Settings / Change Password" : "Account Settings / Set a Password"}
              </summary>
              {!hasPassword && (
                <p className="mt-3 text-xs text-slate-500 max-w-3xl">
                  You signed up with Google. Set a password to also sign in with your email and password.
                </p>
              )}
              <form
                onSubmit={handleChangePassword}
                className={`mt-4 grid grid-cols-1 gap-3 max-w-3xl ${hasPassword ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
              >
                {hasPassword && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      Current Password
                    </label>
                    <PasswordInput
                      required
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    New Password
                  </label>
                  <PasswordInput
                    required
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Confirm New Password
                  </label>
                  <PasswordInput
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="sm:col-span-full justify-self-start px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition"
                >
                  {loading ? "Saving..." : hasPassword ? "Update Password" : "Set Password"}
                </button>
              </form>
            </details>
          </div>
        </footer>
      )}
    </div>
  );
}
