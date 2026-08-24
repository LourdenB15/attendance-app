// apps/web/src/components/professor/ProfessorPortal.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { classesApi, sessionsApi } from "../../api";
import { useToast } from "../../context/useToast";
import { CreateClassCard } from "./CreateClassCard";
import { ClassesTable } from "./ClassesTable";
import { ClassDetailHeader } from "./ClassDetailHeader";
import { SessionController } from "./SessionController";
import { LiveAttendanceGrid } from "./LiveAttendanceGrid";
import { EnrolledStudentsTable } from "./EnrolledStudentsTable";

export function ProfessorPortal() {
  const { showToast } = useToast();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionAttendance, setSessionAttendance] = useState([]);

  const selectedClassRef = useRef(selectedClass);
  const activeSessionRef = useRef(activeSession);

  useEffect(() => {
    selectedClassRef.current = selectedClass;
  }, [selectedClass]);

  useEffect(() => {
    activeSessionRef.current = activeSession;
  }, [activeSession]);

  const loadClasses = useCallback(async (silent = false) => {
    try {
      const list = await classesApi.getClasses();
      setClasses(list);
    } catch (err) {
      if (!silent) showToast("error", err.message);
    }
  }, [showToast]);

  const loadStudents = useCallback(async (classId, silent = false) => {
    try {
      const list = await classesApi.getClassStudents(classId);
      setClassStudents(list);
    } catch (err) {
      if (!silent) showToast("error", err.message);
    }
  }, [showToast]);

  const loadAttendance = useCallback(async (sessionId, silent = false) => {
    try {
      const att = await sessionsApi.getSessionAttendance(sessionId);
      setSessionAttendance(att);
    } catch (err) {
      if (!silent) showToast("error", err.message);
    }
  }, [showToast]);

  const loadActiveSession = useCallback(async (classId) => {
    try {
      const session = await sessionsApi.getActiveSession(classId);
      if (session) {
        setActiveSession(session);
        loadAttendance(session.id, true);
      } else {
        setActiveSession(null);
        setSessionAttendance([]);
      }
    } catch {
      setActiveSession(null);
      setSessionAttendance([]);
    }
  }, [loadAttendance]);

  // Initial fetch and focus / visibility re-fetch
  useEffect(() => {
    let ignore = false;
    async function fetchInitial() {
      try {
        const list = await classesApi.getClasses();
        if (!ignore) setClasses(list);
      } catch (err) {
        if (!ignore) showToast("error", err.message);
      }
    }
    fetchInitial();

    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        if (selectedClassRef.current) {
          loadStudents(selectedClassRef.current.id, true);
          loadActiveSession(selectedClassRef.current.id);
        } else {
          loadClasses(true);
        }
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      ignore = true;
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [loadClasses, loadStudents, loadActiveSession, showToast]);

  // Live polling interval
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.hidden) return; // don't poll if backgrounded

      if (selectedClassRef.current) {
        if (activeSessionRef.current) {
          // Poll attendance roster in real-time
          loadAttendance(activeSessionRef.current.id, true);
        } else {
          // Check if session opened
          loadActiveSession(selectedClassRef.current.id, true);
        }
      } else {
        // Poll classes table
        loadClasses(true);
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [loadAttendance, loadActiveSession, loadClasses]);

  const handleSelectClass = (cls) => {
    setSelectedClass(cls);
    loadStudents(cls.id);
    loadActiveSession(cls.id);
  };

  const handleBackToClasses = () => {
    setSelectedClass(null);
    setActiveSession(null);
    setSessionAttendance([]);
    loadClasses();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Professor Portal</h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage classes, launch attendance sessions, and review rosters
          </p>
        </div>

        {selectedClass && (
          <button
            type="button"
            onClick={handleBackToClasses}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition flex items-center gap-1.5"
          >
            ← Back to Classes List
          </button>
        )}
      </div>

      {!selectedClass ? (
        <div className="space-y-6">
          <CreateClassCard onCreated={loadClasses} />
          <ClassesTable
            classes={classes}
            onSelectClass={handleSelectClass}
            onRefresh={loadClasses}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <ClassDetailHeader
            selectedClass={selectedClass}
            onBack={handleBackToClasses}
          />

          {!selectedClass.is_archived && (
            <SessionController
              classId={selectedClass.id}
              activeSession={activeSession}
              onSessionOpened={(session) => {
                setActiveSession(session);
                loadAttendance(session.id);
              }}
              onSessionClosed={() => {
                setActiveSession(null);
                setSessionAttendance([]);
              }}
              onRefreshAttendance={() => {
                if (activeSession) loadAttendance(activeSession.id);
              }}
            />
          )}

          {activeSession && (
            <LiveAttendanceGrid
              activeSessionId={activeSession.id}
              attendance={sessionAttendance}
              onOverrideSuccess={() => loadAttendance(activeSession.id)}
            />
          )}

          <EnrolledStudentsTable
            classId={selectedClass.id}
            joinCode={selectedClass.join_code}
            students={classStudents}
            onStudentDropped={() => loadStudents(selectedClass.id)}
          />
        </div>
      )}
    </div>
  );
}
