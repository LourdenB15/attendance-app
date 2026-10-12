// apps/web/src/components/professor/SectionAttendanceHistory.jsx
import { useState, useEffect, useMemo } from "react";
import { classesApi, sessionsApi } from "../../api";
import { useToast } from "../../context/useToast";
import { Badge } from "../ui/Badge";
import { StatCard } from "../ui/StatCard";
import { Modal } from "../ui/Modal";
import { EmptyState } from "../ui/EmptyState";
import { UserAvatar } from "../ui/UserAvatar";
import { TableSkeleton, StatCardSkeleton } from "../ui/Skeleton";
import {
  IconClock,
  IconUsers,
  IconCheck,
  IconSearch,
} from "../ui/Icons";

export function SectionAttendanceHistory({ classId, className, section }) {
  const [historyTab, setHistoryTab] = useState("sessions"); // "sessions" | "students"
  const [sessions, setSessions] = useState([]);
  const [studentSummary, setStudentSummary] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionRoster, setSessionRoster] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("opened_at");
  const [sortAsc, setSortAsc] = useState(false);
  const [mobileMode, setMobileMode] = useState("cards"); // "cards" | "sheet"
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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const renderSortIndicator = (field) => {
    if (sortField !== field) {
      return <span className="text-[#dadce0] ml-1 text-[10px]">↕</span>;
    }
    return (
      <span className="text-[#1a73e8] ml-1 text-[10px] font-bold">
        {sortAsc ? "▲" : "▼"}
      </span>
    );
  };

  const totalSessions = sessions.length;
  const totalCheckIns = sessions.reduce((sum, s) => sum + (s.present_count || 0), 0);
  const totalPossible = sessions.reduce((sum, s) => sum + (s.total_enrolled || 0), 0);
  const avgAttendance = totalPossible > 0 ? ((totalCheckIns / totalPossible) * 100).toFixed(1) : 0;

  const filteredSessions = useMemo(() => {
    let list = sessions.filter((s) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (s.label && s.label.toLowerCase().includes(q)) ||
        (s.status && s.status.toLowerCase().includes(q))
      );
    });

    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "opened_at") {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else if (sortField === "present_count") {
        valA = a.present_count || 0;
        valB = b.present_count || 0;
      } else if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = (valB || "").toLowerCase();
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return list;
  }, [sessions, searchQuery, sortField, sortAsc]);

  const filteredStudents = useMemo(() => {
    let list = studentSummary.filter((st) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (st.full_name && st.full_name.toLowerCase().includes(q)) ||
        (st.email && st.email.toLowerCase().includes(q))
      );
    });

    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "present_sessions") {
        valA = a.present_sessions || 0;
        valB = b.present_sessions || 0;
      } else if (sortField === "pct") {
        const pctA = totalSessions > 0 ? Math.round(((a.present_sessions || 0) / totalSessions) * 100) : 100;
        const pctB = totalSessions > 0 ? Math.round(((b.present_sessions || 0) / totalSessions) * 100) : 100;
        valA = pctA;
        valB = pctB;
      } else if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = (valB || "").toLowerCase();
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return list;
  }, [studentSummary, searchQuery, sortField, sortAsc, totalSessions]);

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-[#dadce0] overflow-hidden">
      {/* Header & Sub-Tabs */}
      <div className="p-4 sm:p-5 border-b border-[#dadce0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h3 className="font-bold text-[#202124] text-base">
            Attendance Analytics: {className} ({section})
          </h3>
          <p className="text-xs text-[#5f6368] mt-0.5">
            Review past attendance sessions, rate metrics, and student consistency.
          </p>
        </div>

        <div className="flex bg-[#f1f3f4] p-1 rounded-xl text-xs font-semibold overflow-x-auto scrollbar-none shrink-0">
          <button
            type="button"
            onClick={() => {
              setHistoryTab("sessions");
              setSelectedSession(null);
              setSortField("opened_at");
              setSortAsc(false);
            }}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
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
              setSortField("full_name");
              setSortAsc(true);
            }}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
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
      {loading ? (
        <div className="p-4 sm:p-5 bg-[#f8f9fa] border-b border-[#dadce0]">
          <StatCardSkeleton count={3} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-5 bg-[#f8f9fa] border-b border-[#dadce0]">
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
      )}

      {/* Search & Mobile Mode Bar */}
      <div className="p-3 sm:p-4 border-b border-[#dadce0] flex items-center justify-between gap-3 bg-white">
        <div className="relative flex-1 sm:w-64 max-w-sm">
          <IconSearch className="w-4 h-4 text-[#5f6368] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              historyTab === "sessions"
                ? "Search session logs..."
                : "Search students in summary..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-7 py-1.5 bg-[#f8f9fa] border border-[#dadce0] rounded-lg text-xs text-[#202124] placeholder-[#80868b] focus:bg-white focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#e8f0fe] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="flex md:hidden bg-[#f1f3f4] p-0.5 rounded-lg text-[11px] font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setMobileMode("cards")}
            className={`px-2 py-1 rounded transition-colors ${
              mobileMode === "cards"
                ? "bg-white text-[#1a73e8] shadow-2xs font-bold"
                : "text-[#5f6368]"
            }`}
          >
            Cards
          </button>
          <button
            type="button"
            onClick={() => setMobileMode("sheet")}
            className={`px-2 py-1 rounded transition-colors ${
              mobileMode === "sheet"
                ? "bg-white text-[#1a73e8] shadow-2xs font-bold"
                : "text-[#5f6368]"
            }`}
          >
            Sheet
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-4 sm:p-6">
          <TableSkeleton rows={5} cols={6} />
        </div>
      ) : (
        <>
          {/* TAB 1: SESSIONS LIST */}
          {historyTab === "sessions" && (
            <>
              {/* Mobile Card List (< md and mobileMode === 'cards') */}
              <div className={`${mobileMode === "cards" ? "block md:hidden" : "hidden"} divide-y divide-[#e8eaed]`}>
                {filteredSessions.length === 0 ? (
                  <div className="p-8 text-center">
                    <EmptyState
                      icon={<IconClock className="w-6 h-6" />}
                      title="No past attendance sessions"
                      description="When you launch attendance sessions, their history and attendance breakdown will appear here."
                      className="border-none p-4"
                    />
                  </div>
                ) : (
                  filteredSessions.map((s) => {
                    const rate =
                      s.total_enrolled > 0
                        ? Math.round(((s.present_count || 0) / s.total_enrolled) * 100)
                        : 0;

                    return (
                      <div
                        key={s.id}
                        className="p-4 space-y-3 hover:bg-[#f8f9fa] transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-[#202124]">
                              {s.label || "Regular Class Session"}
                            </p>
                            <p className="text-xs text-[#5f6368] mt-0.5">
                              {new Date(s.opened_at).toLocaleDateString(undefined, {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}{" "}
                              •{" "}
                              {new Date(s.opened_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>

                          <div className="shrink-0">
                            {s.status === "OPEN" ? (
                              <Badge variant="success" size="xs" dot>
                                OPEN
                              </Badge>
                            ) : (
                              <Badge variant="default" size="xs">
                                CLOSED
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-[#5f6368] bg-[#f8f9fa] p-2.5 rounded-xl border border-[#dadce0]/60">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-[#80868b] block">
                              Turnout
                            </span>
                            <span className="font-semibold text-[#202124]">
                              {s.present_count || 0} / {s.total_enrolled || 0} Present
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-[#80868b] block">
                              Rate
                            </span>
                            <span
                              className={`font-black ${
                                rate >= 80
                                  ? "text-[#137333]"
                                  : rate >= 60
                                  ? "text-[#b06000]"
                                  : "text-[#c5221f]"
                              }`}
                            >
                              {rate}%
                            </span>
                          </div>
                        </div>

                        <div className="pt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleOpenRoster(s)}
                            className="w-full py-2 bg-[#e8f0fe] hover:bg-[#d2e3fc] text-[#1a73e8] font-semibold rounded-xl text-xs transition cursor-pointer min-h-[38px]"
                          >
                            View Session Roster →
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Desktop Sessions Table (>= md or mobileMode === 'sheet') */}
              <div className={`${mobileMode === "cards" ? "hidden md:block" : "block"} overflow-x-auto relative`}>
                <div className="md:hidden px-4 py-2 bg-[#f1f3f4] border-b border-[#dadce0] text-[11px] text-[#5f6368] flex items-center justify-between">
                  <span>↔ Swipe horizontally for full spreadsheet</span>
                  <span className="text-[10px] font-semibold text-[#1a73e8]">Date column frozen</span>
                </div>

                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-[#f8f9fa] text-[#5f6368] uppercase text-[11px] tracking-wider border-b border-[#dadce0] font-semibold sticky top-0 z-10 shadow-2xs">
                    <tr>
                      <th
                        onClick={() => handleSort("opened_at")}
                        className="px-5 py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition sticky left-0 bg-[#f8f9fa] z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] min-w-[170px]"
                      >
                        <div className="flex items-center justify-between">
                          <span>Session Date & Time</span>
                          {renderSortIndicator("opened_at")}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("label")}
                        className="px-5 py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition min-w-[160px]"
                      >
                        <div className="flex items-center justify-between">
                          <span>Label</span>
                          {renderSortIndicator("label")}
                        </div>
                      </th>
                      <th className="px-5 py-3 text-center border-r border-[#dadce0]/70 min-w-[100px]">
                        Status
                      </th>
                      <th
                        onClick={() => handleSort("present_count")}
                        className="px-5 py-3 text-center border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition min-w-[130px]"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Present / Total</span>
                          {renderSortIndicator("present_count")}
                        </div>
                      </th>
                      <th className="px-5 py-3 border-r border-[#dadce0]/70 min-w-[150px]">
                        Attendance Rate
                      </th>
                      <th className="px-5 py-3 text-right min-w-[130px]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8eaed] bg-white">
                    {filteredSessions.length === 0 ? (
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
                      filteredSessions.map((s) => {
                        const rate =
                          s.total_enrolled > 0
                            ? Math.round(((s.present_count || 0) / s.total_enrolled) * 100)
                            : 0;

                        return (
                          <tr key={s.id} className="hover:bg-[#f8f9fa] transition-colors group">
                            {/* Sticky Date */}
                            <td className="px-5 py-3.5 border-r border-[#e8eaed] sticky left-0 bg-white group-hover:bg-[#f8f9fa] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                              <p className="font-semibold text-[#202124]">
                                {new Date(s.opened_at).toLocaleDateString(undefined, {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                              <span className="text-[11px] text-[#70757a]">
                                {new Date(s.opened_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 font-medium text-[#202124] border-r border-[#e8eaed]">
                              {s.label || "Regular Class Session"}
                            </td>
                            <td className="px-5 py-3.5 text-center border-r border-[#e8eaed]">
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
                            <td className="px-5 py-3.5 text-center font-semibold text-[#202124] border-r border-[#e8eaed]">
                              {s.present_count || 0} / {s.total_enrolled || 0}
                            </td>
                            <td className="px-5 py-3.5 border-r border-[#e8eaed]">
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
                                className="px-3 py-1.5 bg-[#e8f0fe] hover:bg-[#d2e3fc] text-[#1a73e8] font-semibold rounded-lg text-xs transition cursor-pointer"
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
            </>
          )}

          {/* TAB 2: STUDENT SUMMARY */}
          {historyTab === "students" && (
            <>
              {/* Mobile Student Summary Cards (< md and mobileMode === 'cards') */}
              <div className={`${mobileMode === "cards" ? "block md:hidden" : "hidden"} divide-y divide-[#e8eaed]`}>
                {filteredStudents.length === 0 ? (
                  <div className="p-8 text-center">
                    <EmptyState
                      icon={<IconUsers className="w-6 h-6" />}
                      title="No students found"
                      description="Enrolled students will appear here with calculated attendance standings."
                      className="border-none p-4"
                    />
                  </div>
                ) : (
                  filteredStudents.map((st) => {
                    const present = st.present_sessions || 0;
                    const total = totalSessions;
                    const pct = total > 0 ? Math.round((present / total) * 100) : 100;

                    return (
                      <div
                        key={st.student_id}
                        className="p-4 space-y-3 hover:bg-[#f8f9fa] transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <UserAvatar
                              user={{ full_name: st.full_name, email: st.email }}
                              className="w-10 h-10"
                              textClassName="text-sm font-bold"
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-[#202124] truncate">
                                {st.full_name}
                              </p>
                              <span className="text-xs text-[#5f6368] font-mono block truncate mt-0.5">
                                {st.email}
                              </span>
                            </div>
                          </div>

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
                        </div>

                        <div className="grid grid-cols-3 gap-2 bg-[#f8f9fa] p-2.5 rounded-xl border border-[#dadce0]/60 text-center">
                          <div>
                            <span className="block text-[10px] uppercase font-bold text-[#80868b]">
                              Present
                            </span>
                            <span className="text-xs font-bold text-[#137333]">
                              {present}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] uppercase font-bold text-[#80868b]">
                              Absent
                            </span>
                            <span className="text-xs font-bold text-[#c5221f]">
                              {Math.max(0, total - present)}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] uppercase font-bold text-[#80868b]">
                              Rate
                            </span>
                            <span className="text-xs font-bold text-[#202124]">
                              {pct}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Desktop Student Summary Table (>= md or mobileMode === 'sheet') */}
              <div className={`${mobileMode === "cards" ? "hidden md:block" : "block"} overflow-x-auto relative`}>
                <div className="md:hidden px-4 py-2 bg-[#f1f3f4] border-b border-[#dadce0] text-[11px] text-[#5f6368] flex items-center justify-between">
                  <span>↔ Swipe horizontally for full spreadsheet</span>
                  <span className="text-[10px] font-semibold text-[#1a73e8]">Student Name frozen</span>
                </div>

                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-[#f8f9fa] text-[#5f6368] uppercase text-[11px] tracking-wider border-b border-[#dadce0] font-semibold sticky top-0 z-10 shadow-2xs">
                    <tr>
                      <th
                        onClick={() => handleSort("full_name")}
                        className="px-5 py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition sticky left-0 bg-[#f8f9fa] z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] min-w-[180px]"
                      >
                        <div className="flex items-center justify-between">
                          <span>Student Name</span>
                          {renderSortIndicator("full_name")}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("email")}
                        className="px-5 py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition min-w-[180px]"
                      >
                        <div className="flex items-center justify-between">
                          <span>Email</span>
                          {renderSortIndicator("email")}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("present_sessions")}
                        className="px-5 py-3 text-center border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition min-w-[130px]"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Sessions Present</span>
                          {renderSortIndicator("present_sessions")}
                        </div>
                      </th>
                      <th className="px-5 py-3 text-center border-r border-[#dadce0]/70 min-w-[120px]">
                        Sessions Absent
                      </th>
                      <th
                        onClick={() => handleSort("pct")}
                        className="px-5 py-3 text-center border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition min-w-[120px]"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Attendance %</span>
                          {renderSortIndicator("pct")}
                        </div>
                      </th>
                      <th className="px-5 py-3 text-right min-w-[140px]">Academic Standing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8eaed] bg-white">
                    {filteredStudents.length === 0 ? (
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
                      filteredStudents.map((st) => {
                        const present = st.present_sessions || 0;
                        const total = totalSessions;
                        const pct = total > 0 ? Math.round((present / total) * 100) : 100;

                        return (
                          <tr key={st.student_id} className="hover:bg-[#f8f9fa] transition-colors group">
                            {/* Sticky frozen Student Name column */}
                            <td className="px-5 py-3.5 border-r border-[#e8eaed] sticky left-0 bg-white group-hover:bg-[#f8f9fa] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                              <div className="flex items-center gap-3">
                                <UserAvatar
                                  user={{ full_name: st.full_name, email: st.email }}
                                  className="w-8 h-8"
                                  textClassName="text-xs font-bold"
                                />
                                <span className="font-semibold text-[#202124]">
                                  {st.full_name}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-xs text-[#5f6368] font-mono border-r border-[#e8eaed]">
                              {st.email}
                            </td>
                            <td className="px-5 py-3.5 text-center font-bold text-[#137333] border-r border-[#e8eaed]">
                              {present}
                            </td>
                            <td className="px-5 py-3.5 text-center font-bold text-[#c5221f] border-r border-[#e8eaed]">
                              {Math.max(0, total - present)}
                            </td>
                            <td className="px-5 py-3.5 text-center font-bold text-[#202124] border-r border-[#e8eaed]">
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
            </>
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
          <div className="p-4">
            <TableSkeleton rows={4} cols={5} headers={["Student Name", "Status", "Source", "Time", "Notes"]} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-[#f8f9fa] text-[#5f6368] uppercase text-[11px] tracking-wider border-b border-[#dadce0] font-semibold sticky top-0 z-10 shadow-2xs">
                <tr>
                  <th className="px-4 py-2.5 border-r border-[#dadce0]/70">Student Name</th>
                  <th className="px-4 py-2.5 border-r border-[#dadce0]/70">Status</th>
                  <th className="px-4 py-2.5 border-r border-[#dadce0]/70">Source</th>
                  <th className="px-4 py-2.5 border-r border-[#dadce0]/70">Time</th>
                  <th className="px-4 py-2.5">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8eaed] bg-white">
                {sessionRoster.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-xs text-[#5f6368]">
                      No student records found for this session.
                    </td>
                  </tr>
                ) : (
                  sessionRoster.map((rec) => (
                    <tr key={rec.student_id} className="hover:bg-[#f8f9fa] transition-colors">
                      <td className="px-4 py-3 border-r border-[#e8eaed]">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            user={{ full_name: rec.full_name, email: rec.email }}
                            className="w-7 h-7"
                            textClassName="text-[10px] font-bold"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-xs sm:text-sm text-[#202124] truncate">
                              {rec.full_name}
                            </p>
                            <span className="text-[11px] text-[#5f6368] font-mono block truncate">
                              {rec.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-r border-[#e8eaed]">
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
                      <td className="px-4 py-3 text-xs text-[#5f6368] border-r border-[#e8eaed]">
                        {rec.source === "BIOMETRIC_LIVENESS"
                          ? "Face Biometric"
                          : rec.source || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#5f6368] border-r border-[#e8eaed]">
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
