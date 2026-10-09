// apps/web/src/components/professor/SessionController.jsx
import { useState, useEffect } from "react";
import { sessionsApi } from "../../api";
import { useToast } from "../../context/useToast";
import {
  IconClock,
  IconRefresh,
  IconClose,
  IconCamera,
} from "../ui/Icons";

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
  const [timeLeft, setTimeLeft] = useState("");
  const { showToast } = useToast();

  const DURATION_PRESETS = [15, 30, 45, 60, 90];

  // Countdown timer for active session
  useEffect(() => {
    if (!activeSession?.expires_at) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(activeSession.expires_at).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft("Session expired");
        return;
      }

      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${mins}m ${secs < 10 ? "0" : ""}${secs}s remaining`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const handleOpen = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const session = await sessionsApi.openSession({
        classId,
        durationMinutes: Number(durationMinutes) || 60,
        label: label || undefined,
      });
      showToast("success", "Attendance session opened successfully.");
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
    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-[#dadce0]">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#e8eaed]">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              activeSession
                ? "bg-[#e6f4ea] text-[#137333]"
                : "bg-[#e8f0fe] text-[#1a73e8]"
            }`}
          >
            <IconCamera className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#202124]">
              {activeSession ? "Active Attendance Window" : "Launch Attendance Session"}
            </h4>
            <p className="text-xs text-[#5f6368] mt-0.5">
              {activeSession
                ? "Students are currently able to scan their faces to check in."
                : "Open a time-limited verification window for biometric face check-in."}
            </p>
          </div>
        </div>

        {activeSession && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#e6f4ea] text-[#137333] border border-[#ceead6]">
            <span className="w-2 h-2 rounded-full bg-[#1e8e3e] animate-ping" />
            <span>SESSION RUNNING</span>
          </span>
        )}
      </div>

      {activeSession ? (
        <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-xl p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded-lg border border-[#dadce0]/70">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#5f6368]">
                Session Topic / Label
              </span>
              <span className="text-xs font-semibold text-[#202124] block mt-0.5">
                {activeSession.label || "Regular Class Session"}
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-[#dadce0]/70">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#5f6368]">
                Time Remaining
              </span>
              <span className="text-xs font-mono font-bold text-[#137333] flex items-center gap-1.5 mt-0.5">
                <IconClock className="w-3.5 h-3.5 text-[#137333]" />
                <span>{timeLeft || "Calculating..."}</span>
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-[#dadce0]/70">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#5f6368]">
                Expires At
              </span>
              <span className="text-xs text-[#202124] font-medium block mt-0.5">
                {new Date(activeSession.expires_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onRefreshAttendance}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#f1f3f4] text-[#3c4043] border border-[#dadce0] rounded-lg text-xs font-semibold transition shadow-2xs"
            >
              <IconRefresh className="w-3.5 h-3.5 text-[#5f6368]" />
              <span>Refresh Attendance Roster</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#d93025] hover:bg-[#b3261e] disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition shadow-xs"
            >
              <IconClose className="w-3.5 h-3.5" />
              <span>{loading ? "Closing..." : "Close Session Now"}</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleOpen} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-1.5">
                Session Duration
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="1440"
                  required
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-24 px-3 py-2 bg-white border border-[#dadce0] rounded-lg text-sm font-semibold text-[#202124] focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#e8f0fe]"
                />
                <span className="text-xs text-[#5f6368] font-medium">Minutes</span>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-1.5">
                Topic or Lecture Label (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Chapter 4: Divide and Conquer Algorithms"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-[#dadce0] rounded-lg text-sm text-[#202124] placeholder-[#80868b] focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#e8f0fe] transition-all"
              />
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#e8eaed]">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[#70757a] font-medium mr-1">
                Presets:
              </span>
              {DURATION_PRESETS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDurationMinutes(m)}
                  className={`px-2.5 py-1 text-xs rounded-md transition font-medium ${
                    Number(durationMinutes) === m
                      ? "bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] font-bold"
                      : "bg-[#f1f3f4] text-[#5f6368] hover:bg-[#e8eaed]"
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white font-semibold rounded-lg text-xs shadow-xs transition inline-flex items-center gap-1.5"
            >
              <span>{loading ? "Starting..." : "Start Attendance Window"}</span>
              <span>→</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
