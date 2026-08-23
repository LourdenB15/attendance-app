// apps/web/src/components/auth/ForgotPasswordForm.jsx
import { useState } from "react";
import { authApi } from "../../api";
import { useToast } from "../../context/ToastContext";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      showToast("info", res.message || "If registered, a reset link has been dispatched.");
      setEmail("");
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-slate-500">
        Enter your registered email address and we'll dispatch a secure password reset link.
      </p>
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
  );
}
