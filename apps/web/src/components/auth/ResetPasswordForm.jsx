// apps/web/src/components/auth/ResetPasswordForm.jsx
import { useState, useEffect } from "react";
import { authApi } from "../../api";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import { PasswordInput } from "../ui/PasswordInput";

export function ResetPasswordForm({ onBackToLogin, onRequestNewLink }) {
  const { resetPassword } = useAuth();
  const [token] = useState(
    () => new URLSearchParams(window.location.search).get("token") || "",
  );
  // Check the emailed link as soon as the page opens: "checking" | "valid" | "invalid"
  const [linkStatus, setLinkStatus] = useState(() => (token ? "checking" : "invalid"));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!token) return;
    let ignore = false;
    authApi
      .validateResetToken(token)
      .then(() => !ignore && setLinkStatus("valid"))
      .catch(() => !ignore && setLinkStatus("invalid"));
    return () => {
      ignore = true;
    };
  }, [token]);

  // Drop the dead token from the address bar so a refresh doesn't reopen this page
  const leaveInvalidLink = (goTo) => {
    window.history.replaceState({}, document.title, window.location.pathname);
    if (goTo) goTo();
  };

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
            onClick={() => leaveInvalidLink(onBackToLogin)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            ← Back to Login
          </button>
        )}
      </div>

      {linkStatus === "checking" && (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500">Checking your reset link...</p>
        </div>
      )}

      {linkStatus === "invalid" && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-center space-y-3">
          <h4 className="text-sm font-bold text-rose-900">This reset link is invalid or has expired</h4>
          <button
            type="button"
            onClick={() => leaveInvalidLink(onRequestNewLink)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition"
          >
            Request a new link
          </button>
        </div>
      )}

      {linkStatus === "valid" && (
        <>
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
        </>
      )}
    </div>
  );
}
