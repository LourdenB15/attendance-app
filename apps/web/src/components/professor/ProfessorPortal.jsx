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
import { ClassDetailSkeleton } from "../ui/Skeleton";
import { Modal } from "../ui/Modal";
import {
  IconUsers,
  IconClock,
  IconCamera,
  IconPlus,
} from "../ui/Icons";
import {
  getUrlParams,
  updateUrlParams,
  saveSessionState,
  getSessionState,
} from "../../utils/navigation";
import { formatClassDisplayName } from "../../utils/classFormatting";

export function ProfessorPortal({
  activeNav,
  navKey = 0,
  onNavSelect,
  targetClassId,
  onClearTargetClass,
}) {
  const { showToast } = useToast();
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Restore sub-view tab from URL or session
  const initialParams = getUrlParams();
  const savedState = getSessionState("prof_state");
  const initialViewTab = initialParams.get("view") || savedState?.classViewTab || "live";

  const [selectedClass, setSelectedClass] = useState(null);
  const [classViewTab, setClassViewTab] = useState(initialViewTab); // "live" | "history" | "roster"
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

  // Sync sub-tab to URL and session
  useEffect(() => {
    if (selectedClass) {
      updateUrlParams({ view: classViewTab }, true);
      saveSessionState("prof_state", { classViewTab });
    }
  }, [classViewTab, selectedClass]);

  // Handle external selection from sidebar drawer or targetClassId prop
  const [prevTargetClassId, setPrevTargetClassId] = useState(targetClassId);
  if (targetClassId !== prevTargetClassId) {
    setPrevTargetClassId(targetClassId);
    if (targetClassId && classes.length > 0) {
      const found = classes.find((c) => c.id === targetClassId);
      if (found) {
        setSelectedClass(found);
      }
    }
  }

  // Synchronize state when navigation triggers arrive from sidebar
  const [prevNavKey, setPrevNavKey] = useState(navKey);
  if (navKey !== prevNavKey) {
    setPrevNavKey(navKey);
    if (activeNav === "create-class") {
      setSelectedClass(null);
      setShowCreateClassModal(true);
    } else if (activeNav === "classes" || activeNav === "archived-classes") {
      if (!targetClassId) setSelectedClass(null);
    }
  }

  const loadClasses = useCallback(async (silent = false) => {
    if (!silent) setClassesLoading(true);
    try {
      const list = await classesApi.getClasses();
      setClasses(list);
    } catch (err) {
      if (!silent) showToast("error", err.message);
    } finally {
      if (!silent) setClassesLoading(false);
    }
  }, [showToast]);

  const loadStudents = useCallback(async (classId, silent = false) => {
    if (!silent) setStudentsLoading(true);
    try {
      const list = await classesApi.getClassStudents(classId);
      setClassStudents(list);
    } catch (err) {
      if (!silent) showToast("error", err.message);
    } finally {
      if (!silent) setStudentsLoading(false);
    }
  }, [showToast]);

  const loadAttendance = useCallback(async (sessionId, silent = false) => {
    if (!silent) setAttendanceLoading(true);
    try {
      const att = await sessionsApi.getSessionAttendance(sessionId);
      setSessionAttendance(att);
    } catch (err) {
      if (!silent) showToast("error", err.message);
    } finally {
      if (!silent) setAttendanceLoading(false);
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
      setClassesLoading(true);
      try {
        const list = await classesApi.getClasses();
        if (!ignore) {
          setClasses(list);
          if (targetClassId) {
            const found = list.find((c) => c.id === targetClassId);
            if (found) {
              setSelectedClass(found);
              loadStudents(found.id, true);
              loadActiveSession(found.id);
            } else {
              if (onClearTargetClass) onClearTargetClass();
            }
          }
        }
      } catch (err) {
        if (!ignore) showToast("error", err.message);
      } finally {
        if (!ignore) setClassesLoading(false);
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
  }, [loadClasses, loadStudents, loadActiveSession, showToast, targetClassId, onClearTargetClass]);

  // Live polling interval
  useEffect(() => {
    let tick = 0;
    const timer = setInterval(() => {
      if (document.hidden) return; // don't poll if backgrounded

      tick += 1;
      if (selectedClassRef.current) {
        const session = activeSessionRef.current;
        if (session && new Date(session.expires_at) <= new Date()) {
          // Time is up: the server closes it and returns no active session
          loadActiveSession(selectedClassRef.current.id);
        } else if (session) {
          // Poll attendance roster in real-time
          loadAttendance(session.id, true);
          // Every 3rd cycle (~9s), also verify session hasn't been closed on server
          if (tick % 3 === 0) {
            loadActiveSession(selectedClassRef.current.id);
          }
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
    updateUrlParams({ classId: cls.id, view: "live" }, false);
  };

  const handleBackToClasses = () => {
    setSelectedClass(null);
    setActiveSession(null);
    setSessionAttendance([]);
    loadClasses(true);
    if (onClearTargetClass) {
      onClearTargetClass();
    } else {
      updateUrlParams({ classId: null, view: null }, false);
    }
    if (onNavSelect) onNavSelect("classes");
  };

  // If a targetClassId is waiting to be resolved and classes are loading, show Skeleton
  const isResolvingTargetClass = Boolean(targetClassId && !selectedClass && classesLoading);

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#dadce0]">
        <div className="w-full">
          {selectedClass ? (
            <div className="flex items-center justify-between gap-2 text-xs font-medium text-[#5f6368] w-full min-w-0">
              <div className="flex items-center gap-1.5 min-w-0 truncate">
                <button
                  type="button"
                  onClick={handleBackToClasses}
                  className="hover:text-[#1a73e8] transition cursor-pointer font-semibold whitespace-nowrap shrink-0"
                >
                  Teaching Hub
                </button>
                <span className="text-[#9aa0a6] shrink-0">/</span>
                <span className="font-bold text-[#202124] truncate">
                  {formatClassDisplayName(selectedClass.name, selectedClass.section)}
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e6f4ea] text-[#137333] border border-[#ceead6] shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1e8e3e] animate-pulse" />
                Live Sync
              </span>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between sm:justify-start gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-[#202124] leading-tight">Teaching Hub</h2>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#e6f4ea] text-[#137333] border border-[#ceead6] shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1e8e3e] animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-[#5f6368] mt-0.5">
                Manage course sections, launch biometric attendance, and view student rosters.
              </p>
            </div>
          )}
        </div>

        {!selectedClass && (
          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setShowCreateClassModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
            >
              <IconPlus className="w-4 h-4" />
              <span>Create Class</span>
            </button>
          </div>
        )}
      </div>

      {/* Create Class Modal */}
      <Modal
        isOpen={showCreateClassModal}
        onClose={() => setShowCreateClassModal(false)}
        title="Create Class"
        subtitle="Set up a course section with an automatic unique student join code"
      >
        <CreateClassCard
          isModal
          onCreated={() => {
            setShowCreateClassModal(false);
            loadClasses(false);
          }}
          onCancel={() => setShowCreateClassModal(false)}
        />
      </Modal>

      {isResolvingTargetClass ? (
        <ClassDetailSkeleton />
      ) : !selectedClass ? (
        <ClassesTable
          classes={classes}
          onSelectClass={handleSelectClass}
          onCreateClass={() => setShowCreateClassModal(true)}
          onRefresh={() => loadClasses(false)}
          initialTab={activeNav === "archived-classes" ? "archived" : "active"}
          loading={classesLoading}
        />
      ) : (
        <div className="space-y-6">
          {/* Class Hero Header Card */}
          <ClassDetailHeader
            selectedClass={selectedClass}
            onBack={handleBackToClasses}
          />

          {/* Sub Navigation Tabs */}
          {(() => {
            const currentViewTab =
              classViewTab === "roster"
                ? "roster"
                : classViewTab === "history"
                ? "history"
                : "live";

            return (
              <>
                <div className="flex border-b border-[#dadce0] gap-4 sm:gap-6 text-xs sm:text-sm font-semibold w-full justify-start overflow-x-auto no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setClassViewTab("live")}
                    className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 ${
                      currentViewTab === "live"
                        ? "border-[#1a73e8] text-[#1a73e8] font-bold"
                        : "border-transparent text-[#5f6368] hover:text-[#202124]"
                    }`}
                  >
                    <IconCamera className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">Live Attendance & Controller</span>
                    <span className="sm:hidden">Live</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setClassViewTab("roster")}
                    className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 ${
                      currentViewTab === "roster"
                        ? "border-[#1a73e8] text-[#1a73e8] font-bold"
                        : "border-transparent text-[#5f6368] hover:text-[#202124]"
                    }`}
                  >
                    <IconUsers className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">Class Roster ({classStudents.filter((s) => s.status === "ACTIVE").length})</span>
                    <span className="sm:hidden">Roster ({classStudents.filter((s) => s.status === "ACTIVE").length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setClassViewTab("history")}
                    className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 ${
                      currentViewTab === "history"
                        ? "border-[#1a73e8] text-[#1a73e8] font-bold"
                        : "border-transparent text-[#5f6368] hover:text-[#202124]"
                    }`}
                  >
                    <IconClock className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">Attendance History</span>
                    <span className="sm:hidden">History</span>
                  </button>
                </div>

                {/* Sub Tab Views */}
                {currentViewTab === "live" && (
            <div className="space-y-6">
              <SessionController
                classId={selectedClass.id}
                className={selectedClass.name}
                activeSession={activeSession}
                onSessionOpened={(newSession) => {
                  setActiveSession(newSession);
                  if (newSession?.id) {
                    loadAttendance(newSession.id, true);
                  }
                  loadClasses(true);
                }}
                onSessionClosed={() => {
                  setActiveSession(null);
                  setSessionAttendance([]);
                  loadClasses(true);
                }}
                onSessionChanged={(session) => {
                  if (session) {
                    setActiveSession(session);
                    if (session.id) {
                      loadAttendance(session.id, true);
                    }
                  } else {
                    setActiveSession(null);
                    setSessionAttendance([]);
                  }
                  loadClasses(true);
                }}
                onRefreshAttendance={() => activeSession && loadAttendance(activeSession.id, false)}
                refreshingAttendance={attendanceLoading}
              />

              {activeSession && (
                <LiveAttendanceGrid
                  activeSessionId={activeSession.id}
                  attendance={sessionAttendance}
                  onOverrideSuccess={() => loadAttendance(activeSession.id, true)}
                  loading={attendanceLoading}
                />
              )}
            </div>
          )}

          {currentViewTab === "roster" && (
            <EnrolledStudentsTable
              classId={selectedClass.id}
              joinCode={selectedClass.join_code}
              students={classStudents}
              onStudentDropped={() => loadStudents(selectedClass.id, false)}
              loading={studentsLoading}
            />
          )}

          {currentViewTab === "history" && (
            <SectionAttendanceHistory
              classId={selectedClass.id}
              className={selectedClass.name}
              section={selectedClass.section}
            />
          )}
        </>
      );
    })()}
  </div>
)}
    </div>
  );
}
