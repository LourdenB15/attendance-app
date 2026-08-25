// apps/web/src/components/professor/SectionAttendanceHistory.jsx
import { useState, useEffect } from "react";
import { classesApi, sessionsApi } from "../../api";
import { useToast } from "../../context/useToast";
import { Badge } from "../ui/Badge";

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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header & Sub-Tabs */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">
            Attendance History: {className} ({section})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Review past session logs, attendance rates, and section student performance.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setHistoryTab("sessions");
              setSelectedSession(null);
            }}
            className={`px-3 py-1.5 rounded-lg transition ${
              historyTab === "sessions"
                ? "bg-white text-indigo-600 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
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
            className={`px-3 py-1.5 rounded-lg transition ${
              historyTab === "students"
                ? "bg-white text-indigo-600 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Student Summary ({studentSummary.length})
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-slate-50/50 border-b border-slate-100">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Total Sessions</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalSessions}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Total Check-Ins</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">{totalCheckIns}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Average Section Attendance</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{avgAttendance}%</p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          Loading section attendance records...
        </div>
      ) : (
        <>
          {/* TAB 1: SESSIONS LIST */}
          {historyTab === "sessions" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] tracking-wider border-b border-slate-200 font-bold">
                  <tr>
                    <th className="px-5 py-3">Session Date & Time</th>
                    <th className="px-5 py-3">Label</th>
                    <th className="px-5 py-3 text-center">Status</th>
                    <th className="px-5 py-3 text-center">Present / Total</th>
                    <th className="px-5 py-3">Attendance Rate</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-5 py-8 text-center text-slate-400 text-xs">
                        No past attendance sessions recorded for this class yet.
                      </td>
                    </tr>
                  ) : (
                    sessions.map((s) => {
                      const rate = s.total_enrolled > 0
                        ? Math.round(((s.present_count || 0) / s.total_enrolled) * 100)
                        : 0;

                      return (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition">
                          <td className="px-5 py-3.5">
                            <p className="font-semibold text-slate-900">
                              {new Date(s.opened_at).toLocaleDateString(undefined, {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                            <span className="text-[11px] text-slate-400">
                              {new Date(s.opened_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              {s.closed_at && ` - ${new Date(s.closed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-medium text-slate-700">
                            {s.label || "Regular Class Session"}
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            {s.status === "OPEN" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                OPEN
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                                CLOSED
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-center font-semibold text-slate-800">
                            {s.present_count || 0} / {s.total_enrolled || 0}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    rate >= 80
                                      ? "bg-emerald-500"
                                      : rate >= 60
                                        ? "bg-amber-500"
                                        : "bg-rose-500"
                                  }`}
                                  style={{ width: `${rate}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-bold text-slate-700">{rate}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleOpenRoster(s)}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs transition"
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
                <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] tracking-wider border-b border-slate-200 font-bold">
                  <tr>
                    <th className="px-5 py-3">Student Name</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3 text-center">Sessions Present</th>
                    <th className="px-5 py-3 text-center">Sessions Absent</th>
                    <th className="px-5 py-3 text-center">Attendance %</th>
                    <th className="px-5 py-3 text-right">Standing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentSummary.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-5 py-8 text-center text-slate-400 text-xs">
                        No enrolled students found for this section.
                      </td>
                    </tr>
                  ) : (
                    studentSummary.map((st) => {
                      const present = st.present_sessions || 0;
                      const total = totalSessions;
                      const pct = total > 0 ? Math.round((present / total) * 100) : 100;

                      return (
                        <tr key={st.student_id} className="hover:bg-slate-50/80 transition">
                          <td className="px-5 py-3.5 font-semibold text-slate-900">{st.full_name}</td>
                          <td className="px-5 py-3.5 text-xs text-slate-500 font-mono">{st.email}</td>
                          <td className="px-5 py-3.5 text-center font-bold text-emerald-600">{present}</td>
                          <td className="px-5 py-3.5 text-center font-bold text-rose-600">
                            {Math.max(0, total - present)}
                          </td>
                          <td className="px-5 py-3.5 text-center font-bold text-slate-800">{pct}%</td>
                          <td className="px-5 py-3.5 text-right">
                            {pct >= 80 ? (
                              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                                Good Standing
                              </span>
                            ) : pct >= 60 ? (
                              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                                Warning
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 rounded-full text-xs font-bold">
                                At Risk
                              </span>
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

      {/* MODAL: SPECIFIC SESSION ROSTER BREAKDOWN */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h4 className="font-bold text-slate-900 text-base">
                  {selectedSession.label || "Class Session"} Roster
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {new Date(selectedSession.opened_at).toLocaleString()} • {selectedSession.present_count || 0} / {selectedSession.total_enrolled || 0} Present
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSession(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {loadingRoster ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Loading session roster...
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] tracking-wider border-b border-slate-200 font-bold">
                    <tr>
                      <th className="px-4 py-2.5">Student Name</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Source</th>
                      <th className="px-4 py-2.5">Time</th>
                      <th className="px-4 py-2.5">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sessionRoster.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-6 text-center text-slate-400 text-xs">
                          No student records found for this session.
                        </td>
                      </tr>
                    ) : (
                      sessionRoster.map((rec) => (
                        <tr key={rec.student_id} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-900">{rec.full_name}</p>
                            <span className="text-[11px] text-slate-400 font-mono">{rec.email}</span>
                          </td>
                          <td className="px-4 py-3">
                            {rec.status === "PRESENT" ? (
                              <Badge variant="success" size="xs">✓ Present</Badge>
                            ) : rec.status === "LATE" ? (
                              <Badge variant="warning" size="xs">Late</Badge>
                            ) : (
                              <Badge variant="danger" size="xs">✕ Absent</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600">
                            {rec.source || "—"}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">
                            {rec.recorded_at ? new Date(rec.recorded_at).toLocaleTimeString() : "—"}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500 italic">
                            {rec.override_reason || "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedSession(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-xs transition"
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
