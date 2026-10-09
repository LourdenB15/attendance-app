// apps/web/src/components/student/StudentPortal.jsx
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { studentApi, livenessApi } from "../../api";
import { useToast } from "../../context/useToast";
import { useAuth } from "../../context/useAuth";
import { JoinClassCard } from "./JoinClassCard";
import { EnrolledClassesTable } from "./EnrolledClassesTable";
import { StudentClassDetail } from "./StudentClassDetail";
import { BiometricEnrollmentCard } from "./BiometricEnrollmentCard";
import { AttendanceHistoryTable } from "./AttendanceHistoryTable";
import { LivenessCamera } from "../liveness/LivenessCamera";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import { IconBook, IconClock, IconCamera } from "../ui/Icons";

export function StudentPortal({ activeNav = "classes", navKey = 0, onNavSelect }) {
  const { currentUser, setBiometricEnrolled } = useAuth();
  const { showToast } = useToast();
  const [studentTab, setStudentTab] = useState(activeNav || "classes");
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [activeScanningClassId, setActiveScanningClassId] = useState(null);
  const [verifying, setVerifying] = useState(false); // check-in sent, waiting for the server

  const isBiometricEnrolled = Boolean(currentUser?.has_biometric_enrolled);

  // Synchronize state when navigation triggers arrive from sidebar without cascading effect renders
  const [prevNavKey, setPrevNavKey] = useState(navKey);
  if (navKey !== prevNavKey) {
    setPrevNavKey(navKey);
    setStudentTab(activeNav);
    if (activeNav === "classes") {
      setSelectedClassId(null);
    }
  }

  const activeTab = studentTab;

  const studentTabRef = useRef(activeTab);
  useEffect(() => {
    studentTabRef.current = activeTab;
  }, [activeTab]);

  const handleTabChange = useCallback(
    (tab) => {
      setStudentTab(tab);
      if (tab === "classes") {
        setSelectedClassId(null);
      }
      if (onNavSelect) {
        onNavSelect(tab);
      }
    },
    [onNavSelect],
  );

  const loadClasses = useCallback(async (silent = false) => {
    try {
      const list = await studentApi.getMyClasses();
      setClasses(list);
    } catch (err) {
      if (!silent) showToast("error", err.message);
    }
  }, [showToast]);

  const loadAttendance = useCallback(async (silent = false) => {
    try {
      const att = await studentApi.getMyAttendance();
      setAttendance(att);
    } catch (err) {
      if (!silent) showToast("error", err.message);
    }
  }, [showToast]);

  const refreshAll = useCallback(async (silent = false) => {
    await Promise.all([loadClasses(silent), loadAttendance(silent)]);
  }, [loadClasses, loadAttendance]);

  // Initial fetch and focus / visibility re-fetch
  useEffect(() => {
    let ignore = false;
    async function fetchInitial() {
      try {
        const [list, att, statusRes] = await Promise.allSettled([
          studentApi.getMyClasses(),
          studentApi.getMyAttendance(),
          livenessApi.getEnrollmentStatus(),
        ]);
        if (!ignore) {
          if (list.status === "fulfilled") setClasses(list.value);
          if (att.status === "fulfilled") setAttendance(att.value);
          if (statusRes.status === "fulfilled" && statusRes.value.isEnrolled) {
            setBiometricEnrolled(true);
          }
        }
      } catch (err) {
        if (!ignore) showToast("error", err.message);
      }
    }
    fetchInitial();

    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        refreshAll(true);
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      ignore = true;
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [refreshAll, showToast, setBiometricEnrolled]);

  // Poll My Classes every 30 seconds to pick up newly opened sessions
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.hidden) return; // don't poll if backgrounded

      if (studentTabRef.current === "classes") {
        loadClasses(true);
      }
    }, 30000);

    return () => clearInterval(timer);
  }, [loadClasses]);

  const selectedClass = useMemo(() => {
    if (!selectedClassId) return null;
    return classes.find((c) => c.class_id === selectedClassId) || null;
  }, [classes, selectedClassId]);

  const activeScanningClass = useMemo(() => {
    if (!activeScanningClassId) return null;
    return classes.find((c) => c.class_id === activeScanningClassId) || null;
  }, [classes, activeScanningClassId]);

  const handleSelectClass = (classId) => {
    setSelectedClassId(classId);
  };

  const handleBackToClasses = () => {
    setSelectedClassId(null);
    loadClasses(true);
    if (onNavSelect) onNavSelect("classes");
  };

  const handleDirectTakeAttendance = (classId) => {
    if (!isBiometricEnrolled) {
      showToast("error", "Please enroll your face first in the Face Setup tab.");
      handleTabChange("enroll-face");
      return;
    }

    const cls = classes.find((c) => c.class_id === classId);
    if (!cls || !cls.active_session_id) {
      showToast("error", "No active session is open for this class.");
      return;
    }
    setActiveScanningClassId(classId);
  };

  const handleDirectScanSuccess = async (livenessResult) => {
    const cls = activeScanningClass;
    setActiveScanningClassId(null);
    if (!cls || !cls.active_session_id) return;

    setVerifying(true);
    try {
      const res = await livenessApi.checkIn(cls.active_session_id, livenessResult);
      if (res.present) {
        await refreshAll(true);
        showToast("success", `Attendance recorded as PRESENT for ${cls.name}!`);
      } else {
        showToast("error", res.message || "Face not recognized. Attendance not recorded.");
      }
    } catch (err) {
      showToast("error", err.message);
      if (err.code === "ATTENDANCE_OVERRIDDEN") await refreshAll(true);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#dadce0]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-[#202124]">Student Attendance Hub</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e6f4ea] text-[#137333] border border-[#ceead6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1e8e3e] animate-pulse" />
              Live Sync
            </span>
          </div>
          <p className="text-xs text-[#5f6368] mt-0.5">
            View enrolled classes, open live attendance sessions, and review personal records.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-[#f1f3f4] p-1 rounded-xl text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => handleTabChange("classes")}
            className={`px-3.5 py-1.5 rounded-lg transition-all inline-flex items-center gap-1.5 ${
              activeTab === "classes"
                ? "bg-white text-[#1a73e8] shadow-xs font-bold"
                : "text-[#5f6368] hover:text-[#202124]"
            }`}
          >
            <IconBook className="w-3.5 h-3.5" />
            <span>My Classes</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("enroll-face")}
            className={`px-3.5 py-1.5 rounded-lg transition-all inline-flex items-center gap-1.5 ${
              activeTab === "enroll-face"
                ? "bg-white text-[#1a73e8] shadow-xs font-bold"
                : "text-[#5f6368] hover:text-[#202124]"
            }`}
          >
            <IconCamera className="w-3.5 h-3.5" />
            <span>Face Setup</span>
            {!isBiometricEnrolled ? (
              <span className="w-2 h-2 rounded-full bg-[#d93025]" title="Face setup required" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-[#137333]" title="Face verified" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              handleTabChange("history");
              loadAttendance();
            }}
            className={`px-3.5 py-1.5 rounded-lg transition-all inline-flex items-center gap-1.5 ${
              activeTab === "history"
                ? "bg-white text-[#1a73e8] shadow-xs font-bold"
                : "text-[#5f6368] hover:text-[#202124]"
            }`}
          >
            <IconClock className="w-3.5 h-3.5" />
            <span>Attendance History</span>
          </button>
        </div>
      </div>

      {verifying && <LoadingOverlay message="Recording your attendance..." />}

      {/* Embedded Scanner Modal when directly checking into a class */}
      {activeScanningClass && (
        <LivenessCamera
          mode="attendance"
          title={`Check-In: ${activeScanningClass.name}`}
          onComplete={handleDirectScanSuccess}
          onCancel={() => setActiveScanningClassId(null)}
        />
      )}

      {/* TAB 1: CLASSES VIEW */}
      {activeTab === "classes" && (
        selectedClass ? (
          <StudentClassDetail
            classItem={selectedClass}
            onBack={handleBackToClasses}
            onAttendanceMarked={() => refreshAll(true)}
            onGoToEnroll={() => handleTabChange("enroll-face")}
            attendanceRecords={attendance}
          />
        ) : (
          <div className="space-y-6">
            {!isBiometricEnrolled && (
              <div className="bg-[#fef7e0] border border-[#fce8b2] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#b06000] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <IconCamera className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#202124]">
                      Biometric Face Profile Required
                    </h3>
                    <p className="text-xs text-[#5f6368] mt-0.5 max-w-xl leading-relaxed">
                      Before checking into live attendance sessions, please register your face profile. It only takes a few seconds and works across all your classes!
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleTabChange("enroll-face")}
                  className="px-4 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-bold rounded-xl shadow-xs transition shrink-0 self-start sm:self-auto"
                >
                  Set Up Face Now
                </button>
              </div>
            )}
            <JoinClassCard onJoined={() => loadClasses(false)} />
            <EnrolledClassesTable
              classes={classes}
              isBiometricEnrolled={isBiometricEnrolled}
              onSelectClass={handleSelectClass}
              onTakeAttendance={handleDirectTakeAttendance}
            />
          </div>
        )
      )}

      {/* TAB 2: ENROLL FACE */}
      {activeTab === "enroll-face" && (
        <div className="space-y-4">
          <BiometricEnrollmentCard
            onEnrollmentComplete={() => {
              refreshAll(true);
              handleTabChange("classes");
            }}
          />
        </div>
      )}

      {/* TAB 3: ATTENDANCE HISTORY */}
      {activeTab === "history" && (
        <AttendanceHistoryTable
          records={attendance}
          onRefresh={() => loadAttendance(false)}
        />
      )}
    </div>
  );
}
