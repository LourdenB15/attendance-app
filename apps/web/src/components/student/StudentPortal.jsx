// apps/web/src/components/student/StudentPortal.jsx
import { useState, useEffect, useCallback } from "react";
import { studentApi } from "../../api";
import { useToast } from "../../context/useToast";
import { JoinClassCard } from "./JoinClassCard";
import { EnrolledClassesTable } from "./EnrolledClassesTable";
import { BiometricEnrollmentCard } from "./BiometricEnrollmentCard";
import { SessionCheckInCard } from "./SessionCheckInCard";
import { AttendanceHistoryTable } from "./AttendanceHistoryTable";

export function StudentPortal() {
  const { showToast } = useToast();
  const [studentTab, setStudentTab] = useState("classes"); // "classes" | "enroll-face" | "check-in" | "history"
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Student Hub</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage enrolled classes, register facial biometric data, and check in</p>
        </div>

        <div className="flex bg-slate-200 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setStudentTab("classes")}
            className={`px-3 py-1.5 rounded-lg transition ${
              studentTab === "classes" ? "bg-white text-indigo-600 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            My Classes
          </button>
          <button
            type="button"
            onClick={() => setStudentTab("enroll-face")}
            className={`px-3 py-1.5 rounded-lg transition ${
              studentTab === "enroll-face" ? "bg-white text-indigo-600 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Face Setup
          </button>
          <button
            type="button"
            onClick={() => setStudentTab("check-in")}
            className={`px-3 py-1.5 rounded-lg transition ${
              studentTab === "check-in" ? "bg-white text-indigo-600 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Check In
          </button>
          <button
            type="button"
            onClick={() => {
              setStudentTab("history");
              loadAttendance();
            }}
            className={`px-3 py-1.5 rounded-lg transition ${
              studentTab === "history" ? "bg-white text-indigo-600 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            History
          </button>
        </div>
      </div>

      {studentTab === "classes" && (
        <div className="space-y-6">
          <JoinClassCard onJoined={loadClasses} />
          <EnrolledClassesTable classes={classes} />
        </div>
      )}

      {studentTab === "enroll-face" && <BiometricEnrollmentCard />}

      {studentTab === "check-in" && (
        <SessionCheckInCard onCheckInSuccess={loadAttendance} />
      )}

      {studentTab === "history" && (
        <AttendanceHistoryTable records={attendance} onRefresh={loadAttendance} />
      )}
    </div>
  );
}
