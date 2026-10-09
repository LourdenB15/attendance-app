// apps/web/src/components/student/EnrolledClassesTable.jsx
import { useState } from "react";
import { Badge } from "../ui/Badge";
import { getClassTheme } from "../ui/classroomThemes";
import { EmptyState } from "../ui/EmptyState";
import {
  IconBook,
  IconGrid,
  IconList,
  IconSearch,
  IconCamera,
  IconCheck,
  IconChevronRight,
} from "../ui/Icons";

export function EnrolledClassesTable({
  classes = [],
  onSelectClass,
  onTakeAttendance,
  isBiometricEnrolled = true,
}) {
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"
  const [searchQuery, setSearchQuery] = useState("");

  const visibleClasses = classes.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.professor_name && c.professor_name.toLowerCase().includes(q)) ||
      (c.section && c.section.toLowerCase().includes(q)) ||
      (c.semester && c.semester.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-white border border-[#dadce0] rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <h3 className="font-bold text-[#202124] text-sm">
            Enrolled Classes ({classes.length})
          </h3>
          <p className="text-xs text-[#5f6368] mt-0.5">
            Select a class to view details or check in when a live session is active.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <IconSearch className="w-4 h-4 text-[#5f6368] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search enrolled classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 bg-[#f8f9fa] border border-[#dadce0] rounded-lg text-xs text-[#202124] placeholder-[#80868b] focus:bg-white focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#e8f0fe] transition-all"
            />
          </div>

          <div className="flex items-center border border-[#dadce0] rounded-lg p-0.5 bg-[#f8f9fa] shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${
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
              className={`p-1.5 rounded-md transition-colors ${
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
              : "You haven't joined any classes yet"
          }
          description={
            searchQuery
              ? `No enrolled courses matched "${searchQuery}".`
              : "Enter your teacher's class join code in the card above to enroll."
          }
        />
      ) : viewMode === "grid" ? (
        /* GOOGLE CLASSROOM STUDENT CARD GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleClasses.map((c) => {
            const theme = getClassTheme(c.class_id || c.name);
            const hasActive = Boolean(c.active_session_id);
            const isPresent = c.my_attendance_status === "PRESENT";
            const isMarkedAbsent =
              c.my_attendance_source === "MANUAL_OVERRIDE" && !isPresent;

            return (
              <div
                key={c.class_id}
                onClick={() => onSelectClass && onSelectClass(c.class_id)}
                className="gc-card rounded-2xl overflow-hidden flex flex-col justify-between group cursor-pointer text-left"
              >
                {/* Card Header Banner */}
                <div className={`${theme.bannerBg} p-5 relative select-none`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
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

                    {hasActive && !isPresent && !isMarkedAbsent && (
                      <span className="w-3 h-3 rounded-full bg-emerald-300 ring-4 ring-emerald-300/30 animate-pulse shrink-0" />
                    )}
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
                    {hasActive ? (
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
                  <div className="pt-2 border-t border-[#e8eaed] flex items-center justify-between">
                    <span className="text-[11px] text-[#70757a]">
                      Enrolled: {new Date(c.enrolled_at).toLocaleDateString()}
                    </span>

                    {hasActive && !isPresent && !isMarkedAbsent ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onTakeAttendance) onTakeAttendance(c.class_id);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs transition ${
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
                  <th className="px-5 py-3 text-center">Session Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8eaed]">
                {visibleClasses.map((c) => {
                  const hasActive = Boolean(c.active_session_id);
                  const isPresent = c.my_attendance_status === "PRESENT";
                  const isMarkedAbsent =
                    c.my_attendance_source === "MANUAL_OVERRIDE" && !isPresent;

                  return (
                    <tr
                      key={c.class_id}
                      onClick={() => onSelectClass && onSelectClass(c.class_id)}
                      className="hover:bg-[#f8f9fa] cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3.5 font-semibold text-[#202124] hover:text-[#1a73e8]">
                        {c.name}
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
                        {hasActive ? (
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
                        {hasActive && !isPresent && !isMarkedAbsent ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onTakeAttendance) onTakeAttendance(c.class_id);
                            }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg text-white shadow-xs transition ${
                              !isBiometricEnrolled
                                ? "bg-[#b06000] hover:bg-[#8f4e00]"
                                : "bg-[#1a73e8] hover:bg-[#1557b0]"
                            }`}
                          >
                            {!isBiometricEnrolled ? "Setup Face" : "Take Attendance"}
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-[#1a73e8] hover:underline">
                            View Class →
                          </span>
                        )}
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
