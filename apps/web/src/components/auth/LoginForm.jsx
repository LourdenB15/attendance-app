// apps/web/src/components/auth/LoginForm.jsx
import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import { GoogleLoginButton } from "./GoogleLoginButton";
import { PasswordInput } from "../ui/PasswordInput";
import { IconMail, IconLock, IconArrowRight } from "../ui/Icons";

export function LoginForm({ onForgotPassword, onNeedsVerification, onSwitchToRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const isReady = Boolean(email.trim() && password);

  const handleStandardLogin = async (e) => {
    e.preventDefault();
    if (!isReady || loading) return;

    setHasError(false);
    const trimmedEmail = email.trim();

    setLoading(true);
    try {
      await login({ email: trimmedEmail, password });
    } catch (err) {
      if (err.code === "EMAIL_NOT_VERIFIED" && onNeedsVerification) {
        onNeedsVerification(trimmedEmail);
        return;
      }
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#202124] tracking-tight">
          Sign in
        </h2>
        <p className="text-xs text-[#5f6368] mt-1">
          Enter your email and password to continue.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleStandardLogin} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="login-email"
            className="block text-xs font-semibold text-[#3c4043] mb-1.5"
          >
            Email
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
              id="login-email"
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

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold text-[#3c4043]"
            >
              Password
            </label>
            {onForgotPassword && (
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-xs text-[#1a73e8] hover:text-[#1557b0] font-medium transition cursor-pointer"
              >
                Forgot password?
              </button>
            )}
          </div>
          <PasswordInput
            id="login-password"
            name="password"
            autoComplete="current-password"
            required
            disabled={loading}
            placeholder="••••••••"
            value={password}
            hasError={hasError}
            onChange={(e) => {
              setPassword(e.target.value);
              if (hasError) setHasError(false);
            }}
            leadingIcon={<IconLock className="w-4 h-4" />}
          />
        </div>

        {/* Submit button: matches RegisterForm button behavior with disabled:opacity-50 disabled:cursor-not-allowed */}
        <button
          type="submit"
          disabled={!isReady || loading}
          className="w-full py-2.5 px-4 bg-[#1a73e8] hover:bg-[#1557b0] active:bg-[#174ea6] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-3 focus-visible:ring-[#1a73e8]/30 min-h-10.5"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign in</span>
              <IconArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Google Login (if configured) */}
      {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
        <div className="space-y-3 pt-1">
          <div className="text-center text-[11px] text-[#70757a] font-medium">
            or continue with
          </div>

          <GoogleLoginButton />
        </div>
      )}

      {/* Switch to Register */}
      {onSwitchToRegister && (
        <div className="pt-2 text-center">
          <p className="text-xs text-[#5f6368]">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-[#1a73e8] hover:text-[#1557b0] font-semibold transition hover:underline cursor-pointer"
            >
              Sign up
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
