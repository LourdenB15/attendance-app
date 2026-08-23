// apps/web/src/components/auth/MustChangePasswordBanner.jsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export function MustChangePasswordBanner() {
  const { currentUser, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!currentUser?.must_change_password) return null;

  const handleSubmit = async (e) => {
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
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6 shadow-sm">
      <h3 className="text-base font-bold text-amber-900 flex items-center gap-2">
        <span>⚠️</span> Action Required: Set Permanent Password
      </h3>
      <p className="text-xs text-amber-700 mt-1 mb-4">
        Your account was initialized with a temporary password by an administrator. Please set a new password to proceed.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-bold uppercase text-amber-800 mb-1">
            Current Temporary Password
          </label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-amber-800 mb-1">
            New Password (min 8 chars)
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-xs transition"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
