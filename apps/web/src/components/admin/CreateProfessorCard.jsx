// apps/web/src/components/admin/CreateProfessorCard.jsx
import { useState } from "react";
import { adminApi } from "../../api";
import { useToast } from "../../context/useToast";
import { IconPlus } from "../ui/Icons";

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
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-[#dadce0] max-w-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
          <IconPlus className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#202124]">
            Invite Professor / Faculty
          </h3>
          <p className="text-xs text-[#5f6368] mt-0.5">
            A temporary password will be securely emailed for initial sign-in.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Dr. Alan Turing"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-[#dadce0] rounded-lg text-sm text-[#202124] placeholder-[#80868b] focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#e8f0fe] transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-1.5">
            School Email Address
          </label>
          <input
            type="email"
            required
            placeholder="professor@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-[#dadce0] rounded-lg text-sm text-[#202124] placeholder-[#80868b] focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#e8f0fe] transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs text-sm transition"
        >
          {loading ? "Creating professor account..." : "Send Invitation & Create Account"}
        </button>
      </form>
    </div>
  );
}
