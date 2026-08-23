// apps/web/src/components/auth/ResetPasswordForm.jsx
import { useState } from "react";
import { authApi } from "../../api";
import { useToast } from "../../context/ToastContext";

export function ResetPasswordForm({ onSuccess }) {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword });
      showToast("success", "Password reset successfully! You can now sign in with your new password.");
      setToken("");
      setNewPassword("");
      if (onSuccess) onSuccess();
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
          Reset Token
        </label>
        <input
          type="text"
          required
          placeholder="Paste token from email link..."
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
          New Password (min 8 chars)
        </label>
        <input
          type="password"
          required
          minLength={8}
          placeholder="••••••••"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-xs text-sm transition"
      >
        {loading ? "Updating..." : "Save New Password"}
      </button>
    </form>
  );
}
