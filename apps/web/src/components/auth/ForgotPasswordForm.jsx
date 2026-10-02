// apps/web/src/components/auth/ForgotPasswordForm.jsx
import { useState } from "react";
import { authApi } from "../../api";
import { useToast } from "../../context/useToast";

export function ForgotPasswordForm({ onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
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

      {sent ? (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center space-y-2">
          <h4 className="text-sm font-bold text-indigo-950">Check your email</h4>
          <p className="text-xs text-indigo-900">
            If an account exists for <strong className="font-mono">{email}</strong>, we've sent a
            password reset link. It expires in 30 minutes.
          </p>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline"
          >
            Use a different email
          </button>
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-500">
            Enter your registered email address and we'll send you a password reset link. It expires in 30 minutes.
          </p>
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
        </>
      )}
    </div>
  );
}
