// apps/web/src/components/auth/RegisterForm.jsx
import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import { PasswordInput } from "../ui/PasswordInput";

export function RegisterForm({ onRegistered }) {
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ fullName, email, password });
      setRegisteredEmail(email);
      if (onRegistered) onRegistered(email);
    } catch {
      // toast handled in context
    } finally {
      setLoading(false);
    }
  };

  if (registeredEmail) {
    return (
      <div className="text-center py-4 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl mx-auto">
          ✉️
        </div>
        <h3 className="text-base font-bold text-slate-900">Check Your Inbox</h3>
        <p className="text-xs text-slate-600 max-w-xs mx-auto">
          We sent a 6-digit verification code to <strong className="font-mono text-slate-900">{registeredEmail}</strong>. Please enter the code to activate your account.
        </p>
        <button
          type="button"
          onClick={() => {
            setRegisteredEmail(null);
            setFullName("");
            setEmail("");
            setPassword("");
          }}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline"
        >
          ← Back to Register Form
        </button>
      </div>
    );
  }

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
        <PasswordInput
          required
          minLength={8}
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
        {loading ? "Creating account..." : "Register Student Account"}
      </button>
    </form>
  );
}
