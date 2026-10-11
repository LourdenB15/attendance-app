// apps/web/src/components/admin/CreateProfessorCard.jsx
import { useState } from "react";
import { adminApi } from "../../api";
import { useToast } from "../../context/useToast";
import { IconPlus } from "../ui/Icons";

export function CreateProfessorCard({ onCreated, onCancel, isModal = false }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;
    setLoading(true);
    try {
      await adminApi.createProfessor({ fullName: fullName.trim(), email: email.trim() });
      showToast(
        "success",
        `Professor account created. A temporary password was emailed to ${email.trim()}.`,
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
    <div
      className={
        isModal
          ? "space-y-4"
          : "bg-white p-5 sm:p-8 rounded-2xl shadow-xs border border-[#dadce0] max-w-lg"
      }
    >
      {!isModal && (
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
      )}

      {isModal && (
        <p className="text-xs text-[#5f6368] mb-3">
          Enter faculty credentials. The professor will receive a secure temporary password to sign in.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            required
            autoFocus={isModal}
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

        <div className={`flex items-center ${isModal ? "justify-end gap-2.5 pt-2" : "gap-3"}`}>
          {isModal && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 text-xs font-semibold text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124] rounded-lg transition"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`${
              isModal ? "px-5" : "w-full"
            } py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs text-xs sm:text-sm transition cursor-pointer`}
          >
            {loading ? "Creating professor..." : "Send Invitation & Create Account"}
          </button>
        </div>
      </form>
    </div>
  );
}
