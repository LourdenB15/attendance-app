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
import { SectionAttendanceHistory } from "./SectionAttendanceHistory";
import { IconChevronLeft, IconUsers, IconClock, IconCamera } from "../ui/Icons";

export function ProfessorPortal({ activeNav, navKey = 0, onNavSelect }) {
  const { showToast } = useToast();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classViewTab, setClassViewTab] = useState("live"); // "live" | "history" | "roster"
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

  // Synchronize state when navigation triggers arrive from sidebar without cascading effect renders
  const [prevNavKey, setPrevNavKey] = useState(navKey);
  if (navKey !== prevNavKey) {
    setPrevNavKey(navKey);
    if (activeNav === "classes" || activeNav === "create-class") {
      setSelectedClass(null);
    }
  }

  // Scroll to create class card when triggered
  useEffect(() => {
    if (activeNav === "create-class") {
      const el = document.getElementById("create-class-card");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [navKey, activeNav]);

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
        const session = activeSessionRef.current;
        if (session && new Date(session.expires_at) <= new Date()) {
          // Time is up: the server closes it and returns no active session
          loadActiveSession(selectedClassRef.current.id);
        } else if (session) {
          // Poll attendance roster in real-time
          loadAttendance(session.id, true);
        } else {
          // Check if session opened
          loadActiveSession(selectedClassRef.current.id);
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
    setClassViewTab("live");
    loadStudents(cls.id);
    loadActiveSession(cls.id);
  };

  const handleBackToClasses = () => {
    setSelectedClass(null);
    setActiveSession(null);
    setSessionAttendance([]);
    loadClasses(true);
    if (onNavSelect) onNavSelect("classes");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#dadce0]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-[#202124]">
              {selectedClass ? selectedClass.name : "Teaching Hub"}
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e6f4ea] text-[#137333] border border-[#ceead6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1e8e3e] animate-pulse" />
              Live Sync
            </span>
          </div>
          <p className="text-xs text-[#5f6368] mt-0.5">
            {selectedClass
              ? `${selectedClass.section} • ${selectedClass.semester}`
              : "Manage course sections, launch biometric attendance, and view student rosters."}
          </p>
        </div>

        {selectedClass && (
          <button
            type="button"
            onClick={handleBackToClasses}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#f1f3f4] text-[#3c4043] border border-[#dadce0] font-semibold rounded-lg text-xs transition shadow-2xs self-start sm:self-auto"
          >
            <IconChevronLeft className="w-4 h-4" />
            <span>Back to All Classes</span>
          </button>
        )}
      </div>

      {!selectedClass ? (
        <div className="space-y-6">
          <div id="create-class-card">
            <CreateClassCard onCreated={loadClasses} />
          </div>
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

          {/* In-Class Navigation Tabs */}
          <div className="flex border-b border-[#dadce0] gap-6 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setClassViewTab("live")}
              className={`pb-3.5 transition-all border-b-2 flex items-center gap-2 ${
                classViewTab === "live"
                  ? "border-[#1a73e8] text-[#1a73e8] font-bold"
                  : "border-transparent text-[#5f6368] hover:text-[#202124]"
              }`}
            >
              <IconCamera className="w-4 h-4" />
              <span>Live Attendance Window</span>
              {activeSession && (
                <span className="w-2 h-2 rounded-full bg-[#1e8e3e] animate-ping" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setClassViewTab("history")}
              className={`pb-3.5 transition-all border-b-2 flex items-center gap-2 ${
                classViewTab === "history"
                  ? "border-[#1a73e8] text-[#1a73e8] font-bold"
                  : "border-transparent text-[#5f6368] hover:text-[#202124]"
              }`}
            >
              <IconClock className="w-4 h-4" />
              <span>Attendance History</span>
            </button>

            <button
              type="button"
              onClick={() => setClassViewTab("roster")}
              className={`pb-3.5 transition-all border-b-2 flex items-center gap-2 ${
                classViewTab === "roster"
                  ? "border-[#1a73e8] text-[#1a73e8] font-bold"
                  : "border-transparent text-[#5f6368] hover:text-[#202124]"
              }`}
            >
              <IconUsers className="w-4 h-4" />
              <span>
                Class Roster ({classStudents.filter((s) => s.status === "ACTIVE").length})
              </span>
            </button>
          </div>

          {/* TAB 1: LIVE SESSION */}
          {classViewTab === "live" && (
            <div className="space-y-6">
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
            </div>
          )}

          {/* TAB 2: ATTENDANCE HISTORY FOR THIS SECTION */}
          {classViewTab === "history" && (
            <SectionAttendanceHistory
              classId={selectedClass.id}
              className={selectedClass.name}
              section={selectedClass.section}
            />
          )}

          {/* TAB 3: ROSTER */}
          {classViewTab === "roster" && (
            <EnrolledStudentsTable
              classId={selectedClass.id}
              joinCode={selectedClass.join_code}
              students={classStudents}
              onStudentDropped={() => loadStudents(selectedClass.id)}
            />
          )}
        </div>
      )}
    </div>
  );
}
