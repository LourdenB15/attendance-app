// apps/web/src/components/auth/ResetPasswordForm.jsx
import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import { PasswordInput } from "../ui/PasswordInput";

export function ResetPasswordForm({ onBackToLogin }) {
  const { resetPassword } = useAuth();
  const [token] = useState(
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
      await resetPassword({ token: token.trim(), newPassword });
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch {
      // toast handled in auth context
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
            New Password
          </label>
          <PasswordInput
            required
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
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-xs text-sm transition"
        >
          {loading ? "Updating password..." : "Update Password & Sign In"}
        </button>
      </form>
    </div>
  );
}
