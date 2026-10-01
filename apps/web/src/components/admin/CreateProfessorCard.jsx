// apps/web/src/components/admin/CreateProfessorCard.jsx
import { useState } from "react";
import { adminApi } from "../../api";
import { useToast } from "../../context/useToast";

export function CreateProfessorCard({ onCreated }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminApi.createProfessor({ fullName, email });
      showToast(
        "success",
        `Professor account created. A temporary password was emailed to ${email}.`,
      );
      setFullName("");
      setEmail("");
      if (onCreated) onCreated();
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 max-w-lg">
      <h3 className="text-base font-bold text-slate-900 mb-1">
        Create Professor Account
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        A temporary password will be emailed to the professor. They must change it on first login.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Professor Full Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Dr. Alan Turing"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Email Address
          </label>
          <input
            type="email"
            required
            placeholder="prof@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-xs text-sm transition"
        >
          {loading ? "Creating..." : "Create Professor Account"}
        </button>
      </form>
    </div>
  );
}
