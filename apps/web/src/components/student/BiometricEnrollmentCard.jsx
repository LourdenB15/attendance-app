// apps/web/src/components/student/BiometricEnrollmentCard.jsx
import { useState, useEffect } from "react";
import { livenessApi } from "../../api";
import { useToast } from "../../context/useToast";
import { useAuth } from "../../context/useAuth";
import { LivenessCamera } from "../liveness/LivenessCamera";

export function BiometricEnrollmentCard({ onEnrollmentComplete }) {
  const { currentUser, setBiometricEnrolled } = useAuth();
  const [showCamera, setShowCamera] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(Boolean(currentUser?.has_biometric_enrolled));
  const { showToast } = useToast();

  useEffect(() => {
    let ignore = false;
    async function checkStatus() {
      try {
        const res = await livenessApi.getEnrollmentStatus();
        if (!ignore && res.isEnrolled) {
          setIsEnrolled(true);
          setBiometricEnrolled(true);
        }
      } catch {
        // ignore
      }
    }
    checkStatus();
    return () => {
      ignore = true;
    };
  }, [setBiometricEnrolled]);

  const handleEnrollSuccess = async (livenessResult) => {
    setShowCamera(false);
    setSaving(true);
    try {
      await livenessApi.enrollBiometric(livenessResult);
      setIsEnrolled(true);
      setBiometricEnrolled(true); // the hub opens automatically once this is set
      showToast("success", "Biometric face profile registered successfully!");
      if (onEnrollmentComplete) onEnrollmentComplete();
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setSaving(false);
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
          Your facial biometric descriptor is securely registered with active multi-gesture challenges to prevent proxy attendance.
        </p>
      </div>

      {isEnrolled && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center text-xs font-semibold text-emerald-800 mb-6">
          ✅ Biometric face profile is active! You can re-scan below if you need to update your profile.
        </div>
      )}

      {saving ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-700">Saving your face profile...</p>
        </div>
      ) : showCamera ? (
        <LivenessCamera
          mode="enrollment"
          title="Face Enrollment & Anti-Spoofing Scan"
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
            {isEnrolled ? "🔄 Re-Enroll Biometric Face Profile" : "📷 Launch Face Enrollment Camera"}
          </button>
        </div>
      )}
    </div>
  );
}
