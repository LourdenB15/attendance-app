// apps/web/src/components/auth/RegisterForm.jsx
import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import { PasswordInput } from "../ui/PasswordInput";
import { IconCheck } from "../ui/Icons";

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
        <div className="w-12 h-12 rounded-full bg-[#e6f4ea] text-[#137333] flex items-center justify-center mx-auto">
          <IconCheck className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#202124]">Check Your Inbox</h3>
        <p className="text-xs text-[#5f6368] max-w-xs mx-auto leading-relaxed">
          We sent a 6-digit verification code to <strong className="font-mono text-[#202124]">{registeredEmail}</strong>. Please enter the code to activate your student account.
        </p>
        <button
          type="button"
          onClick={() => {
            setRegisteredEmail(null);
            setFullName("");
            setEmail("");
            setPassword("");
          }}
          className="text-xs text-[#1a73e8] hover:text-[#1557b0] font-medium underline"
        >
          ← Back to Register Form
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-1.5">
          Full Name
        </label>
        <input
          type="text"
          required
          placeholder="e.g. Marie Curie"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-white border border-[#dadce0] rounded-lg text-sm text-[#202124] placeholder-[#80868b] focus:border-[#1a73e8] focus:outline-none focus:ring-3 focus:ring-[#e8f0fe] transition-all"
        />
      </div>
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
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-1.5">
          Create Password
        </label>
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
        {loading ? "Creating account..." : "Register Student Account"}
      </button>
    </form>
  );
}
