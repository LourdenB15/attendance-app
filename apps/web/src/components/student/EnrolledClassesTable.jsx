// apps/web/src/components/student/EnrolledClassesTable.jsx
import { useState } from "react";
import { Badge } from "../ui/Badge";
import { getClassTheme } from "../ui/classroomThemes";
import { EmptyState } from "../ui/EmptyState";
import { useToast } from "../../context/useToast";
import { useConfirm } from "../../context/useConfirm";
import {
  getStudentArchivedIds,
  saveStudentArchivedIds,
} from "../../utils/studentArchivedClasses";
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
} from "../ui/Icons";

export function EnrolledClassesTable({
  classes = [],
  studentId,
  initialTab = "active",
  onSelectClass,
  onTakeAttendance,
  isBiometricEnrolled = true,
  onOpenJoin,
}) {
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"
  const [searchQuery, setSearchQuery] = useState("");
  const [listTab, setListTab] = useState(initialTab); // "active" | "archived"
  const [studentArchivedIds, setStudentArchivedIds] = useState(() =>
    getStudentArchivedIds(studentId),
  );

  const { showToast } = useToast();
  const confirm = useConfirm();

  // Sync initialTab when navigation changes
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);
  if (initialTab !== prevInitialTab) {
    setPrevInitialTab(initialTab);
    setListTab(initialTab);
  }

  // Identify archived status:
  // - Professor archived: c.is_archived is truthy
  // - Student archived: class_id is in studentArchivedIds
  const isArchivedByProfessor = (c) => Boolean(c.is_archived);
  const isArchivedByStudent = (c) => studentArchivedIds.includes(c.class_id);
  const isClassArchived = (c) => isArchivedByProfessor(c) || isArchivedByStudent(c);

  const activeClasses = classes.filter((c) => !isClassArchived(c));
  const archivedClasses = classes.filter((c) => isClassArchived(c));

  const pool = listTab === "archived" ? archivedClasses : activeClasses;

  const visibleClasses = pool.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.professor_name && c.professor_name.toLowerCase().includes(q)) ||
      (c.section && c.section.toLowerCase().includes(q)) ||
      (c.semester && c.semester.toLowerCase().includes(q))
    );
  });

  const handleArchiveClass = async (c) => {
    const confirmed = await confirm({
      title: "Archive this class?",
      message: `Are you sure you want to archive ${c.name}? You can find it under Archived Classes and restore it anytime.`,
      confirmLabel: "Archive Class",
    });
    if (!confirmed) return;

    const next = [...new Set([...studentArchivedIds, c.class_id])];
    setStudentArchivedIds(next);
    saveStudentArchivedIds(studentId, next);
    showToast("success", `${c.name} moved to Archived Classes.`);
  };

  const handleUnarchiveClass = (c) => {
    const next = studentArchivedIds.filter((id) => id !== c.class_id);
    setStudentArchivedIds(next);
    saveStudentArchivedIds(studentId, next);
    showToast("success", `${c.name} restored to Enrolled Classes.`);
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-white border border-[#dadce0] rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        {/* Segmented Tab Toggle: Active vs Archived */}
        <div className="flex bg-[#f1f3f4] p-1 rounded-xl text-xs font-semibold overflow-x-auto scrollbar-none shrink-0">
          <button
            type="button"
            onClick={() => setListTab("active")}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              listTab === "active"
                ? "bg-white text-[#1a73e8] shadow-xs font-bold"
                : "text-[#5f6368] hover:text-[#202124]"
            }`}
          >
            Enrolled ({activeClasses.length})
          </button>
          <button
            type="button"
            onClick={() => setListTab("archived")}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              listTab === "archived"
                ? "bg-white text-[#1a73e8] shadow-xs font-bold"
                : "text-[#5f6368] hover:text-[#202124]"
            }`}
          >
            Archived ({archivedClasses.length})
          </button>
        </div>

        <div className="flex items-center gap-2.5 flex-1 justify-end">
          <div className="relative flex-1 sm:w-64 max-w-sm">
            <IconSearch className="w-4 h-4 text-[#5f6368] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                listTab === "archived"
                  ? "Search archived classes..."
                  : "Search enrolled classes..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 bg-[#f8f9fa] border border-[#dadce0] rounded-lg text-xs text-[#202124] placeholder-[#80868b] focus:bg-white focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#e8f0fe] transition-all"
            />
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
              title="Table View"
              aria-label="Table View"
            >
              <IconList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {visibleClasses.length === 0 ? (
        <EmptyState
          icon={<IconBook className="w-7 h-7" />}
          title={
            searchQuery
              ? "No classes match your search"
              : listTab === "archived"
              ? "No archived classes"
              : "You haven't joined any classes yet"
          }
          description={
            searchQuery
              ? `No classes matched "${searchQuery}".`
              : listTab === "archived"
              ? "Classes you archive or that your teacher archives will appear here for reference."
              : "Ask your teacher for the class code, then click Join Class to enroll."
          }
          action={
            !searchQuery && listTab === "active" && onOpenJoin ? (
              <button
                type="button"
                onClick={onOpenJoin}
                className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <IconPlus className="w-4 h-4" />
                <span>Join a Class</span>
              </button>
            ) : null
          }
        />
      ) : viewMode === "grid" ? (
        /* CARD GRID */
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
                onClick={() => onSelectClass && onSelectClass(c.class_id)}
                className={`gc-card rounded-2xl overflow-hidden flex flex-col justify-between group cursor-pointer text-left transition-all ${
                  isProfArchived ? "opacity-80 border-dashed" : ""
                }`}
              >
                {/* Card Header Banner */}
                <div
                  className={`${
                    isProfArchived ? "bg-gradient-to-r from-gray-600 to-gray-700" : theme.bannerBg
                  } p-5 relative select-none`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {isProfArchived ? (
                          <Badge variant="default" size="xs">
                            Archived by Professor
                          </Badge>
                        ) : isSelfArchived ? (
                          <Badge variant="purple" size="xs">
                            Archived by You
                          </Badge>
                        ) : null}
                      </div>
                      <h4
                        className="text-base font-bold text-white leading-tight truncate group-hover:underline"
                        title={c.name}
                      >
                        {c.name}
                      </h4>
                      <p className={`text-xs ${theme.subText} mt-1 font-medium truncate`}>
                        {c.professor_name || "Faculty Member"}
                      </p>
                    </div>

                    {/* Active Pulse or Quick Archive Button */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {hasActive && !isPresent && !isMarkedAbsent && (
                        <span className="w-3 h-3 rounded-full bg-emerald-300 ring-4 ring-emerald-300/30 animate-pulse" />
                      )}
                      {!isProfArchived && !isSelfArchived && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchiveClass(c);
                          }}
                          className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 text-white/90 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                          title="Archive class"
                          aria-label="Archive class"
                        >
                          <IconArchive className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-white/90">
                    <span>
                      {c.section} • {c.semester}
                    </span>
                    <span className="font-mono text-white/80 bg-black/15 px-2 py-0.5 rounded">
                      {c.join_code}
                    </span>
                  </div>
                </div>

                {/* Card Body & Live Check-in Status */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white gap-4">
                  {/* Status Indicator */}
                  <div>
                    {isProfArchived ? (
                      <div className="p-3 bg-[#f8f9fa] border border-[#dadce0] rounded-xl flex items-center gap-2.5">
                        <IconArchive className="w-4 h-4 text-[#70757a] shrink-0" />
                        <div>
                          <span className="block text-xs font-bold text-[#3c4043]">
                            Course Archived by Teacher
                          </span>
                          <span className="block text-[11px] text-[#70757a]">
                            Attendance and interactive access closed
                          </span>
                        </div>
                      </div>
                    ) : hasActive ? (
                      isPresent ? (
                        <div className="p-3 bg-[#e6f4ea] border border-[#ceead6] rounded-xl flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#137333] text-white flex items-center justify-center shrink-0">
                            <IconCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-[#137333]">
                              Attendance Recorded
                            </span>
                            <span className="block text-[11px] text-[#1e8e3e]">
                              Marked Present for today's session
                            </span>
                          </div>
                        </div>
                      ) : isMarkedAbsent ? (
                        <div className="p-3 bg-[#fce8e6] border border-[#fad2cf] rounded-xl flex items-center gap-2.5">
                          <span className="text-xs font-bold text-[#c5221f]">
                            Marked Absent by Professor
                          </span>
                        </div>
                      ) : (
                        <div className="p-3 bg-[#e8f0fe] border border-[#d2e3fc] rounded-xl flex items-center justify-between gap-2 animate-pulse">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#1a73e8]" />
                            <span className="text-xs font-bold text-[#1a73e8]">
                              Live Session in Progress
                            </span>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="p-2.5 bg-[#f8f9fa] border border-[#dadce0] rounded-xl text-center">
                        <span className="text-xs text-[#5f6368] font-medium">
                          No Active Session
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="pt-2 border-t border-[#e8eaed] flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#70757a] truncate">
                      Enrolled: {new Date(c.enrolled_at).toLocaleDateString()}
                    </span>

                    {isProfArchived ? (
                      <span className="text-xs font-semibold text-[#5f6368] inline-flex items-center gap-1">
                        <span>Past History</span>
                        <IconChevronRight className="w-3.5 h-3.5" />
                      </span>
                    ) : isSelfArchived ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnarchiveClass(c);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#1a73e8] bg-[#e8f0fe] hover:bg-[#d2e3fc] transition cursor-pointer"
                        title="Restore to Enrolled Classes"
                      >
                        <IconRefresh className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </button>
                    ) : hasActive && !isPresent && !isMarkedAbsent ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onTakeAttendance) onTakeAttendance(c.class_id);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs transition cursor-pointer ${
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
                        <span>View Class</span>
                        <IconChevronRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-xl shadow-xs border border-[#dadce0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f8f9fa] text-[#5f6368] uppercase text-[11px] tracking-wider border-b border-[#dadce0] font-semibold">
                <tr>
                  <th className="px-5 py-3">Class Name</th>
                  <th className="px-5 py-3">Teacher</th>
                  <th className="px-5 py-3">Section / Term</th>
                  <th className="px-5 py-3">Class Code</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8eaed]">
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
                      className={`hover:bg-[#f8f9fa] cursor-pointer transition-colors ${
                        isProfArchived ? "opacity-75" : ""
                      }`}
                    >
                      <td className="px-5 py-3.5 font-semibold text-[#202124] hover:text-[#1a73e8]">
                        <div className="flex items-center gap-2">
                          <span>{c.name}</span>
                          {isProfArchived && (
                            <Badge variant="default" size="xs">
                              Archived by Professor
                            </Badge>
                          )}
                          {isSelfArchived && !isProfArchived && (
                            <Badge variant="purple" size="xs">
                              Archived
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#5f6368]">
                        {c.professor_name || "Faculty Member"}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#5f6368]">
                        {c.section} • {c.semester}
                      </td>
                      <td className="px-5 py-3.5">
                        <code className="px-2 py-0.5 bg-[#f1f3f4] text-[#202124] rounded-md font-mono text-xs font-bold border border-[#dadce0]">
                          {c.join_code}
                        </code>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {isProfArchived ? (
                          <span className="text-xs text-[#70757a] italic">
                            Archived (No Access)
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
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isProfArchived ? (
                            <span className="text-xs text-[#5f6368]">View History →</span>
                          ) : isSelfArchived ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnarchiveClass(c);
                              }}
                              className="px-2.5 py-1 text-xs font-bold rounded-md bg-[#e8f0fe] text-[#1a73e8] hover:bg-[#d2e3fc] transition cursor-pointer"
                            >
                              Restore
                            </button>
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
                                className="p-1 rounded text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] transition"
                                title="Archive class"
                              >
                                <IconArchive className="w-4 h-4" />
                              </button>
                              <span className="text-xs font-semibold text-[#1a73e8] hover:underline">
                                View →
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
