// apps/web/src/components/student/BiometricEnrollmentCard.jsx
import { useState, useEffect } from "react";
import { livenessApi } from "../../api";
import { useToast } from "../../context/useToast";
import { useAuth } from "../../context/useAuth";
import { LivenessCamera } from "../liveness/LivenessCamera";
import {
  IconCamera,
  IconShieldCheck,
  IconCheck,
  IconChevronDown,
} from "../ui/Icons";

export function BiometricEnrollmentCard({ onEnrollmentComplete }) {
  const { currentUser, setBiometricEnrolled } = useAuth();
  const [showCamera, setShowCamera] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(Boolean(currentUser?.has_biometric_enrolled));
  const [showTips, setShowTips] = useState(false);
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
      setBiometricEnrolled(true);
      showToast("success", "Biometric face profile registered successfully!");
      if (onEnrollmentComplete) onEnrollmentComplete();
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-xs border border-[#dadce0] max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center mb-5 sm:mb-6">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center mx-auto mb-3 shadow-xs">
          <IconShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-[#202124]">
          Facial Biometric Enrollment
        </h3>
        <p className="text-xs sm:text-sm text-[#5f6368] max-w-md mx-auto mt-1 leading-relaxed">
          Attendance Live uses AI liveness detection to ensure accurate, proxy-free attendance. Register your facial descriptor once to enable 1-click check-ins across all your classes.
        </p>
      </div>

      {isEnrolled && (
        <div className="bg-[#e6f4ea] border border-[#ceead6] rounded-xl p-4 flex items-start gap-3 text-xs font-semibold text-[#137333] mb-5">
          <div className="w-6 h-6 rounded-full bg-[#137333] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <IconCheck className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-[#137333]">Face Profile Active & Verified</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#137333] text-white uppercase tracking-wider">Ready</span>
            </div>
            <p className="font-normal text-xs text-[#1e8e3e] mt-1 leading-relaxed">
              Your biometric descriptor is active for instant 1-click check-ins across all your classes. You can re-scan anytime below if your lighting or appearance changes.
            </p>
          </div>
        </div>
      )}

      {/* Guided Steps Explanation: visible for onboarding or toggled when enrolled */}
      {(!isEnrolled || showTips) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-5 animate-in fade-in-50 duration-200">
          <div className="p-3 sm:p-3.5 rounded-xl bg-[#f8f9fa] border border-[#dadce0] text-center">
            <span className="w-6 h-6 rounded-full bg-[#1a73e8] text-white text-xs font-bold flex items-center justify-center mx-auto mb-1.5">
              1
            </span>
            <span className="block text-xs font-bold text-[#202124]">Good Lighting</span>
            <span className="block text-[11px] text-[#5f6368] mt-0.5">Face the light clearly</span>
          </div>
          <div className="p-3 sm:p-3.5 rounded-xl bg-[#f8f9fa] border border-[#dadce0] text-center">
            <span className="w-6 h-6 rounded-full bg-[#1a73e8] text-white text-xs font-bold flex items-center justify-center mx-auto mb-1.5">
              2
            </span>
            <span className="block text-xs font-bold text-[#202124]">Align in Oval</span>
            <span className="block text-[11px] text-[#5f6368] mt-0.5">Look straight at camera</span>
          </div>
          <div className="p-3 sm:p-3.5 rounded-xl bg-[#f8f9fa] border border-[#dadce0] text-center">
            <span className="w-6 h-6 rounded-full bg-[#1a73e8] text-white text-xs font-bold flex items-center justify-center mx-auto mb-1.5">
              3
            </span>
            <span className="block text-xs font-bold text-[#202124]">Liveness Check</span>
            <span className="block text-[11px] text-[#5f6368] mt-0.5">Pass anti-spoofing</span>
          </div>
        </div>
      )}

      {/* Collapsible toggle for enrolled students to view/hide tips */}
      {isEnrolled && (
        <div className="text-center mb-5">
          <button
            type="button"
            onClick={() => setShowTips((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1a73e8] hover:text-[#1557b0] transition-colors py-1.5 px-3 rounded-lg hover:bg-[#e8f0fe] active:bg-[#d2e3fc]"
            aria-expanded={showTips}
          >
            <span>{showTips ? "Hide preparation guidelines" : "View preparation tips & requirements"}</span>
            <IconChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                showTips ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      )}

      {saving ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="w-10 h-10 border-3 border-[#1a73e8] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-[#202124]">Saving your biometric face profile...</p>
        </div>
      ) : showCamera ? (
        <LivenessCamera
          mode="enrollment"
          title="Face Enrollment & Anti-Spoofing Scan"
          onComplete={handleEnrollSuccess}
          onCancel={() => setShowCamera(false)}
        />
      ) : (
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => setShowCamera(true)}
            className="w-full sm:w-auto px-8 py-3.5 sm:py-3 min-h-[44px] bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold rounded-xl shadow-xs text-sm transition inline-flex items-center justify-center gap-2 hover:scale-102 active:scale-98"
          >
            <IconCamera className="w-4 h-4" />
            <span>
              {isEnrolled ? "Update Facial Biometric Profile" : "Launch Camera for Face Enrollment"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
