// apps/web/src/components/professor/EnrolledStudentsTable.jsx
import { useState, useMemo } from "react";
import { Badge } from "../ui/Badge";
import { classesApi } from "../../api";
import { useToast } from "../../context/useToast";
import { useConfirm } from "../../context/useConfirm";
import { EmptyState } from "../ui/EmptyState";
import { UserAvatar } from "../ui/UserAvatar";
import { TableSkeleton } from "../ui/Skeleton";
import {
  IconUsers,
  IconSearch,
  IconCopy,
  IconCheck,
} from "../ui/Icons";

export function EnrolledStudentsTable({
  classId,
  joinCode,
  students = [],
  onStudentDropped,
  loading = false,
}) {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [listTab, setListTab] = useState("active"); // "active" | "dropped"
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(null);
  const [sortField, setSortField] = useState("full_name"); // "full_name" | "email" | "enrolled_via" | "status" | "enrolled_at"
  const [sortAsc, setSortAsc] = useState(true);
  const [mobileMode, setMobileMode] = useState("cards"); // "cards" | "sheet"

  const activeStudents = students.filter((s) => s.status === "ACTIVE");
  const droppedStudents = students.filter((s) => s.status === "DROPPED");
  const pool = listTab === "dropped" ? droppedStudents : activeStudents;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const visibleStudents = useMemo(() => {
    let list = pool.filter((s) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (s.full_name && s.full_name.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q))
      );
    });

    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "enrolled_at") {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = (valB || "").toLowerCase();
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

  const handleCopyCode = () => {
    navigator.clipboard.writeText(joinCode);
    setCopied(true);
    showToast("info", `Class join code "${joinCode}" copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyEmail = (email, e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 1800);
  };

  const handleDrop = async (student) => {
    const confirmed = await confirm({
      title: "Drop this student?",
      message: `${student.full_name} will be removed from this class roster and won't be able to rejoin with the join code unless restored.`,
      confirmLabel: "Drop Student",
      danger: true,
    });
    if (!confirmed) return;
    try {
      await classesApi.dropStudent(classId, student.student_id);
      showToast("success", "Student dropped from class.");
      if (onStudentDropped) onStudentDropped();
    } catch (err) {
      showToast("error", err.message);
    }
  };

  const handleRestore = async (student) => {
    try {
      await classesApi.restoreStudent(classId, student.student_id);
      showToast("success", `${student.full_name} restored to the class.`);
      if (onStudentDropped) onStudentDropped();
    } catch (err) {
      showToast("error", err.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-[#dadce0] overflow-hidden">
      {/* Top Banner: Invite & Join Code */}
      <div className="p-4 sm:p-5 border-b border-[#dadce0] bg-[#f8f9fa] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h4 className="text-base font-bold text-[#202124]">Class Roster</h4>
          <p className="text-xs text-[#5f6368] mt-0.5">
            Students who join your class section using the unique code will appear here.
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2.5 bg-white border border-[#dadce0] rounded-xl px-4 py-2.5 shadow-2xs w-full sm:w-auto">
          <span className="text-xs font-semibold text-[#5f6368]">Invite Code:</span>
          <code className="text-sm font-mono font-bold text-[#1a73e8] tracking-wider select-all">
            {joinCode}
          </code>
          <button
            type="button"
            onClick={handleCopyCode}
            className="p-1.5 rounded-lg text-[#5f6368] hover:text-[#1a73e8] hover:bg-[#f1f3f4] transition cursor-pointer"
            title="Copy join code"
            aria-label="Copy join code"
          >
            {copied ? (
              <IconCheck className="w-4 h-4 text-[#137333]" />
            ) : (
              <IconCopy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Roster Controls: Tabs, Search & Mobile Switcher */}
      <div className="p-4 sm:p-5 border-b border-[#dadce0] flex flex-col md:flex-row md:items-center justify-between gap-3">
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
            Active Enrolled ({activeStudents.length})
          </button>
          <button
            type="button"
            onClick={() => setListTab("dropped")}
            className={`px-3.5 py-1.5 rounded-md transition-all whitespace-nowrap cursor-pointer ${
              listTab === "dropped"
                ? "bg-white text-[#1a73e8] shadow-xs font-bold"
                : "text-[#5f6368] hover:text-[#202124]"
            }`}
          >
            Dropped ({droppedStudents.length})
          </button>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          <div className="relative flex-1 sm:w-60">
            <IconSearch className="w-4 h-4 text-[#5f6368] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-7 py-2 sm:py-1.5 bg-[#f8f9fa] border border-[#dadce0] rounded-lg text-xs text-[#202124] placeholder-[#80868b] focus:bg-white focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#e8f0fe] transition-all"
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

          {/* Mobile phone toggle: Cards vs Spreadsheet */}
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
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <TableSkeleton
          rows={5}
          cols={6}
          headers={["Student Name", "Email Address", "Enrolled Via", "Status", "Date Joined", "Action"]}
        />
      ) : (
        <>
          {/* Mobile Card List (< md when mobileMode === 'cards') */}
          <div className={`${mobileMode === "cards" ? "block md:hidden" : "hidden"} divide-y divide-[#e8eaed]`}>
            {visibleStudents.length === 0 ? (
              <div className="p-8 text-center">
                <EmptyState
                  icon={<IconUsers className="w-6 h-6" />}
                  title={
                    searchQuery
                      ? "No students match your query"
                      : listTab === "dropped"
                      ? "No dropped students"
                      : "No students enrolled yet"
                  }
                  description={
                    searchQuery
                      ? "Try clearing your search term."
                      : listTab === "dropped"
                      ? "Students removed from class will appear here."
                      : `Share the code "${joinCode}" with your students so they can enroll.`
                  }
                  className="border-none p-4"
                />
              </div>
            ) : (
              visibleStudents.map((s) => (
                <div
                  key={s.student_id}
                  className="p-4 space-y-3 hover:bg-[#f8f9fa] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <UserAvatar
                        user={{ full_name: s.full_name, email: s.email }}
                        className="w-10 h-10"
                        textClassName="text-sm font-bold"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#202124] truncate">
                          {s.full_name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-[#5f6368] font-mono truncate">
                            {s.email}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyEmail(s.email, e)}
                            className="text-slate-400 hover:text-indigo-600 transition"
                            title="Copy email"
                          >
                            {copiedEmail === s.email ? (
                              <IconCheck className="w-3 h-3 text-[#137333]" />
                            ) : (
                              <IconCopy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <Badge
                      variant={s.status === "ACTIVE" ? "success" : "default"}
                      size="xs"
                      dot
                    >
                      {s.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#5f6368] pt-1">
                    <span className="px-2 py-0.5 rounded-md bg-[#f1f3f4] text-[#3c4043] font-medium text-[11px]">
                      Enrolled via {s.enrolled_via || "Join Code"}
                    </span>
                    <span className="text-[11px] text-[#70757a]">
                      Joined{" "}
                      {new Date(s.enrolled_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#f1f3f4] flex justify-end">
                    {s.status === "ACTIVE" ? (
                      <button
                        type="button"
                        onClick={() => handleDrop(s)}
                        className="w-full py-2 text-xs font-semibold text-[#c5221f] bg-[#fce8e6] hover:bg-[#fad2cf] border border-[#fad2cf] rounded-xl transition min-h-[38px] cursor-pointer"
                      >
                        Drop Student from Section
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRestore(s)}
                        className="w-full py-2 text-xs font-semibold text-[#1a73e8] bg-[#e8f0fe] hover:bg-[#d2e3fc] border border-[#d2e3fc] rounded-xl transition min-h-[38px] cursor-pointer"
                      >
                        Restore Student to Section
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* SPREADSHEET TABLE VIEW (Desktop >= md or mobile when mobileMode === 'sheet') */}
          <div className={`${mobileMode === "cards" ? "hidden md:block" : "block"}`}>
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
                      onClick={() => handleSort("full_name")}
                      className="px-3 sm:px-5 py-2.5 sm:py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition md:sticky md:left-0 bg-[#f8f9fa] md:z-20 md:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] min-w-[140px] sm:min-w-[180px]"
                    >
                      <div className="flex items-center justify-between">
                        <span>Student Name</span>
                        {renderSortIndicator("full_name")}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("email")}
                      className="px-3 sm:px-5 py-2.5 sm:py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition min-w-[140px] sm:min-w-[180px]"
                    >
                      <div className="flex items-center justify-between">
                        <span>Email Address</span>
                        {renderSortIndicator("email")}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("enrolled_via")}
                      className="px-3 sm:px-5 py-2.5 sm:py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition min-w-[100px] sm:min-w-[120px]"
                    >
                      <div className="flex items-center justify-between">
                        <span>Enrolled Via</span>
                        {renderSortIndicator("enrolled_via")}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("status")}
                      className="px-3 sm:px-5 py-2.5 sm:py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition min-w-[90px] sm:min-w-[100px]"
                    >
                      <div className="flex items-center justify-between">
                        <span>Status</span>
                        {renderSortIndicator("status")}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("enrolled_at")}
                      className="px-3 sm:px-5 py-2.5 sm:py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition min-w-[100px] sm:min-w-[120px]"
                    >
                      <div className="flex items-center justify-between">
                        <span>Date Joined</span>
                        {renderSortIndicator("enrolled_at")}
                      </div>
                    </th>
                    <th className="px-3 sm:px-5 py-2.5 sm:py-3 text-right min-w-[90px] sm:min-w-[110px]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8eaed] bg-white">
                  {visibleStudents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center">
                        <EmptyState
                          icon={<IconUsers className="w-6 h-6" />}
                          title={
                            searchQuery
                              ? "No students match your query"
                              : listTab === "dropped"
                              ? "No dropped students"
                              : "No students enrolled yet"
                          }
                          description={
                            searchQuery
                              ? "Try clearing your search term."
                              : listTab === "dropped"
                              ? "Students removed from class will appear here."
                              : `Share the code "${joinCode}" with your students so they can enroll.`
                          }
                          className="border-none p-4"
                        />
                      </td>
                    </tr>
                  ) : (
                    visibleStudents.map((s) => (
                      <tr
                        key={s.student_id}
                        className="hover:bg-[#f8f9fa] transition-colors group"
                      >
                        {/* Student Name column (frozen on md+ desktop only) */}
                        <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 border-r border-[#e8eaed] md:sticky md:left-0 bg-white group-hover:bg-[#f8f9fa] md:z-10 md:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              user={{ full_name: s.full_name, email: s.email }}
                              className="w-8 h-8"
                              textClassName="text-xs font-bold"
                            />
                            <span className="font-semibold text-[#202124] truncate">
                              {s.full_name}
                            </span>
                          </div>
                        </td>

                        <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs text-[#5f6368] font-mono border-r border-[#e8eaed] whitespace-nowrap">
                          <div className="flex items-center justify-between gap-1">
                            <span>{s.email}</span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyEmail(s.email, e)}
                              className="text-slate-400 hover:text-indigo-600 transition"
                              title="Copy email"
                            >
                              {copiedEmail === s.email ? (
                                <IconCheck className="w-3 h-3 text-[#137333]" />
                              ) : (
                                <IconCopy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs text-[#5f6368] border-r border-[#e8eaed] whitespace-nowrap">
                          {s.enrolled_via || "Join Code"}
                        </td>

                        <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 border-r border-[#e8eaed] whitespace-nowrap">
                          <Badge
                            variant={s.status === "ACTIVE" ? "success" : "default"}
                            size="xs"
                            dot
                          >
                            {s.status}
                          </Badge>
                        </td>

                        <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs text-[#70757a] border-r border-[#e8eaed] whitespace-nowrap">
                          {new Date(s.enrolled_at).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>

                        <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-right whitespace-nowrap">
                          {s.status === "ACTIVE" ? (
                            <button
                              type="button"
                              onClick={() => handleDrop(s)}
                              className="px-2.5 py-1 text-xs text-[#c5221f] hover:bg-[#fce8e6] rounded-md font-medium transition cursor-pointer"
                            >
                              Drop Student
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRestore(s)}
                              className="px-2.5 py-1 text-xs text-[#1a73e8] hover:bg-[#e8f0fe] rounded-md font-medium transition cursor-pointer"
                            >
                              Restore
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
