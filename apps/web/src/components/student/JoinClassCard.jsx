// apps/web/src/components/student/JoinClassCard.jsx
import { useState } from "react";
import { studentApi } from "../../api";
import { useToast } from "../../context/ToastContext";

export function JoinClassCard({ onJoined }) {
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
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 max-w-md">
      <h3 className="text-sm font-bold text-slate-900 mb-1">Join a New Class</h3>
      <p className="text-xs text-slate-500 mb-3">
        Enter the 6-character unique code provided by your professor.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          maxLength={12}
          required
          placeholder="e.g. ABC123"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm uppercase font-mono tracking-wider focus:bg-white focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm shadow-xs transition"
        >
          {loading ? "Joining..." : "Join Class"}
        </button>
      </form>
    </div>
  );
}
