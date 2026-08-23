// apps/web/src/components/auth/RegisterForm.jsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export function RegisterForm() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ fullName, email, password });
    } catch {
      // toast handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
          Full Name
        </label>
        <input
          type="text"
          required
          placeholder="e.g. Marie Curie"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
          Email Address
        </label>
        <input
          type="email"
          required
          placeholder="student@school.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
          Password (min 8 characters)
        </label>
        <input
          type="password"
          required
          minLength={8}
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
        {loading ? "Creating account..." : "Register Student Account"}
      </button>
    </form>
  );
}
