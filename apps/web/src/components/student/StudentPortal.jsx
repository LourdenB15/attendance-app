// apps/web/src/components/student/StudentPortal.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
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

  const loadClasses = useCallback(async () => {
    try {
      const list = await studentApi.getMyClasses();
      setClasses(list);
    } catch (err) {
      showToast("error", err.message);
    }
  }, [showToast]);

  const loadAttendance = useCallback(async () => {
    try {
      const att = await studentApi.getMyAttendance();
      setAttendance(att);
    } catch (err) {
      showToast("error", err.message);
    }
  }, [showToast]);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadClasses(), loadAttendance()]);
  }, [loadClasses, loadAttendance]);

  useEffect(() => {
    let ignore = false;
    async function fetchInitialData() {
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
    fetchInitialData();
    return () => {
      ignore = true;
    };
  }, [showToast]);

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
    loadClasses();
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
        await refreshAll();
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
          <h2 className="text-xl font-bold text-slate-900">Student Hub</h2>
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
            onAttendanceMarked={refreshAll}
            attendanceRecords={attendance}
          />
        ) : (
          <div className="space-y-6">
            <JoinClassCard onJoined={loadClasses} />
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
        <AttendanceHistoryTable records={attendance} onRefresh={loadAttendance} />
      )}
    </div>
  );
}
