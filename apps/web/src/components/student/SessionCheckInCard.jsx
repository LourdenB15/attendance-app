// apps/web/src/components/student/SessionCheckInCard.jsx
import { useState } from "react";
import { livenessApi } from "../../api";
import { useToast } from "../../context/ToastContext";
import { LivenessCamera } from "../liveness/LivenessCamera";

export function SessionCheckInCard({ onCheckInSuccess }) {
  const [sessionId, setSessionId] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const { showToast } = useToast();

  const handleCheckIn = async (livenessResult) => {
    setShowCamera(false);
    if (!sessionId.trim()) {
      showToast("error", "Please provide a valid Session ID before scanning.");
      return;
    }
    try {
      const result = await livenessApi.checkIn(sessionId.trim(), livenessResult);
      if (result.present) {
        showToast("success", "Check-in successful! Attendance marked as PRESENT.");
      } else {
        showToast("error", result.message || "Face not recognized. Check-in failed.");
      }
      if (onCheckInSuccess) onCheckInSuccess();
    } catch (err) {
      showToast("error", err.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 max-w-xl mx-auto">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl mx-auto mb-2">
          📹
        </div>
        <h3 className="text-lg font-bold text-slate-900">Session Attendance Check-In</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Paste the active session UUID provided by your professor and scan your face.
        </p>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
          Session ID (UUID)
        </label>
        <input
          type="text"
          required
          placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {showCamera ? (
        <LivenessCamera
          title="Live Attendance Verification"
          onComplete={handleCheckIn}
          onCancel={() => setShowCamera(false)}
        />
      ) : (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              if (!sessionId.trim()) {
                showToast("error", "Please enter a valid Session ID first.");
                return;
              }
              setShowCamera(true);
            }}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md text-sm transition"
          >
            🎥 Start Facial Check-In Scan
          </button>
        </div>
      )}
    </div>
  );
}
