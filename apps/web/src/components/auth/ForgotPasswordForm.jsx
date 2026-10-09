// apps/web/src/components/auth/ForgotPasswordForm.jsx
import { useState } from "react";
import { authApi } from "../../api";
import { useToast } from "../../context/useToast";
import { IconChevronLeft } from "../ui/Icons";

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
        <h3 className="text-sm font-semibold text-[#202124]">Forgot Password</h3>
        {onBackToLogin && (
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-xs text-[#1a73e8] hover:text-[#1557b0] font-medium flex items-center gap-1"
          >
            <IconChevronLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </button>
        )}
      </div>

      {sent ? (
        <div className="bg-[#e8f0fe] border border-[#d2e3fc] rounded-xl p-4 text-center space-y-2">
          <h4 className="text-sm font-semibold text-[#1967d2]">Check your email</h4>
          <p className="text-xs text-[#1a73e8] leading-relaxed">
            If an account exists for <strong className="font-mono text-[#202124]">{email}</strong>, we've sent a
            password reset link. It expires in 30 minutes.
          </p>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="text-xs text-[#1a73e8] hover:text-[#1557b0] font-medium underline"
          >
            Use a different email
          </button>
        </div>
      ) : (
        <>
          <p className="text-xs text-[#5f6368] leading-relaxed">
            Enter your registered school email address and we'll send you a password reset link. It expires in 30 minutes.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="student@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#dadce0] rounded-lg text-sm text-[#202124] placeholder-[#80868b] focus:border-[#1a73e8] focus:outline-none focus:ring-3 focus:ring-[#e8f0fe] transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs text-sm transition"
            >
              {loading ? "Sending..." : "Send Password Reset Link"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
