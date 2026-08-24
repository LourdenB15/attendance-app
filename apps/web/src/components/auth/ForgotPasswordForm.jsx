// apps/web/src/components/auth/ForgotPasswordForm.jsx
import { useState } from "react";
import { authApi } from "../../api";
import { useToast } from "../../context/useToast";

export function ForgotPasswordForm({ onBackToLogin, onGoToReset }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      showToast("info", res.message || "If registered, a reset link has been dispatched.");
      setSent(true);
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Forgot Password</h3>
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
        Enter your registered email address and we'll dispatch a 30-minute password reset link.
      </p>

      {sent ? (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center space-y-3">
          <p className="text-xs text-indigo-900 font-medium">
            Reset link dispatched to <strong className="font-mono">{email}</strong>. Check your inbox!
          </p>
          {onGoToReset && (
            <button
              type="button"
              onClick={onGoToReset}
              className="text-xs bg-indigo-600 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition"
            >
              Have a reset token? Enter it here →
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="name@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-xs text-sm transition"
          >
            {loading ? "Sending..." : "Send Password Reset Link"}
          </button>
        </form>
      )}

      {onGoToReset && !sent && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onGoToReset}
            className="text-xs text-slate-500 hover:text-slate-800 underline"
          >
            Already have a reset token? Click here
          </button>
        </div>
      )}
    </div>
  );
}
