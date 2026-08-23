// apps/web/src/components/layout/AppLayout.jsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Header } from "./Header";
import { MustChangePasswordBanner } from "../auth/MustChangePasswordBanner";
import { AdminPortal } from "../admin/AdminPortal";
import { ProfessorPortal } from "../professor/ProfessorPortal";
import { StudentPortal } from "../student/StudentPortal";

export function AppLayout() {
  const { currentUser, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
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

        {currentUser.role === "ADMIN" && <AdminPortal />}
        {currentUser.role === "PROFESSOR" && <ProfessorPortal />}
        {currentUser.role === "STUDENT" && <StudentPortal />}
      </main>

      {/* Account Settings / Password Change Footer */}
      {!currentUser.must_change_password && (
        <footer className="bg-white border-t border-slate-200 py-6 mt-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <details className="group">
              <summary className="cursor-pointer text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-800 list-none flex items-center gap-1.5">
                <span className="group-open:rotate-90 transition-transform inline-block">▸</span> Account Settings / Change Password
              </summary>
              <form onSubmit={handleChangePassword} className="mt-4 flex flex-wrap gap-3 items-end max-w-xl">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    New Password (min 8 chars)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition"
                >
                  {loading ? "Saving..." : "Update Password"}
                </button>
              </form>
            </details>
          </div>
        </footer>
      )}
    </div>
  );
}
