// apps/web/src/components/professor/SessionController.jsx
import { useState } from "react";
import { sessionsApi } from "../../api";
import { useToast } from "../../context/useToast";

export function SessionController({
  classId,
  activeSession,
  onSessionOpened,
  onSessionClosed,
  onRefreshAttendance,
}) {
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleOpen = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const session = await sessionsApi.openSession({
        classId,
        durationMinutes: Number(durationMinutes) || 60,
        label: label || undefined,
      });
      showToast("success", `Session opened! Session ID: ${session.id}`);
      setLabel("");
      if (onSessionOpened) onSessionOpened(session);
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    if (!activeSession) return;
    setLoading(true);
    try {
      await sessionsApi.closeSession(activeSession.id);
      showToast("success", "Attendance session closed.");
      if (onSessionClosed) onSessionClosed();
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h4 className="text-base font-bold text-slate-900 mb-1">Attendance Session Controller</h4>
      <p className="text-xs text-slate-500 mb-4">
        Launch a verification window for students to verify identity via webcam liveness detection.
      </p>

      {activeSession ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
              Active Session Running
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={handleClose}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition"
            >
              {loading ? "Closing..." : "Close Session Now"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white/80 p-3 rounded-lg border border-emerald-100 font-medium text-emerald-900 mb-3">
            <div>
              <strong>Session ID:</strong>
              <code className="text-[11px] block mt-0.5 select-all">{activeSession.id}</code>
            </div>
            <div>
              <strong>Label:</strong>
              <span className="block mt-0.5">{activeSession.label || "Regular Class"}</span>
            </div>
            <div>
              <strong>Expires At:</strong>
              <span className="block mt-0.5">{new Date(activeSession.expires_at).toLocaleTimeString()}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onRefreshAttendance}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
          >
            🔄 Refresh Live Attendance Roster
          </button>
        </div>
      ) : (
        <form onSubmit={handleOpen} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Duration (Minutes)
            </label>
            <input
              type="number"
              min="1"
              max="1440"
              required
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="w-32 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Session Label (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Lecture 5 - Dynamic Programming"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm shadow-xs transition"
          >
            {loading ? "Opening..." : "Open Attendance Session"}
          </button>
        </form>
      )}
    </div>
  );
}
