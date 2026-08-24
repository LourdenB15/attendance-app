// apps/web/src/components/auth/ResetPasswordForm.jsx
import { useState } from "react";
import { authApi } from "../../api";
import { useToast } from "../../context/useToast";
import { PasswordInput } from "../ui/PasswordInput";

export function ResetPasswordForm({ onSuccess, onBackToLogin }) {
  const [token, setToken] = useState(
    () => new URLSearchParams(window.location.search).get("token") || "",
  );
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token.trim()) {
      showToast("error", "Invalid or missing reset token from email link.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("error", "Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.resetPassword({ token: token.trim(), newPassword });
      showToast(
        "success",
        res.message || "Password reset successfully! Please sign in with your new password.",
      );
      setNewPassword("");
      setConfirmPassword("");
      window.history.replaceState({}, document.title, window.location.pathname);
      if (onSuccess) onSuccess();
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Set New Password</h3>
        {onBackToLogin && (
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            ← Back to Login
          </button>
        )}
      </div>

      <p className="text-xs text-slate-500">
        Enter and confirm your new secure password below to complete the reset.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            New Password (min 8 chars)
          </label>
          <PasswordInput
            required
            minLength={8}
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Confirm New Password
          </label>
          <PasswordInput
            required
            minLength={8}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {!token && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Reset Token (from email link)
            </label>
            <input
              type="text"
              required
              placeholder="Paste token..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-xs text-sm transition"
        >
          {loading ? "Updating password..." : "Update Password & Return to Login"}
        </button>
      </form>
    </div>
  );
}
