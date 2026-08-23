// apps/web/src/components/auth/LoginForm.jsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export function LoginForm() {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleCredential, setGoogleCredential] = useState("");
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

  const handleGoogleAuth = async (e) => {
    e.preventDefault();
    if (!googleCredential.trim()) return;
    setLoading(true);
    try {
      await loginWithGoogle(googleCredential.trim());
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
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Password
          </label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
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

      <div className="relative my-4 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <span className="relative px-3 bg-white text-[11px] text-slate-400 font-bold uppercase">
          or continue with
        </span>
      </div>

      <form onSubmit={handleGoogleAuth} className="space-y-3">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Google Credential (ID Token)
          </label>
          <input
            type="text"
            placeholder="Paste Google JWT credential..."
            value={googleCredential}
            onChange={(e) => setGoogleCredential(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
        >
          Sign In with Google (Student)
        </button>
      </form>
    </div>
  );
}
