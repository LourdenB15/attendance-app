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
import { IconBook, IconClock } from "../ui/Icons";

export function StudentPortal() {
  const { currentUser, setBiometricEnrolled } = useAuth();
  const { showToast } = useToast();
  const [studentTab, setStudentTab] = useState("classes"); // "classes" | "enroll-face" | "history"
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [activeScanningClassId, setActiveScanningClassId] = useState(null);
  const [verifying, setVerifying] = useState(false); // check-in sent, waiting for the server

  const isBiometricEnrolled = Boolean(currentUser?.has_biometric_enrolled);

  // Face Setup is hidden from default view once enrolled, but can still be selected
  const activeTab = studentTab === "enroll-face" && isBiometricEnrolled ? "classes" : studentTab;

  const studentTabRef = useRef(activeTab);
  useEffect(() => {
    studentTabRef.current = activeTab;
  }, [activeTab]);

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
  };

  const handleDirectTakeAttendance = (classId) => {
    if (!isBiometricEnrolled) {
      showToast("error", "Please enroll your face first in the Face Setup tab.");
      setStudentTab("enroll-face");
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

  // If student hasn't registered face biometrics yet, show welcoming setup
  if (!isBiometricEnrolled) {
    return (
      <div className="space-y-6">
        <div className="pb-4 border-b border-[#dadce0]">
          <h2 className="text-xl font-bold text-[#202124]">
            Welcome! Let's set up your biometric face profile
          </h2>
          <p className="text-xs text-[#5f6368] mt-0.5">
            You need a facial descriptor before you can join classes and check into live attendance.
          </p>
        </div>
        <BiometricEnrollmentCard
          onEnrollmentComplete={() => {
            refreshAll(true);
            setStudentTab("classes");
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Google Classroom Style Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#dadce0]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-[#202124]">Student Classroom Hub</h2>
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
            onClick={() => {
              setStudentTab("classes");
            }}
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
            onClick={() => {
              setStudentTab("history");
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
            onGoToEnroll={() => setStudentTab("enroll-face")}
            attendanceRecords={attendance}
          />
        ) : (
          <div className="space-y-6">
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

      {/* TAB 2: ENROLL FACE (If accessed directly) */}
      {activeTab === "enroll-face" && (
        <BiometricEnrollmentCard
          onEnrollmentComplete={() => {
            refreshAll(true);
            setStudentTab("classes");
          }}
        />
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
