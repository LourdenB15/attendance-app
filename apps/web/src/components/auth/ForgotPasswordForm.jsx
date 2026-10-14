// apps/web/src/components/auth/ForgotPasswordForm.jsx
import { useState } from "react";
import { authApi } from "../../api";
import { useToast } from "../../context/useToast";
import {
  IconChevronLeft,
  IconMail,
  IconArrowRight,
  IconCheckCircle,
} from "../ui/Icons";

export function ForgotPasswordForm({ onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { showToast } = useToast();

  const isReady = Boolean(email.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isReady || loading) return;

    setHasError(false);
    const trimmedEmail = email.trim();

    setLoading(true);
    try {
      await authApi.forgotPassword(trimmedEmail);
      setSent(true);
    } catch (err) {
      setHasError(true);
      showToast("error", err.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header and Back Link */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#202124] tracking-tight">
            Reset password
          </h2>
          <p className="text-xs text-[#5f6368] mt-1">
            Enter your email to receive recovery instructions.
          </p>
        </div>
        {onBackToLogin && (
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-xs text-[#1a73e8] hover:text-[#1557b0] font-medium flex items-center gap-1 transition cursor-pointer"
          >
            <IconChevronLeft className="w-3.5 h-3.5" />
            <span>Sign in</span>
          </button>
        )}
      </div>

      {sent ? (
        <div className="p-5 bg-[#e8f0fe] rounded-2xl text-center space-y-3 animate-in fade-in duration-200">
          <div className="w-10 h-10 rounded-xl bg-white text-[#1a73e8] flex items-center justify-center mx-auto shadow-2xs">
            <IconCheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1967d2]">Check your email</h3>
            <p className="text-xs text-[#3c4043] leading-relaxed mt-1 max-w-xs mx-auto">
              If an account exists for <strong className="font-mono text-[#202124]">{email}</strong>, a recovery link has been sent.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setEmail("");
                setHasError(false);
              }}
              className="text-xs text-[#1a73e8] hover:text-[#1557b0] font-medium hover:underline cursor-pointer"
            >
              Try another email
            </button>
          </div>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="forgot-email"
              className="block text-xs font-semibold text-[#3c4043] mb-1.5"
            >
              Email Address
            </label>
            <div className="relative flex items-center">
              <div
                className={`absolute left-3.5 pointer-events-none transition-colors ${
                  hasError ? "text-[#d93025]" : "text-[#5f6368]"
                }`}
              >
                <IconMail className="w-4 h-4" />
              </div>
              <input
                id="forgot-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={loading}
                placeholder="you@school.edu"
                value={email}
                aria-invalid={hasError ? "true" : undefined}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (hasError) setHasError(false);
                }}
                className={`w-full pl-10 pr-3.5 py-2.5 bg-white rounded-xl text-sm text-[#202124] placeholder-[#80868b] transition-all disabled:bg-[#f1f3f4] disabled:opacity-60 ${
                  hasError
                    ? "border border-[#d93025] ring-3 ring-[#d93025]/20 shadow-[0_0_12px_rgba(217,48,37,0.18)] focus:border-[#d93025] focus:outline-none focus:ring-3 focus:ring-[#d93025]/30"
                    : "border border-[#dadce0] focus:border-[#1a73e8] focus:outline-none focus:ring-3 focus:ring-[#e8f0fe]"
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!isReady || loading}
            className="w-full py-2.5 px-4 bg-[#1a73e8] hover:bg-[#1557b0] active:bg-[#174ea6] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-3 focus-visible:ring-[#1a73e8]/30 min-h-[42px]"
          >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending link...</span>
                </>
              ) : (
                <>
                  <span>Send link</span>
                  <IconArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {onBackToLogin && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onBackToLogin}
                className="text-xs text-[#5f6368] hover:text-[#202124] font-medium transition hover:underline cursor-pointer"
              >
                ← Return to sign in
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
