// apps/web/src/components/student/SessionCheckInCard.jsx
import { useState } from "react";
import { livenessApi } from "../../api";
import { useToast } from "../../context/useToast";
import { useAuth } from "../../context/useAuth";
import { LivenessCamera } from "../liveness/LivenessCamera";
import { IconCamera, IconAlert } from "../ui/Icons";

export function SessionCheckInCard({ onCheckInSuccess, onGoToEnroll }) {
  const { currentUser } = useAuth();
  const [sessionId, setSessionId] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const { showToast } = useToast();

  const isEnrolled = Boolean(currentUser?.has_biometric_enrolled);

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

  const handleStartScanClick = () => {
    if (!isEnrolled) {
      showToast("error", "Please enroll your face first in the Face Setup tab.");
      if (onGoToEnroll) onGoToEnroll();
      return;
    }
    if (!sessionId.trim()) {
      showToast("error", "Please enter a valid Session ID first.");
      return;
    }
    setShowCamera(true);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-[#dadce0] max-w-xl mx-auto">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center mx-auto mb-3 shadow-xs">
          <IconCamera className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-[#202124]">
          Session Attendance Check-In
        </h3>
        <p className="text-xs sm:text-sm text-[#5f6368] max-w-md mx-auto mt-1 leading-relaxed">
          Enter the session identifier provided by your instructor and complete a quick facial verification scan.
        </p>
      </div>

      {!isEnrolled && (
        <div className="mb-5 bg-[#fef7e0] border border-[#feefc3] rounded-xl p-4 flex items-start gap-3">
          <IconAlert className="w-5 h-5 text-[#b06000] shrink-0 mt-0.5" />
          <div className="flex-1 text-xs text-[#824400]">
            <strong className="font-bold block text-[#b06000] mb-0.5">
              Face Profile Setup Required
            </strong>
            You must register your biometric face profile before you can check in to class sessions.
            {onGoToEnroll && (
              <button
                type="button"
                onClick={onGoToEnroll}
                className="mt-2 block font-bold text-[#1a73e8] hover:underline"
              >
                Go to Face Setup →
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mb-5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-1.5">
          Session ID (UUID)
        </label>
        <input
          type="text"
          required
          placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-white border border-[#dadce0] rounded-lg text-sm font-mono text-[#202124] focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#e8f0fe] transition-all"
        />
      </div>

      {showCamera ? (
        <LivenessCamera
          mode="attendance"
          title="Live Attendance Verification"
          onComplete={handleCheckIn}
          onCancel={() => setShowCamera(false)}
        />
      ) : (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={handleStartScanClick}
            className="w-full sm:w-auto px-8 py-3 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold rounded-xl shadow-xs text-sm transition inline-flex items-center justify-center gap-2 hover:scale-102 active:scale-98"
          >
            <IconCamera className="w-4 h-4" />
            <span>Start Facial Check-In Scan</span>
          </button>
        </div>
      )}
    </div>
  );
}
