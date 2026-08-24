// apps/web/src/components/student/StudentPortal.jsx
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { studentApi, livenessApi } from "../../api";
import { useToast } from "../../context/useToast";
import { JoinClassCard } from "./JoinClassCard";
import { EnrolledClassesTable } from "./EnrolledClassesTable";
import { StudentClassDetail } from "./StudentClassDetail";
import { BiometricEnrollmentCard } from "./BiometricEnrollmentCard";
import { AttendanceHistoryTable } from "./AttendanceHistoryTable";
import { LivenessCamera } from "../liveness/LivenessCamera";

export function StudentPortal() {
  const { showToast } = useToast();
  const [studentTab, setStudentTab] = useState("classes"); // "classes" | "enroll-face" | "history"
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [activeScanningClassId, setActiveScanningClassId] = useState(null);

  const studentTabRef = useRef(studentTab);
  useEffect(() => {
    studentTabRef.current = studentTab;
  }, [studentTab]);

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
        const [list, att] = await Promise.all([
          studentApi.getMyClasses(),
          studentApi.getMyAttendance(),
        ]);
        if (!ignore) {
          setClasses(list);
          setAttendance(att);
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
  }, [refreshAll, showToast]);

  // Live polling interval (every 4 seconds for active classes & session statuses)
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.hidden) return; // don't poll if backgrounded

      if (studentTabRef.current === "classes") {
        loadClasses(true);
      } else if (studentTabRef.current === "history") {
        loadAttendance(true);
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [loadClasses, loadAttendance]);

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

    try {
      const res = await livenessApi.checkIn(cls.active_session_id, livenessResult);
      if (res.present) {
        showToast("success", `Attendance recorded as PRESENT for ${cls.name}!`);
        await refreshAll(true);
      } else {
        showToast("error", res.message || "Face not recognized. Attendance not recorded.");
      }
    } catch (err) {
      showToast("error", err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Stable Static Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Student Hub</h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            View enrolled classes, open live attendance sessions, and register biometrics
          </p>
        </div>

        <div className="flex bg-slate-200 p-1 rounded-xl text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => {
              setStudentTab("classes");
            }}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              studentTab === "classes"
                ? "bg-white text-indigo-600 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            My Classes
          </button>
          <button
            type="button"
            onClick={() => setStudentTab("enroll-face")}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              studentTab === "enroll-face"
                ? "bg-white text-indigo-600 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Face Setup
          </button>
          <button
            type="button"
            onClick={() => {
              setStudentTab("history");
              loadAttendance();
            }}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              studentTab === "history"
                ? "bg-white text-indigo-600 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            History
          </button>
        </div>
      </div>

      {activeScanningClass && (
        <LivenessCamera
          title={`Take Attendance: ${activeScanningClass.name}`}
          onComplete={handleDirectScanSuccess}
          onCancel={() => setActiveScanningClassId(null)}
        />
      )}

      {studentTab === "classes" && (
        selectedClass ? (
          <StudentClassDetail
            classItem={selectedClass}
            onBack={handleBackToClasses}
            onAttendanceMarked={() => refreshAll(true)}
            attendanceRecords={attendance}
          />
        ) : (
          <div className="space-y-6">
            <JoinClassCard onJoined={() => loadClasses(false)} />
            <EnrolledClassesTable
              classes={classes}
              onSelectClass={handleSelectClass}
              onTakeAttendance={handleDirectTakeAttendance}
            />
          </div>
        )
      )}

      {studentTab === "enroll-face" && <BiometricEnrollmentCard />}

      {studentTab === "history" && (
        <AttendanceHistoryTable records={attendance} onRefresh={() => loadAttendance(false)} />
      )}
    </div>
  );
}
