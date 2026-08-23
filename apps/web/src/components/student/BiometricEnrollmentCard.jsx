// apps/web/src/components/student/BiometricEnrollmentCard.jsx
import { useState } from "react";
import { livenessApi } from "../../api";
import { useToast } from "../../context/ToastContext";
import { LivenessCamera } from "../liveness/LivenessCamera";

export function BiometricEnrollmentCard() {
  const [showCamera, setShowCamera] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const { showToast } = useToast();

  const handleEnrollSuccess = async (livenessResult) => {
    setShowCamera(false);
    try {
      await livenessApi.enrollBiometric(livenessResult);
      setIsEnrolled(true);
      showToast("success", "Biometric face profile registered successfully!");
    } catch (err) {
      showToast("error", err.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 max-w-xl mx-auto">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl mx-auto mb-2">
          👤
        </div>
        <h3 className="text-lg font-bold text-slate-900">Biometric Face Identity Enrollment</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Your facial biometric descriptor is securely registered to verify your active presence during classes.
        </p>
      </div>

      {isEnrolled && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center text-xs font-semibold text-emerald-800 mb-6">
          ✅ Biometric face profile is active! You can re-scan below if needed.
        </div>
      )}

      {showCamera ? (
        <LivenessCamera
          title="Face Enrollment Scanner"
          onComplete={handleEnrollSuccess}
          onCancel={() => setShowCamera(false)}
        />
      ) : (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setShowCamera(true)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md text-sm transition"
          >
            📷 Launch Face Enrollment Camera
          </button>
        </div>
      )}
    </div>
  );
}
