import { useState, useMemo, useEffect } from "react";
import { livenessApi, classesApi } from "../../api";
import { useToast } from "../../context/useToast";
import { useAuth } from "../../context/useAuth";
import { LivenessCamera } from "../liveness/LivenessCamera";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import { Badge } from "../ui/Badge";
import { getClassTheme } from "../ui/classroomThemes";
import { TableSkeleton } from "../ui/Skeleton";
import { formatClassDisplayName } from "../../utils/classFormatting";
import { UserAvatar } from "../ui/UserAvatar";
import {
  IconChevronLeft,
  IconCamera,
  IconCheck,
  IconClose,
  IconClock,
  IconArchive,
  IconSearch,
  IconUsers,
  IconCopy,
  IconList,
  IconGrid,
  IconAlert,
} from "../ui/Icons";

export function StudentClassDetail({
  classItem,
  onBack,
  onAttendanceMarked,
  onGoToEnroll,
  attendanceRecords = [],
  loading = false,
}) {
  const { currentUser } = useAuth();
  const [detailTab, setDetailTab] = useState("attendance"); // "attendance" | "classmates"
  const [showScanner, setShowScanner] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("recorded_at");
  const [sortAsc, setSortAsc] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(null);

  // Classmates state
  const [classmates, setClassmates] = useState([]);
  const [classmatesLoading, setClassmatesLoading] = useState(false);
  const [classmatesError, setClassmatesError] = useState(null);
  const [classmateSearch, setClassmateSearch] = useState("");
  const [classmateSortField, setClassmateSortField] = useState("full_name");
  const [classmateSortAsc, setClassmateSortAsc] = useState(true);
  const [classmateViewMode, setClassmateViewMode] = useState("sheet"); // "sheet" | "cards"
  const { showToast } = useToast();

  const classId = classItem.class_id || classItem.id;

  const isEnrolled = Boolean(currentUser?.has_biometric_enrolled);
  const classRecords = attendanceRecords.filter((r) => r.class_id === classItem.class_id);

  const hasActiveSession = Boolean(classItem.active_session_id);
  const isAlreadyPresent = classItem.my_attendance_status === "PRESENT";
  const isMarkedAbsent =
    classItem.my_attendance_source === "MANUAL_OVERRIDE" && !isAlreadyPresent;

  const theme = getClassTheme(classItem.class_id || classItem.name);

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

  const filteredRecords = useMemo(() => {
    let list = classRecords.filter((r) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (r.session_label && r.session_label.toLowerCase().includes(q)) ||
        (r.status && r.status.toLowerCase().includes(q))
      );
    });

    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "recorded_at") {
        valA = a.recorded_at ? new Date(a.recorded_at).getTime() : 0;
        valB = b.recorded_at ? new Date(b.recorded_at).getTime() : 0;
      } else if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = (valB || "").toLowerCase();
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return list;
  }, [classRecords, searchQuery, sortField, sortAsc]);

  const handleCopyCode = () => {
    if (copiedCode || !classItem?.join_code) return;
    navigator.clipboard.writeText(classItem.join_code);
    setCopiedCode(true);
    showToast("info", `Class join code "${classItem.join_code}" copied!`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyEmail = (e, email) => {
    e.stopPropagation();
    if (!email || copiedEmail === email) return;
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    showToast("info", `Email "${email}" copied!`);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  useEffect(() => {
    let ignore = false;
    async function fetchClassmates() {
      if (!classId) return;
      setClassmatesLoading(true);
      setClassmatesError(null);
      try {
        const list = await classesApi.getClassStudents(classId);
        if (!ignore) {
          setClassmates(list || []);
        }
      } catch (err) {
        if (!ignore) {
          setClassmatesError(err.message || "Failed to load classmates");
        }
      } finally {
        if (!ignore) setClassmatesLoading(false);
      }
    }

    fetchClassmates();
    return () => {
      ignore = true;
    };
  }, [classId]);

  const handleClassmateSort = (field) => {
    if (classmateSortField === field) {
      setClassmateSortAsc(!classmateSortAsc);
    } else {
      setClassmateSortField(field);
      setClassmateSortAsc(true);
    }
  };

  const renderClassmateSortIndicator = (field) => {
    if (classmateSortField !== field) {
      return <span className="text-[#dadce0] ml-1 text-[10px]">↕</span>;
    }
    return (
      <span className="text-[#1a73e8] ml-1 text-[10px] font-bold">
        {classmateSortAsc ? "▲" : "▼"}
      </span>
    );
  };

  const filteredClassmates = useMemo(() => {
    let list = classmates.filter((c) => {
      if (!classmateSearch.trim()) return true;
      const q = classmateSearch.toLowerCase();
      return (
        (c.full_name && c.full_name.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q))
      );
    });

    list.sort((a, b) => {
      let valA = a[classmateSortField];
      let valB = b[classmateSortField];

      if (classmateSortField === "enrolled_at") {
        valA = a.enrolled_at ? new Date(a.enrolled_at).getTime() : 0;
        valB = b.enrolled_at ? new Date(b.enrolled_at).getTime() : 0;
      } else if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = (valB || "").toLowerCase();
      }

      if (valA < valB) return classmateSortAsc ? -1 : 1;
      if (valA > valB) return classmateSortAsc ? 1 : -1;
      return 0;
    });

    return list;
  }, [classmates, classmateSearch, classmateSortField, classmateSortAsc]);

  const handleTakeAttendanceClick = () => {
    if (!isEnrolled) {
      showToast("error", "Please enroll your face first in the Face Setup tab.");
      if (onGoToEnroll) onGoToEnroll();
      return;
    }
    setShowScanner(true);
  };

  const handleTakeAttendance = async (livenessResult) => {
    setShowScanner(false);
    setCheckingIn(true);
    try {
      const res = await livenessApi.checkIn(classItem.active_session_id, livenessResult);
      if (res.present) {
        if (onAttendanceMarked) await onAttendanceMarked();
        showToast("success", `Attendance recorded as PRESENT for ${formatClassDisplayName(classItem.name, classItem.section)}!`);
      } else {
        showToast("error", res.message || "Face not recognized. Attendance not recorded.");
      }
    } catch (err) {
      showToast("error", err.message);
      if (err.code === "ATTENDANCE_OVERRIDDEN" && onAttendanceMarked) onAttendanceMarked();
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="space-y-6">
      {checkingIn && <LoadingOverlay message="Recording your attendance..." />}

      {/* Course Header Banner */}
      <div
        style={{ background: theme.gradient, backgroundColor: theme.accentHex }}
        className={`${theme.bannerBg} rounded-2xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden`}
      >
        <div className="absolute -right-8 -bottom-12 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-black/15 hover:bg-black/25 text-white backdrop-blur-xs transition mb-3 cursor-pointer"
            >
              <IconChevronLeft className="w-3.5 h-3.5" />
              <span>Back to My Classes</span>
            </button>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
              {formatClassDisplayName(classItem.name, classItem.section)}
            </h2>
            <p className={`text-sm ${theme.subText} font-medium mt-1`}>
              Teacher: {classItem.professor_name || "Faculty Member"} • Section {classItem.section ? classItem.section.toUpperCase() : "—"} ({classItem.semester ? classItem.semester.toUpperCase() : "—"})
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl px-4 py-3 self-start md:self-auto min-w-[170px]">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-white/80 mb-0.5">
              {classItem.is_archived ? "Status" : "Class Code"}
            </span>
            <div className="flex items-center justify-between gap-2">
              <span className="text-base font-mono font-bold tracking-wider text-white select-all">
                {classItem.is_archived ? "ARCHIVED" : classItem.join_code}
              </span>
              {!classItem.is_archived && (
                <button
                  type="button"
                  disabled={copiedCode}
                  onClick={handleCopyCode}
                  className="p-1 rounded-lg bg-white/20 hover:bg-white/30 text-white transition cursor-pointer disabled:cursor-default"
                  title="Copy class code"
                >
                  {copiedCode ? (
                    <IconCheck className="w-3.5 h-3.5 text-emerald-200" />
                  ) : (
                    <IconCopy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Google Classroom Style Sub-Tab Bar */}
      <div className="flex items-center gap-1 border-b border-[#dadce0] bg-white rounded-xl px-2 shadow-2xs">
        <button
          type="button"
          onClick={() => setDetailTab("attendance")}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            detailTab === "attendance"
              ? "border-[#1a73e8] text-[#1a73e8] font-bold"
              : "border-transparent text-[#5f6368] hover:text-[#202124]"
          }`}
        >
          <IconClock className="w-4 h-4" />
          <span>Attendance & Sessions</span>
          {classRecords.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#f1f3f4] text-[#5f6368] text-[10px] font-bold">
              {classRecords.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setDetailTab("classmates")}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            detailTab === "classmates"
              ? "border-[#1a73e8] text-[#1a73e8] font-bold"
              : "border-transparent text-[#5f6368] hover:text-[#202124]"
          }`}
        >
          <IconUsers className="w-4 h-4" />
          <span>Classmates</span>
          {classmates.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#e8f0fe] text-[#1a73e8] text-[10px] font-bold">
              {classmates.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: ATTENDANCE & SESSIONS */}
      {detailTab === "attendance" && (
        <>
          {/* Live Attendance Banner Card */}
          <div className="bg-white rounded-2xl shadow-xs border border-[#dadce0] p-5 sm:p-6">
            {classItem.is_archived ? (
              <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-xl p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-white border border-[#dadce0] text-[#5f6368] flex items-center justify-center mx-auto mb-2 shadow-2xs">
                  <IconArchive className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-[#202124]">
                  Class is Archived
                </h4>
                <p className="text-xs text-[#5f6368] mt-0.5 max-w-sm mx-auto">
                  This class section has been archived. Check-in sessions are closed, but you can review past records below.
                </p>
              </div>
            ) : hasActiveSession ? (
              isAlreadyPresent ? (
                <div className="bg-[#e6f4ea] border border-[#ceead6] rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-[#1e8e3e] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <IconCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[#137333]">
                        You are Marked Present!
                      </h4>
                      <p className="text-xs text-[#0d652d] mt-0.5">
                        Your attendance has been recorded for this session.
                        {classItem.my_checked_in_at &&
                          ` Checked in at ${new Date(classItem.my_checked_in_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}.`}
                      </p>
                    </div>
                  </div>
                  <Badge variant="success" size="sm" dot>
                    PRESENT
                  </Badge>
                </div>
              ) : isMarkedAbsent ? (
                <div className="bg-[#fce8e6] border border-[#fad2cf] rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-[#d93025] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <IconClose className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[#c5221f]">
                        Marked Absent by Instructor
                      </h4>
                      <p className="text-xs text-[#a51d24] mt-0.5">
                        Your professor recorded you as absent for this session.
                      </p>
                    </div>
                  </div>
                  <Badge variant="danger" size="sm" dot>
                    ABSENT
                  </Badge>
                </div>
              ) : !isEnrolled ? (
                <div className="bg-[#fff8e1] border border-[#ffe082] rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-[#f9ab00] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <IconCamera className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[#b06000]">
                        Biometric Setup Required to Check In
                      </h4>
                      <p className="text-xs text-[#7c4400] mt-0.5">
                        An attendance window is open, but you have not registered your face yet.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onGoToEnroll}
                    className="px-5 py-2.5 bg-[#b06000] hover:bg-[#8f4e00] text-white font-bold rounded-xl shadow-xs text-xs transition shrink-0 inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span>Complete Face Setup →</span>
                  </button>
                </div>
              ) : (
                <div className="bg-[#e8f0fe] border border-[#d2e3fc] rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-[#1a73e8] text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
                      <IconCamera className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1a73e8] animate-ping" />
                        <h4 className="text-base font-bold text-[#1a73e8]">
                          Live Attendance Window is Open!
                        </h4>
                      </div>
                      <p className="text-xs text-[#1967d2] mt-0.5">
                        {classItem.active_session_label ? `Topic: ${classItem.active_session_label} • ` : ""}
                        Check in now with a quick biometric camera scan.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={checkingIn}
                    onClick={handleTakeAttendanceClick}
                    className="px-6 py-3 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white font-bold rounded-xl shadow-md text-xs transition shrink-0 inline-flex items-center gap-2 hover:scale-102 active:scale-98 cursor-pointer"
                  >
                    <IconCamera className="w-4 h-4" />
                    <span>Verify Face & Check In</span>
                  </button>
                </div>
              )
            ) : (
              <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-xl p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-white border border-[#dadce0] text-[#5f6368] flex items-center justify-center mx-auto mb-2 shadow-2xs">
                  <IconClock className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-[#202124]">
                  No Active Attendance Session
                </h4>
                <p className="text-xs text-[#5f6368] mt-0.5 max-w-sm mx-auto">
                  Your instructor has not opened an attendance window for this class right now. Please check back during class time.
                </p>
              </div>
            )}
          </div>

          {/* Class Attendance History Table */}
          <div className="bg-white rounded-2xl shadow-xs border border-[#dadce0] overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#dadce0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-[#202124] text-sm">
                  Past Class Check-Ins ({classRecords.length})
                </h3>
                <p className="text-xs text-[#5f6368] mt-0.5">
                  Records logged via active liveness or instructor override
                </p>
              </div>

              <div className="relative sm:w-60">
                <IconSearch className="w-4 h-4 text-[#5f6368] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search check-ins..."
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
            </div>

            {loading ? (
              <TableSkeleton rows={4} cols={3} headers={["Session Topic / Label", "Check-in Time", "Status"]} />
            ) : (
              <div className="overflow-x-auto overscroll-x-contain">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead className="bg-[#f8f9fa] text-[#5f6368] uppercase text-[10px] sm:text-[11px] tracking-wider border-b border-[#dadce0] font-semibold">
                    <tr>
                      <th
                        onClick={() => handleSort("session_label")}
                        className="px-3 sm:px-5 py-2.5 sm:py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition"
                      >
                        <div className="flex items-center justify-between">
                          <span>Session Topic / Label</span>
                          {renderSortIndicator("session_label")}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("recorded_at")}
                        className="px-3 sm:px-5 py-2.5 sm:py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition min-w-[130px] sm:min-w-[160px]"
                      >
                        <div className="flex items-center justify-between">
                          <span>Check-in Time</span>
                          {renderSortIndicator("recorded_at")}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("status")}
                        className="px-3 sm:px-5 py-2.5 sm:py-3 text-center cursor-pointer select-none hover:bg-[#e8eaed] transition min-w-[90px] sm:min-w-[100px]"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Status</span>
                          {renderSortIndicator("status")}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8eaed] bg-white">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-5 py-8 text-center text-xs text-[#5f6368]">
                          {searchQuery
                            ? `No check-ins match "${searchQuery}".`
                            : "No past attendance records found for this class yet."}
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((r, i) => (
                        <tr key={r.session_id || i} className="hover:bg-[#f8f9fa] transition-colors">
                          <td className="px-5 py-3.5 font-medium text-[#202124] border-r border-[#e8eaed]">
                            {r.session_label || "Standard Class Session"}
                          </td>
                          <td className="px-5 py-3.5 text-xs text-[#5f6368] border-r border-[#e8eaed]">
                            {r.recorded_at ? new Date(r.recorded_at).toLocaleString() : "—"}
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            {r.status === "PRESENT" ? (
                              <Badge variant="success" size="xs" dot>
                                Present
                              </Badge>
                            ) : r.status === "LATE" ? (
                              <Badge variant="warning" size="xs" dot>
                                Late
                              </Badge>
                            ) : (
                              <Badge variant="danger" size="xs" dot>
                                Absent
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* TAB 2: CLASSMATES & PEOPLE VIEW */}
      {detailTab === "classmates" && (
        <div className="space-y-6">
          {/* TEACHERS SECTION */}
          <div className="space-y-3">
            <div className="border-b-2 border-[#1a73e8] pb-1.5 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-[#1a73e8]">
                Teachers
              </h3>
            </div>

            <div className="bg-white rounded-2xl border border-[#dadce0] p-4 sm:p-5 flex items-center justify-between shadow-2xs hover:shadow-xs transition">
              <div className="flex items-center gap-3.5">
                <UserAvatar
                  user={{
                    full_name: classItem.professor_name || "Faculty Member",
                    email: classItem.professor_email || "",
                    avatar_url: classItem.professor_avatar_url,
                  }}
                  className="w-10 h-10 shadow-xs shrink-0"
                  textClassName="text-sm font-bold"
                />
                <div>
                  <h4 className="text-sm font-bold text-[#202124]">
                    {classItem.professor_name || "Faculty Member"}
                  </h4>
                  <p className="text-xs text-[#5f6368]">Course Instructor</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]">
                Teacher
              </span>
            </div>
          </div>

          {/* CLASSMATES SECTION */}
          <div className="space-y-3 pt-2">
            <div className="border-b-2 border-[#1a73e8] pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[#1a73e8]">
                  Classmates
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#f1f3f4] text-[#5f6368] text-xs font-semibold">
                  {classmates.length} {classmates.length === 1 ? "student" : "students"}
                </span>
              </div>

              {/* Search & Layout Controls */}
              <div className="flex items-center gap-2.5">
                <div className="relative w-full sm:w-56">
                  <IconSearch className="w-4 h-4 text-[#5f6368] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search classmates..."
                    value={classmateSearch}
                    onChange={(e) => setClassmateSearch(e.target.value)}
                    className="w-full pl-9 pr-7 py-1.5 bg-[#f8f9fa] hover:bg-white border border-[#dadce0] rounded-lg text-xs text-[#202124] placeholder-[#80868b] focus:bg-white focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#e8f0fe] transition-all"
                  />
                  {classmateSearch && (
                    <button
                      type="button"
                      onClick={() => setClassmateSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center border border-[#dadce0] rounded-lg p-0.5 bg-[#f8f9fa] shrink-0">
                  <button
                    type="button"
                    onClick={() => setClassmateViewMode("sheet")}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      classmateViewMode === "sheet"
                        ? "bg-white text-[#1a73e8] shadow-2xs font-bold"
                        : "text-[#5f6368] hover:text-[#202124]"
                    }`}
                    title="Spreadsheet Table View"
                  >
                    <IconList className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setClassmateViewMode("cards")}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      classmateViewMode === "cards"
                        ? "bg-white text-[#1a73e8] shadow-2xs font-bold"
                        : "text-[#5f6368] hover:text-[#202124]"
                    }`}
                    title="Card Grid View"
                  >
                    <IconGrid className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content Display */}
            {classmatesLoading ? (
              <div className="bg-white rounded-2xl border border-[#dadce0] overflow-hidden shadow-xs">
                <TableSkeleton
                  rows={5}
                  cols={4}
                  headers={["Classmate Name", "Email Address", "Enrolled Date", "Status"]}
                />
              </div>
            ) : classmatesError ? (
              <div className="bg-[#fef7e0] border border-[#fce8b2] rounded-2xl p-4 sm:p-5 flex items-start gap-3">
                <IconAlert className="w-5 h-5 text-[#b06000] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#b06000]">
                    Classmate Roster Notice
                  </h4>
                  <p className="text-xs text-[#7c4400] mt-0.5 leading-relaxed">
                    Student classmate roster viewing requires permission from the server. Once your backend enables student access to class rosters, all your classmates will appear here automatically.
                  </p>
                </div>
              </div>
            ) : filteredClassmates.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#dadce0] p-8 text-center shadow-xs">
                <div className="w-12 h-12 rounded-full bg-[#f1f3f4] text-[#5f6368] flex items-center justify-center mx-auto mb-2">
                  <IconUsers className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#202124]">
                  {classmateSearch ? "No classmates match your search" : "No classmates enrolled yet"}
                </h4>
                <p className="text-xs text-[#5f6368] mt-1 max-w-sm mx-auto">
                  {classmateSearch
                    ? `No students found matching "${classmateSearch}".`
                    : "Other students who join this class using the join code will be listed here."}
                </p>
              </div>
            ) : classmateViewMode === "cards" ? (
              /* CARDS GRID VIEW */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredClassmates.map((c) => {
                  const isCurrentUser = c.student_id === currentUser?.id;
                  const initial = (c.full_name || "S")[0].toUpperCase();

                  return (
                    <div
                      key={c.student_id}
                      className={`bg-white rounded-xl border border-[#dadce0] p-4 flex items-center justify-between shadow-2xs hover:shadow-xs transition ${
                        isCurrentUser ? "ring-2 ring-[#1a73e8]/30 bg-[#f8fafd]" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar
                          user={c}
                          className="w-9 h-9 shadow-xs shrink-0"
                          textClassName="text-xs font-bold"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#202124] truncate">
                              {c.full_name}
                            </span>
                            {isCurrentUser && (
                              <span className="px-1.5 py-0.2 bg-[#1a73e8] text-white rounded text-[10px] font-bold shrink-0">
                                You
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] text-[#5f6368] truncate font-mono">
                              {c.email}
                            </span>
                            <button
                              type="button"
                              disabled={copiedEmail === c.email}
                              onClick={(e) => handleCopyEmail(e, c.email)}
                              className="text-[#80868b] hover:text-[#1a73e8] cursor-pointer disabled:cursor-default"
                              title="Copy email"
                            >
                              {copiedEmail === c.email ? (
                                <IconCheck className="w-3 h-3 text-[#137333]" />
                              ) : (
                                <IconCopy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <Badge variant="success" size="xs" dot>
                        Active
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* SPREADSHEET SHEET VIEW */
              <div className="bg-white rounded-2xl shadow-xs border border-[#dadce0] overflow-hidden">
                {/* Mobile swipe helper badge (pinned above table) */}
                <div className="md:hidden px-4 py-2 bg-[#f1f3f4] border-b border-[#dadce0] text-[11px] text-[#5f6368] flex items-center justify-between">
                  <span>↔ Swipe horizontally for full spreadsheet</span>
                  <span className="text-[10px] font-semibold text-[#1a73e8]">Spreadsheet View</span>
                </div>

                <div className="overflow-x-auto overscroll-x-contain relative">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead className="bg-[#f8f9fa] text-[#5f6368] uppercase text-[10px] sm:text-[11px] tracking-wider border-b border-[#dadce0] font-semibold">
                      <tr>
                        <th
                          onClick={() => handleClassmateSort("full_name")}
                          className="px-3 sm:px-5 py-2.5 sm:py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition md:sticky md:left-0 bg-[#f8f9fa] md:z-20 md:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] min-w-[140px] sm:min-w-[180px]"
                        >
                          <div className="flex items-center justify-between">
                            <span>Classmate Name</span>
                            {renderClassmateSortIndicator("full_name")}
                          </div>
                        </th>
                        <th
                          onClick={() => handleClassmateSort("email")}
                          className="px-3 sm:px-5 py-2.5 sm:py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition min-w-[140px] sm:min-w-[180px]"
                        >
                          <div className="flex items-center justify-between">
                            <span>Email Address</span>
                            {renderClassmateSortIndicator("email")}
                          </div>
                        </th>
                        <th
                          onClick={() => handleClassmateSort("enrolled_at")}
                          className="px-3 sm:px-5 py-2.5 sm:py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition min-w-[100px] sm:min-w-[130px]"
                        >
                          <div className="flex items-center justify-between">
                            <span>Enrolled On</span>
                            {renderClassmateSortIndicator("enrolled_at")}
                          </div>
                        </th>
                        <th className="px-3 sm:px-5 py-2.5 sm:py-3 text-center min-w-[80px] sm:min-w-[100px]">
                          <span>Status</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e8eaed] bg-white">
                      {filteredClassmates.map((c) => {
                        const isCurrentUser = c.student_id === currentUser?.id;
                        const initial = (c.full_name || "S")[0].toUpperCase();

                        return (
                          <tr
                            key={c.student_id}
                            className={`hover:bg-[#f8f9fa] transition-colors group ${
                              isCurrentUser ? "bg-[#f8fafd]" : ""
                            }`}
                          >
                            {/* Classmate Name column (frozen on md+ desktop only) */}
                            <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 border-r border-[#e8eaed] md:sticky md:left-0 bg-white group-hover:bg-[#f8f9fa] md:z-10 md:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] whitespace-nowrap">
                              <div className="flex items-center gap-2.5 sm:gap-3">
                                <UserAvatar
                                  user={c}
                                  className="w-7 h-7 shadow-xs shrink-0"
                                  textClassName="text-[10px] font-bold"
                                />
                                <span className="font-semibold text-xs text-[#202124]">
                                  {c.full_name}
                                </span>
                                {isCurrentUser && (
                                  <span className="px-1.5 py-0.2 bg-[#1a73e8] text-white rounded text-[10px] font-bold">
                                    You
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs text-[#5f6368] border-r border-[#e8eaed] whitespace-nowrap">
                              <div className="flex items-center gap-2 font-mono">
                                <span>{c.email}</span>
                                <button
                                  type="button"
                                  disabled={copiedEmail === c.email}
                                  onClick={(e) => handleCopyEmail(e, c.email)}
                                  className="text-[#80868b] hover:text-[#1a73e8] p-1 rounded transition cursor-pointer disabled:cursor-default"
                                  title="Copy email"
                                >
                                  {copiedEmail === c.email ? (
                                    <IconCheck className="w-3.5 h-3.5 text-[#137333]" />
                                  ) : (
                                    <IconCopy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>

                            <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs text-[#5f6368] border-r border-[#e8eaed] whitespace-nowrap">
                              {c.enrolled_at
                                ? new Date(c.enrolled_at).toLocaleDateString([], {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "—"}
                            </td>

                            <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-center whitespace-nowrap">
                              <Badge variant="success" size="xs" dot>
                                Active
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Liveness Scanner Modal */}
      {showScanner && (
        <LivenessCamera
          title={`Attendance Check-In: ${formatClassDisplayName(classItem.name, classItem.section)}`}
          onComplete={handleTakeAttendance}
          onCancel={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
