// apps/web/src/components/student/JoinClassCard.jsx
import { useState } from "react";
import { studentApi } from "../../api";
import { useToast } from "../../context/useToast";
import { IconPlus } from "../ui/Icons";

export function JoinClassCard({
  onJoined,
  onCancel,
  isModal = false,
  currentUser,
}) {
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setLoading(true);
    try {
      await studentApi.joinClass(joinCode.trim().toUpperCase());
      showToast("success", "Successfully enrolled into class!");
      setJoinCode("");
      if (onJoined) onJoined();
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
          : "bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-[#dadce0] max-w-lg"
      }
    >
      {currentUser && isModal && (
        <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#dadce0] text-xs">
          <span className="text-[#5f6368] block text-[11px]">
            You are currently signed in as
          </span>
          <span className="font-bold text-[#202124]">{currentUser.full_name}</span>
          <span className="text-[#5f6368] ml-1.5 font-mono text-[11px]">
            ({currentUser.email})
          </span>
        </div>
      )}

      {!isModal && (
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
            <IconPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#202124]">Join a Class</h3>
            <p className="text-xs text-[#5f6368] mt-0.5">
              Ask your teacher for the class code, then enter it here.
            </p>
          </div>
        </div>
      )}

      {isModal && (
        <div>
          <label className="block text-xs font-semibold text-[#202124] mb-1">
            Class code
          </label>
          <p className="text-xs text-[#5f6368] mb-3">
            Ask your instructor for the class code, then enter it below.
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={isModal ? "space-y-4" : "flex flex-col sm:flex-row gap-2.5"}
      >
        <input
          type="text"
          maxLength={12}
          required
          autoFocus={isModal}
          placeholder="Class code (e.g. ABC123)"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#dadce0] rounded-lg text-sm uppercase font-mono tracking-wider text-[#202124] placeholder-[#80868b] focus:bg-white focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#e8f0fe] transition-all"
        />

        <div
          className={`flex items-center ${
            isModal ? "justify-end gap-2.5 pt-2" : "gap-2.5"
          }`}
        >
          {isModal && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !joinCode.trim()}
            className="px-5 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white font-semibold rounded-lg text-xs shadow-xs transition shrink-0"
          >
            {loading ? "Joining..." : "Join Class"}
          </button>
        </div>
      </form>
    </div>
  );
}
