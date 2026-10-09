// apps/web/src/components/professor/SectionAttendanceHistory.jsx
import { useState, useEffect } from "react";
import { classesApi, sessionsApi } from "../../api";
import { useToast } from "../../context/useToast";
import { Badge } from "../ui/Badge";
import { StatCard } from "../ui/StatCard";
import { Modal } from "../ui/Modal";
import { EmptyState } from "../ui/EmptyState";
import {
  IconClock,
  IconUsers,
  IconCheck,
} from "../ui/Icons";

export function SectionAttendanceHistory({ classId, className, section }) {
  const [historyTab, setHistoryTab] = useState("sessions"); // "sessions" | "students"
  const [sessions, setSessions] = useState([]);
  const [studentSummary, setStudentSummary] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionRoster, setSessionRoster] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    let ignore = false;
    async function fetchHistory() {
      setLoading(true);
      try {
        const [sessList, summList] = await Promise.all([
          classesApi.getClassAttendanceHistory(classId),
          classesApi.getClassAttendanceSummary(classId),
        ]);
        if (!ignore) {
          setSessions(sessList || []);
          setStudentSummary(summList || []);
        }
      } catch (err) {
        if (!ignore) showToast("error", err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchHistory();

    return () => {
      ignore = true;
    };
  }, [classId, showToast]);

  const handleOpenRoster = async (session) => {
    setSelectedSession(session);
    setLoadingRoster(true);
    try {
      const roster = await sessionsApi.getSessionAttendance(session.id);
      setSessionRoster(roster || []);
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setLoadingRoster(false);
    }
  };

  const totalSessions = sessions.length;
  const totalCheckIns = sessions.reduce((sum, s) => sum + (s.present_count || 0), 0);
  const totalPossible = sessions.reduce((sum, s) => sum + (s.total_enrolled || 0), 0);
  const avgAttendance = totalPossible > 0 ? ((totalCheckIns / totalPossible) * 100).toFixed(1) : 0;

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-[#dadce0] overflow-hidden">
      {/* Header & Sub-Tabs */}
      <div className="p-5 border-b border-[#dadce0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-[#202124] text-base">
            Attendance Analytics: {className} ({section})
          </h3>
          <p className="text-xs text-[#5f6368] mt-0.5">
            Review past attendance sessions, rate metrics, and student consistency.
          </p>
        </div>

        <div className="flex bg-[#f1f3f4] p-1 rounded-lg text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => {
              setHistoryTab("sessions");
              setSelectedSession(null);
            }}
            className={`px-3.5 py-1.5 rounded-md transition-all ${
              historyTab === "sessions"
                ? "bg-white text-[#1a73e8] shadow-xs font-bold"
                : "text-[#5f6368] hover:text-[#202124]"
            }`}
          >
            Session Logs ({totalSessions})
          </button>
          <button
            type="button"
            onClick={() => {
              setHistoryTab("students");
              setSelectedSession(null);
            }}
            className={`px-3.5 py-1.5 rounded-md transition-all ${
              historyTab === "students"
                ? "bg-white text-[#1a73e8] shadow-xs font-bold"
                : "text-[#5f6368] hover:text-[#202124]"
            }`}
          >
            Student Summary ({studentSummary.length})
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-[#f8f9fa] border-b border-[#dadce0]">
        <StatCard
          icon={<IconClock className="w-6 h-6" />}
          label="Total Sessions"
          value={totalSessions}
          subtitle="Conducted to date"
          variant="gray"
        />
        <StatCard
          icon={<IconCheck className="w-6 h-6" />}
          label="Total Check-Ins"
          value={totalCheckIns}
          subtitle="Biometric & manual records"
          variant="blue"
        />
        <StatCard
          icon={<IconUsers className="w-6 h-6" />}
          label="Average Attendance"
          value={`${avgAttendance}%`}
          subtitle="Across all students"
          variant={Number(avgAttendance) >= 75 ? "green" : "amber"}
        />
      </div>

      {loading ? (
        <div className="p-12 text-center text-[#5f6368] text-xs">
          Loading section attendance records...
        </div>
      ) : (
        <>
          {/* TAB 1: SESSIONS LIST */}
          {historyTab === "sessions" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#f8f9fa] text-[#5f6368] uppercase text-[11px] tracking-wider border-b border-[#dadce0] font-semibold">
                  <tr>
                    <th className="px-5 py-3">Session Date & Time</th>
                    <th className="px-5 py-3">Topic / Label</th>
                    <th className="px-5 py-3 text-center">Status</th>
                    <th className="px-5 py-3 text-center">Present / Total</th>
                    <th className="px-5 py-3">Attendance Rate</th>
                    <th className="px-5 py-3 text-right">Roster</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8eaed]">
                  {sessions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center">
                        <EmptyState
                          icon={<IconClock className="w-6 h-6" />}
                          title="No past attendance sessions"
                          description="When you launch attendance sessions, their history and attendance breakdown will appear here."
                          className="border-none p-4"
                        />
                      </td>
                    </tr>
                  ) : (
                    sessions.map((s) => {
                      const rate =
                        s.total_enrolled > 0
                          ? Math.round(((s.present_count || 0) / s.total_enrolled) * 100)
                          : 0;

                      return (
                        <tr key={s.id} className="hover:bg-[#f8f9fa] transition-colors">
                          <td className="px-5 py-3.5">
                            <p className="font-semibold text-[#202124]">
                              {new Date(s.opened_at).toLocaleDateString(undefined, {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                            <span className="text-[11px] text-[#5f6368]">
                              {new Date(s.opened_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              {s.closed_at &&
                                ` – ${new Date(s.closed_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}`}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-medium text-[#202124]">
                            {s.label || "Regular Class Session"}
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            {s.status === "OPEN" ? (
                              <Badge variant="success" size="xs" dot>
                                OPEN
                              </Badge>
                            ) : (
                              <Badge variant="default" size="xs">
                                CLOSED
                              </Badge>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-center font-semibold text-[#202124]">
                            {s.present_count || 0} / {s.total_enrolled || 0}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-24 bg-[#e8eaed] rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    rate >= 80
                                      ? "bg-[#137333]"
                                      : rate >= 60
                                      ? "bg-[#b06000]"
                                      : "bg-[#c5221f]"
                                  }`}
                                  style={{ width: `${rate}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-[#202124]">{rate}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleOpenRoster(s)}
                              className="px-3 py-1.5 bg-[#e8f0fe] hover:bg-[#d2e3fc] text-[#1a73e8] font-semibold rounded-lg text-xs transition"
                            >
                              View Roster →
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: STUDENT SUMMARY */}
          {historyTab === "students" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#f8f9fa] text-[#5f6368] uppercase text-[11px] tracking-wider border-b border-[#dadce0] font-semibold">
                  <tr>
                    <th className="px-5 py-3">Student Name</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3 text-center">Sessions Present</th>
                    <th className="px-5 py-3 text-center">Sessions Absent</th>
                    <th className="px-5 py-3 text-center">Attendance %</th>
                    <th className="px-5 py-3 text-right">Academic Standing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8eaed]">
                  {studentSummary.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center">
                        <EmptyState
                          icon={<IconUsers className="w-6 h-6" />}
                          title="No students found"
                          description="Enrolled students will appear here with calculated attendance standings."
                          className="border-none p-4"
                        />
                      </td>
                    </tr>
                  ) : (
                    studentSummary.map((st) => {
                      const present = st.present_sessions || 0;
                      const total = totalSessions;
                      const pct = total > 0 ? Math.round((present / total) * 100) : 100;

                      return (
                        <tr key={st.student_id} className="hover:bg-[#f8f9fa] transition-colors">
                          <td className="px-5 py-3.5 font-semibold text-[#202124]">
                            {st.full_name}
                          </td>
                          <td className="px-5 py-3.5 text-xs text-[#5f6368] font-mono">
                            {st.email}
                          </td>
                          <td className="px-5 py-3.5 text-center font-bold text-[#137333]">
                            {present}
                          </td>
                          <td className="px-5 py-3.5 text-center font-bold text-[#c5221f]">
                            {Math.max(0, total - present)}
                          </td>
                          <td className="px-5 py-3.5 text-center font-bold text-[#202124]">
                            {pct}%
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            {pct >= 80 ? (
                              <Badge variant="success" size="xs">
                                Good Standing
                              </Badge>
                            ) : pct >= 60 ? (
                              <Badge variant="warning" size="xs">
                                Warning
                              </Badge>
                            ) : (
                              <Badge variant="danger" size="xs">
                                At Risk
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* SESSION ROSTER MODAL */}
      <Modal
        isOpen={Boolean(selectedSession)}
        onClose={() => setSelectedSession(null)}
        title={`${selectedSession?.label || "Class Session"} Roster`}
        subtitle={
          selectedSession
            ? `${new Date(selectedSession.opened_at).toLocaleString()} • ${
                selectedSession.present_count || 0
              } / ${selectedSession.total_enrolled || 0} Students Present`
            : ""
        }
        maxWidth="max-w-2xl"
      >
        {loadingRoster ? (
          <div className="p-8 text-center text-[#5f6368] text-xs">
            Loading session roster records...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f8f9fa] text-[#5f6368] uppercase text-[11px] tracking-wider border-b border-[#dadce0] font-semibold">
                <tr>
                  <th className="px-4 py-2.5">Student Name</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Source</th>
                  <th className="px-4 py-2.5">Time</th>
                  <th className="px-4 py-2.5">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8eaed]">
                {sessionRoster.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-xs text-[#5f6368]">
                      No student records found for this session.
                    </td>
                  </tr>
                ) : (
                  sessionRoster.map((rec) => (
                    <tr key={rec.student_id} className="hover:bg-[#f8f9fa] transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#202124]">{rec.full_name}</p>
                        <span className="text-[11px] text-[#5f6368] font-mono">{rec.email}</span>
                      </td>
                      <td className="px-4 py-3">
                        {rec.status === "PRESENT" ? (
                          <Badge variant="success" size="xs" dot>
                            Present
                          </Badge>
                        ) : rec.status === "LATE" ? (
                          <Badge variant="warning" size="xs" dot>
                            Late
                          </Badge>
                        ) : (
                          <Badge variant="danger" size="xs" dot>
                            Absent
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#5f6368]">
                        {rec.source === "BIOMETRIC_LIVENESS"
                          ? "Face Biometric"
                          : rec.source || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#5f6368]">
                        {rec.recorded_at
                          ? new Date(rec.recorded_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#70757a] italic">
                        {rec.override_reason || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
}
