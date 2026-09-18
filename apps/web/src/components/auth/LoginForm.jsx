// apps/web/src/components/auth/LoginForm.jsx
import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import { GoogleLoginButton } from "./GoogleLoginButton";
import { PasswordInput } from "../ui/PasswordInput";

export function LoginForm({ onForgotPassword }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStandardLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
    } catch {
      // toast shown in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleStandardLogin} className="space-y-4">
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
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Password
            </label>
            {onForgotPassword && (
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition"
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
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-xs text-sm transition"
        >
          {loading ? "Signing in..." : "Log In"}
        </button>
      </form>

      {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
        <>
          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative px-3 bg-white text-[11px] text-slate-400 font-bold uppercase">
              or continue with
            </span>
          </div>

          <GoogleLoginButton />
        </>
      )}
    </div>
  );
}
