// apps/web/src/components/student/EnrolledClassesTable.jsx
import { useState, useEffect, useMemo } from "react";
import { Badge } from "../ui/Badge";
import { getClassTheme } from "../ui/classroomThemes";
import { EmptyState } from "../ui/EmptyState";
import { useToast } from "../../context/useToast";
import { useConfirm } from "../../context/useConfirm";
import { TableSkeleton, ClassGridSkeleton } from "../ui/Skeleton";
import { GoogleProgressBar } from "../ui/ProgressBar";
import {
  getStudentArchivedIds,
  saveStudentArchivedIds,
} from "../../utils/studentArchivedClasses";
import { formatClassDisplayName } from "../../utils/classFormatting";
import {
  IconBook,
  IconGrid,
  IconList,
  IconSearch,
  IconCamera,
  IconCheck,
  IconChevronRight,
  IconPlus,
  IconArchive,
  IconRefresh,
  IconDotsVertical,
  IconCopy,
} from "../ui/Icons";

export function EnrolledClassesTable({
  classes = [],
  studentId,
  initialTab = "active",
  onSelectClass,
  onTakeAttendance,
  isBiometricEnrolled = true,
  onOpenJoin,
  onRefresh,
  loading = false,
}) {
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"
  const [searchQuery, setSearchQuery] = useState("");
  const [listTab, setListTab] = useState(initialTab); // "active" | "archived"
  const [sortField, setSortField] = useState("name"); // "name" | "professor_name" | "section" | "join_code" | "status"
  const [sortAsc, setSortAsc] = useState(true);
  const [studentArchivedIds, setStudentArchivedIds] = useState(() =>
    getStudentArchivedIds(studentId),
  );
  const [openMenuId, setOpenMenuId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const { showToast } = useToast();
  const confirm = useConfirm();

  // Dismiss card dropdown on outside click or tap
  useEffect(() => {
    if (!openMenuId) return;
    const handleClickOutside = (e) => {
      if (!e.target.closest("[data-menu-dropdown]")) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [openMenuId]);

  // Sync initialTab when navigation changes
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);
  if (initialTab !== prevInitialTab) {
    setPrevInitialTab(initialTab);
    setListTab(initialTab);
  }

  const isArchivedByProfessor = (c) => Boolean(c.is_archived);
  const isArchivedByStudent = (c) => studentArchivedIds.includes(c.class_id);
  const isClassArchived = (c) => isArchivedByProfessor(c) || isArchivedByStudent(c);

  const activeClasses = classes.filter((c) => !isClassArchived(c));
  const archivedClasses = classes.filter((c) => isClassArchived(c));
  const pool = listTab === "archived" ? archivedClasses : activeClasses;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const visibleClasses = useMemo(() => {
    let list = pool.filter((c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.professor_name && c.professor_name.toLowerCase().includes(q)) ||
        (c.section && c.section.toLowerCase().includes(q)) ||
        (c.semester && c.semester.toLowerCase().includes(q)) ||
        (c.join_code && c.join_code.toLowerCase().includes(q))
      );
    });

    list.sort((a, b) => {
      let valA = a[sortField] || "";
      let valB = b[sortField] || "";

      if (sortField === "status") {
        valA = a.my_attendance_status === "PRESENT" ? 2 : a.active_session_id ? 1 : 0;
        valB = b.my_attendance_status === "PRESENT" ? 2 : b.active_session_id ? 1 : 0;
      } else if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return list;
  }, [pool, searchQuery, sortField, sortAsc]);

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

  const handleArchiveClass = async (c) => {
    setOpenMenuId(null);
    const confirmed = await confirm({
      title: "Archive this class?",
      message: `Are you sure you want to archive ${c.name}? You can find it under Archived Classes and restore it anytime.`,
      confirmLabel: "Archive Class",
      danger: true,
    });
    if (!confirmed) return;

    const next = [...studentArchivedIds, c.class_id];
    setStudentArchivedIds(next);
    saveStudentArchivedIds(studentId, next);
    showToast("info", `${c.name} moved to Archived Classes.`);
  };

  const handleUnarchiveClass = (c) => {
    setOpenMenuId(null);
    const next = studentArchivedIds.filter((id) => id !== c.class_id);
    setStudentArchivedIds(next);
    saveStudentArchivedIds(studentId, next);
    showToast("success", `${c.name} restored to active enrolled classes.`);
  };

  const handleCopyCode = (e, code, id) => {
    e.stopPropagation();
    if (!code || copiedId === id) return;
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    showToast("info", `Class code "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & View Controls */}
      <div className="bg-white border border-[#dadce0] rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        {/* Segmented Tab Toggle: Active vs Archived */}
        <div className="flex bg-[#f1f3f4] p-1 rounded-lg text-xs font-semibold overflow-x-auto scrollbar-none whitespace-nowrap shrink-0">
          <button
            type="button"
            onClick={() => setListTab("active")}
            className={`px-3.5 py-1.5 rounded-md transition-all whitespace-nowrap cursor-pointer ${
              listTab === "active"
                ? "bg-white text-[#1a73e8] shadow-xs font-bold"
                : "text-[#5f6368] hover:text-[#202124]"
            }`}
          >
            Active Classes ({activeClasses.length})
          </button>
          <button
            type="button"
            onClick={() => setListTab("archived")}
            className={`px-3.5 py-1.5 rounded-md transition-all whitespace-nowrap cursor-pointer ${
              listTab === "archived"
                ? "bg-white text-[#1a73e8] shadow-xs font-bold"
                : "text-[#5f6368] hover:text-[#202124]"
            }`}
          >
            Archived ({archivedClasses.length})
          </button>
        </div>

        {/* Search & Grid/Table View Switcher */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <IconSearch className="w-4 h-4 text-[#5f6368] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search classes or teachers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-7 py-2 sm:py-1.5 bg-[#f8f9fa] hover:bg-white border border-[#dadce0] rounded-lg text-xs text-[#202124] placeholder-[#80868b] focus:bg-white focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#e8f0fe] transition-all"
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

          <div className="flex items-center border border-[#dadce0] rounded-lg p-0.5 bg-[#f8f9fa] shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-[#1a73e8] shadow-2xs"
                  : "text-[#5f6368] hover:text-[#202124]"
              }`}
              title="Card Grid View"
              aria-label="Card Grid View"
            >
              <IconGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-[#1a73e8] shadow-2xs"
                  : "text-[#5f6368] hover:text-[#202124]"
              }`}
              title="Spreadsheet Table View"
              aria-label="Spreadsheet Table View"
            >
              <IconList className="w-4 h-4" />
            </button>
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#f1f3f4] border border-[#dadce0] rounded-lg text-xs font-semibold text-[#3c4043] transition shadow-2xs shrink-0 cursor-pointer disabled:opacity-70"
              title="Refresh classes"
            >
              <IconRefresh className={`w-3.5 h-3.5 text-[#5f6368] ${loading ? "animate-spin text-[#1a73e8]" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* Pinned Google Indeterminate Progress Bar during background refresh */}
      {loading && visibleClasses.length > 0 && (
        <div className="rounded-xl overflow-hidden -mb-1 shadow-2xs">
          <GoogleProgressBar height="h-1" />
        </div>
      )}

      {/* Loading Skeleton on Cold Start (no existing data) */}
      {loading && visibleClasses.length === 0 ? (
        viewMode === "grid" ? (
          <ClassGridSkeleton count={6} />
        ) : (
          <div className="bg-white rounded-xl shadow-xs border border-[#dadce0] overflow-hidden">
            <TableSkeleton
              rows={5}
              cols={6}
              headers={["Class Name", "Teacher", "Section / Term", "Class Code", "Status", "Action"]}
            />
          </div>
        )
      ) : visibleClasses.length === 0 ? (
        <EmptyState
          icon={<IconBook className="w-7 h-7" />}
          title={
            searchQuery
              ? "No classes match your search"
              : listTab === "archived"
              ? "No archived classes"
              : "No enrolled classes yet"
          }
          description={
            searchQuery
              ? `No enrolled courses match "${searchQuery}".`
              : listTab === "archived"
              ? "Classes you or your professor archive will appear here."
              : "Join your first class by clicking 'Join Class' or entering a teacher's invite code."
          }
          action={
            !searchQuery && listTab === "active" && onOpenJoin ? (
              <button
                type="button"
                onClick={onOpenJoin}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
              >
                <IconPlus className="w-4 h-4" />
                <span>Join a Class</span>
              </button>
            ) : null
          }
        />
      ) : viewMode === "grid" ? (
        /* GOOGLE CLASSROOM CARD GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleClasses.map((c) => {
            const theme = getClassTheme(c.class_id || c.name);
            const isProfArchived = isArchivedByProfessor(c);
            const isSelfArchived = isArchivedByStudent(c);
            const hasActive = Boolean(c.active_session_id) && !isProfArchived;
            const isPresent = c.my_attendance_status === "PRESENT";
            const isMarkedAbsent =
              c.my_attendance_source === "MANUAL_OVERRIDE" && !isPresent;

            return (
              <div
                key={c.class_id}
                onClick={(e) => {
                  if (e.target.closest("[data-menu-dropdown]")) return;
                  if (onSelectClass) onSelectClass(c.class_id);
                }}
                className={`bg-white rounded-2xl border border-[#dadce0] flex flex-col group relative ${
                  openMenuId === c.class_id
                    ? "z-40 shadow-sm border-[#dadce0]"
                    : isProfArchived
                    ? "z-0 opacity-75"
                    : "z-0 hover:shadow-md hover:border-[#bdc1c6] cursor-pointer transition-all duration-200"
                }`}
              >
                {/* Header Banner */}
                <div
                  style={{ background: theme.gradient, backgroundColor: theme.accentHex }}
                  className={`p-5 text-white flex flex-col justify-between min-h-[120px] relative rounded-t-2xl ${theme.headerBg || theme.bannerBg}`}
                >
                  <div className="absolute inset-0 overflow-hidden rounded-t-2xl pointer-events-none">
                    <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-15">
                      <IconBook className="w-28 h-28" />
                    </div>
                  </div>

                  <div className={`flex items-start justify-between gap-3 relative ${openMenuId === c.class_id ? "z-40" : "z-10"}`}>
                    <div className="min-w-0 flex-1">
                      <h3 className={`font-bold text-lg sm:text-xl leading-tight truncate ${openMenuId === c.class_id ? "" : "group-hover:underline"}`}>
                        {formatClassDisplayName(c.name, c.section)}
                      </h3>
                      <p className="text-xs text-white/90 font-medium mt-0.5 truncate">
                        Section {c.section ? c.section.toUpperCase() : "—"}
                      </p>
                    </div>

                    <div className="relative shrink-0" data-menu-dropdown>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === c.class_id ? null : c.class_id);
                        }}
                        className={`p-1.5 rounded-full transition-colors duration-75 cursor-pointer outline-none focus:outline-none ${
                          openMenuId === c.class_id
                            ? "bg-white/25 text-white shadow-xs"
                            : "text-white/80 hover:text-white hover:bg-white/15"
                        }`}
                        title="Class options"
                        aria-label="Class options"
                      >
                        <IconDotsVertical className="w-5 h-5" />
                      </button>

                      {openMenuId === c.class_id && (
                        <div
                          className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-2xl shadow-xl border border-[#dadce0] p-1.5 z-50 text-[#202124] text-xs font-medium animate-in fade-in zoom-in-95 duration-75 outline-none select-none"
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            disabled={copiedId === c.class_id}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleCopyCode(e, c.join_code, c.class_id);
                            }}
                            onClick={(e) => handleCopyCode(e, c.join_code, c.class_id)}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#f1f3f4] active:bg-[#e8eaed] flex items-center gap-2.5 transition-colors duration-75 text-[#202124] cursor-pointer disabled:cursor-default disabled:opacity-60 outline-none focus:outline-none"
                          >
                            <IconCopy className="w-4 h-4 text-[#5f6368]" />
                            <span>{copiedId === c.class_id ? "Copied" : "Copy code"}</span>
                          </button>
                          {!isSelfArchived && !isProfArchived ? (
                            <button
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleArchiveClass(c);
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleArchiveClass(c);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#fce8e6] active:bg-[#fad2cf] flex items-center gap-2.5 transition-colors duration-75 text-[#d93025] hover:text-[#b3261e] cursor-pointer outline-none focus:outline-none"
                            >
                              <IconArchive className="w-4 h-4 text-[#d93025]" />
                              <span>Archive</span>
                            </button>
                          ) : isSelfArchived ? (
                            <button
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleUnarchiveClass(c);
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleUnarchiveClass(c);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#e8f0fe] active:bg-[#d2e3fc] flex items-center gap-2.5 transition-colors duration-75 text-[#1a73e8] cursor-pointer outline-none focus:outline-none"
                            >
                              <IconRefresh className="w-4 h-4 text-[#1a73e8]" />
                              <span>Restore</span>
                            </button>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative z-0 flex items-center justify-between text-xs text-white/90 pt-3">
                    <span className="font-medium truncate">
                      {c.professor_name || "Faculty Member"}
                    </span>
                    {isProfArchived ? (
                      <span className="bg-black/25 px-2 py-0.5 rounded text-[11px] font-semibold">
                        Archived
                      </span>
                    ) : isSelfArchived ? (
                      <span className="bg-black/25 px-2 py-0.5 rounded text-[11px] font-semibold">
                        Archived by You
                      </span>
                    ) : (
                      <span className="font-mono text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded">
                        {c.join_code}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[#5f6368]">
                      <span className="font-semibold">Term:</span>
                      <span>{c.semester}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#f1f3f4]">
                      <span className="font-semibold text-[#5f6368]">Attendance:</span>
                      {isProfArchived ? (
                        <span className="text-[#70757a] italic">Archived (Closed)</span>
                      ) : hasActive ? (
                        isPresent ? (
                          <Badge variant="success" size="xs" dot>
                            Present
                          </Badge>
                        ) : isMarkedAbsent ? (
                          <Badge variant="danger" size="xs" dot>
                            Marked Absent
                          </Badge>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#e8f0fe] text-[#1a73e8] animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1a73e8]" />
                            Live Session
                          </span>
                        )
                      ) : (
                        <span className="text-[#70757a]">No active session</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#e8eaed] flex items-center justify-between">
                    {isProfArchived ? (
                      <span className="text-xs font-semibold text-[#5f6368]">
                        View records →
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          disabled={copiedId === c.class_id}
                          onClick={(e) => handleCopyCode(e, c.join_code, c.class_id)}
                          className="text-xs text-[#5f6368] hover:text-[#1a73e8] disabled:hover:text-[#5f6368] font-mono font-medium flex items-center gap-1 cursor-pointer disabled:cursor-default transition-colors"
                          title="Copy join code"
                        >
                          {copiedId === c.class_id ? (
                            <>
                              <IconCheck className="w-3.5 h-3.5 text-[#137333]" />
                              <span className="text-[#137333] font-semibold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <IconCopy className="w-3.5 h-3.5" />
                              <span>{c.join_code || "Code"}</span>
                            </>
                          )}
                        </button>

                        {hasActive && !isPresent && !isMarkedAbsent ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onTakeAttendance) onTakeAttendance(c.class_id);
                            }}
                            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer ${
                              !isBiometricEnrolled
                                ? "bg-[#b06000] hover:bg-[#8f4e00]"
                                : "bg-[#1a73e8] hover:bg-[#1557b0]"
                            }`}
                          >
                            <IconCamera className="w-3.5 h-3.5" />
                            <span>
                              {!isBiometricEnrolled ? "Setup Face" : "Take Attendance"}
                            </span>
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-[#1a73e8] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                            <span>Open Class</span>
                            <IconChevronRight className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* SPREADSHEET TABLE VIEW */
        <div className="bg-white rounded-xl shadow-xs border border-[#dadce0] overflow-hidden">
          {/* Mobile swipe helper (pinned above table) */}
          <div className="sm:hidden px-4 py-2 bg-[#f1f3f4] border-b border-[#dadce0] text-[11px] text-[#5f6368] flex items-center justify-between">
            <span>↔ Swipe horizontally for full spreadsheet</span>
            <span className="text-[10px] font-semibold text-[#1a73e8]">Spreadsheet View</span>
          </div>

          <div className="overflow-x-auto overscroll-x-contain relative">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead className="bg-[#f8f9fa] text-[#5f6368] uppercase text-[10px] sm:text-[11px] tracking-wider border-b border-[#dadce0] font-semibold">
                <tr>
                  <th
                    onClick={() => handleSort("name")}
                    className="px-3 sm:px-5 py-2.5 sm:py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition md:sticky md:left-0 bg-[#f8f9fa] md:z-20 md:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] min-w-[140px] sm:min-w-[180px]"
                  >
                    <div className="flex items-center justify-between">
                      <span>Class Name</span>
                      {renderSortIndicator("name")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("professor_name")}
                    className="px-3 sm:px-5 py-2.5 sm:py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition min-w-[110px] sm:min-w-[140px]"
                  >
                    <div className="flex items-center justify-between">
                      <span>Teacher</span>
                      {renderSortIndicator("professor_name")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("section")}
                    className="px-3 sm:px-5 py-2.5 sm:py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition min-w-[100px] sm:min-w-[120px]"
                  >
                    <div className="flex items-center justify-between">
                      <span>Section / Term</span>
                      {renderSortIndicator("section")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("join_code")}
                    className="px-3 sm:px-5 py-2.5 sm:py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition min-w-[100px] sm:min-w-[120px]"
                  >
                    <div className="flex items-center justify-between">
                      <span>Class Code</span>
                      {renderSortIndicator("join_code")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("status")}
                    className="px-3 sm:px-5 py-2.5 sm:py-3 text-center border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition min-w-[100px] sm:min-w-[120px]"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Status</span>
                      {renderSortIndicator("status")}
                    </div>
                  </th>
                  <th className="px-3 sm:px-5 py-2.5 sm:py-3 text-right min-w-[120px] sm:min-w-[140px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8eaed] bg-white">
                {visibleClasses.map((c) => {
                  const isProfArchived = isArchivedByProfessor(c);
                  const isSelfArchived = isArchivedByStudent(c);
                  const hasActive = Boolean(c.active_session_id) && !isProfArchived;
                  const isPresent = c.my_attendance_status === "PRESENT";
                  const isMarkedAbsent =
                    c.my_attendance_source === "MANUAL_OVERRIDE" && !isPresent;

                  return (
                    <tr
                      key={c.class_id}
                      onClick={() => onSelectClass && onSelectClass(c.class_id)}
                      className={`group transition-colors ${
                        isProfArchived
                          ? "opacity-75"
                          : "hover:bg-[#f8f9fa] cursor-pointer"
                      }`}
                    >
                      {/* Class Name column (frozen on md+ desktop only) */}
                      <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 font-semibold text-[#202124] group-hover:text-[#1a73e8] border-r border-[#e8eaed] md:sticky md:left-0 bg-white group-hover:bg-[#f8f9fa] md:z-10 md:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>{formatClassDisplayName(c.name, c.section)}</span>
                          {isProfArchived && (
                            <Badge variant="default" size="xs">
                              Archived
                            </Badge>
                          )}
                          {isSelfArchived && !isProfArchived && (
                            <Badge variant="purple" size="xs">
                              Archived
                            </Badge>
                          )}
                        </div>
                      </td>

                      <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs text-[#5f6368] border-r border-[#e8eaed] whitespace-nowrap">
                        {c.professor_name || "Faculty Member"}
                      </td>

                      <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs text-[#5f6368] border-r border-[#e8eaed] whitespace-nowrap">
                        {c.section ? c.section.toUpperCase() : "—"} • {c.semester}
                      </td>

                      <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 border-r border-[#e8eaed] whitespace-nowrap">
                        <button
                          type="button"
                          disabled={copiedId === c.class_id}
                          onClick={(e) => handleCopyCode(e, c.join_code, c.class_id)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f1f3f4] hover:bg-[#e8f0fe] text-[#202124] rounded-md font-mono text-xs font-bold border border-[#dadce0] transition cursor-pointer disabled:cursor-default"
                          title="Copy class code"
                        >
                          {copiedId === c.class_id ? (
                            <span className="text-[#137333]">✓</span>
                          ) : null}
                          <code>{c.join_code}</code>
                        </button>
                      </td>

                      <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-center border-r border-[#e8eaed] whitespace-nowrap">
                        {isProfArchived ? (
                          <span className="text-xs text-[#70757a] italic">
                            Archived
                          </span>
                        ) : hasActive ? (
                          isPresent ? (
                            <Badge variant="success" size="xs" dot>
                              Present
                            </Badge>
                          ) : isMarkedAbsent ? (
                            <Badge variant="danger" size="xs" dot>
                              Marked Absent
                            </Badge>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#e8f0fe] text-[#1a73e8] animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#1a73e8]" />
                              Live Session
                            </span>
                          )
                        ) : (
                          <span className="text-xs text-[#70757a]">No Session</span>
                        )}
                      </td>

                      <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {isProfArchived ? (
                            <span className="text-xs text-[#5f6368]">View History →</span>
                          ) : isSelfArchived ? (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUnarchiveClass(c);
                                }}
                                className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#e8f0fe] text-[#1a73e8] hover:bg-[#d2e3fc] transition cursor-pointer"
                              >
                                Restore
                              </button>
                              <span className="text-xs font-semibold text-[#1a73e8] hover:underline">
                                Open →
                              </span>
                            </>
                          ) : hasActive && !isPresent && !isMarkedAbsent ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onTakeAttendance) onTakeAttendance(c.class_id);
                              }}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg text-white shadow-xs transition cursor-pointer ${
                                !isBiometricEnrolled
                                  ? "bg-[#b06000] hover:bg-[#8f4e00]"
                                  : "bg-[#1a73e8] hover:bg-[#1557b0]"
                              }`}
                            >
                              {!isBiometricEnrolled ? "Setup Face" : "Take Attendance"}
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleArchiveClass(c);
                                }}
                                className="px-2.5 py-1 text-xs font-semibold text-[#d93025] hover:bg-[#fce8e6] hover:text-[#b3261e] rounded-md transition cursor-pointer"
                              >
                                Archive
                              </button>
                              <span className="text-xs font-semibold text-[#1a73e8] hover:underline">
                                Open →
                              </span>
                            </>
                          )}
                        </div>
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
  );
}
