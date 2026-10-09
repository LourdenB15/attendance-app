// apps/web/src/components/auth/LoginForm.jsx
import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import { GoogleLoginButton } from "./GoogleLoginButton";
import { PasswordInput } from "../ui/PasswordInput";

export function LoginForm({ onForgotPassword, onNeedsVerification }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStandardLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
    } catch (err) {
      // toast shown in context; unverified students go to the code screen
      if (err.code === "EMAIL_NOT_VERIFIED" && onNeedsVerification) {
        onNeedsVerification(email);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleStandardLogin} className="space-y-4">
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
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368]">
              Password
            </label>
            {onForgotPassword && (
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-xs text-[#1a73e8] hover:text-[#1557b0] font-medium transition"
              >
                Forgot password?
              </button>
            )}
          </div>
          <PasswordInput
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs text-sm transition"
        >
          {loading ? "Signing in..." : "Log In"}
        </button>
      </form>

      {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
        <>
          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#dadce0]"></div>
            </div>
            <span className="relative px-3 bg-white text-[11px] text-[#70757a] font-medium uppercase tracking-wider">
              or continue with
            </span>
          </div>

          <GoogleLoginButton />
        </>
      )}
    </div>
  );
}
