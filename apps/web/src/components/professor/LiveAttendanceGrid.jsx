// apps/web/src/components/professor/LiveAttendanceGrid.jsx
import { useState, useMemo } from "react";
import { Badge } from "../ui/Badge";
import { sessionsApi } from "../../api";
import { useToast } from "../../context/useToast";
import { Modal } from "../ui/Modal";
import { EmptyState } from "../ui/EmptyState";
import { UserAvatar } from "../ui/UserAvatar";
import { TableSkeleton } from "../ui/Skeleton";
import { GoogleProgressBar } from "../ui/ProgressBar";
import {
  IconSearch,
  IconUsers,
} from "../ui/Icons";

export function LiveAttendanceGrid({
  activeSessionId,
  attendance = [],
  onOverrideSuccess,
  loading = false,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // "ALL" | "PRESENT" | "ABSENT"
  const [pending, setPending] = useState(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [sortField, setSortField] = useState("full_name"); // "full_name" | "status" | "source" | "recorded_at"
  const [sortAsc, setSortAsc] = useState(true);
  const [mobileMode, setMobileMode] = useState("cards"); // "cards" | "sheet"
  const { showToast } = useToast();

  const totalCount = attendance.length;
  const presentCount = attendance.filter((r) => r.status === "PRESENT").length;
  const absentCount = totalCount - presentCount;
  const rate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filteredAttendance = useMemo(() => {
    let list = attendance.filter((rec) => {
      const matchesSearch =
        !searchQuery.trim() ||
        (rec.full_name && rec.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (rec.email && rec.email.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "PRESENT" && rec.status === "PRESENT") ||
        (statusFilter === "ABSENT" && rec.status !== "PRESENT");

      return matchesSearch && matchesStatus;
    });

    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "status") {
        valA = a.status === "PRESENT" ? 1 : 0;
        valB = b.status === "PRESENT" ? 1 : 0;
      } else if (sortField === "recorded_at") {
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
  }, [attendance, searchQuery, statusFilter, sortField, sortAsc]);

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

  const openDialog = (student, status) => {
    setPending({ student, status });
    setNote(student.override_reason || "");
  };

  const closeDialog = () => {
    if (saving) return;
    setPending(null);
    setNote("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!pending) return;
    const { student, status } = pending;
    setSaving(true);
    try {
      await sessionsApi.overrideAttendance(activeSessionId, {
        studentId: student.student_id,
        status,
        reason: note.trim() || undefined,
      });
      showToast("success", `${student.full_name} marked as ${status.toLowerCase()}.`);
      setPending(null);
      setNote("");
      if (onOverrideSuccess) onOverrideSuccess();
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-[#dadce0] overflow-hidden">
      {/* Header & KPI Summary Bar */}
      <div className="p-4 sm:p-5 border-b border-[#dadce0] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-bold text-[#202124]">
              Live Attendance Roster
            </h4>
            <p className="text-xs text-[#5f6368] mt-0.5">
              Live biometric check-ins will appear here in real time. Use actions to override if needed.
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 bg-[#f8f9fa] border border-[#dadce0] px-4 py-2.5 rounded-xl shrink-0 w-full sm:w-auto">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#5f6368]">
                Attendance Rate
              </span>
              <span className="text-sm sm:text-base font-black text-[#137333]">
                {presentCount} / {totalCount} ({rate}%)
              </span>
            </div>
            <div className="h-8 w-px bg-[#dadce0]" />
            <div className="text-right">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#5f6368]">
                Absent
              </span>
              <span className="text-sm sm:text-base font-black text-[#c5221f]">
                {absentCount}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Chips, Search Input & Mobile Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-[#f1f3f4]">
          <div className="grid grid-cols-3 md:flex items-center gap-1.5 w-full md:w-auto shrink-0">
            {[
              { id: "ALL", label: `All (${totalCount})` },
              { id: "PRESENT", label: `Present (${presentCount})` },
              { id: "ABSENT", label: `Absent (${absentCount})` },
            ].map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setStatusFilter(chip.id)}
                className={`flex-1 md:flex-initial px-1.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer text-center truncate ${
                  statusFilter === chip.id
                    ? "bg-[#1a73e8] text-white shadow-2xs font-bold"
                    : "bg-[#f1f3f4] text-[#5f6368] hover:bg-[#e8eaed] hover:text-[#202124]"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2.5 justify-between md:justify-end w-full md:w-auto">
            <div className="relative flex-1 min-w-0 sm:w-60">
              <IconSearch className="w-4 h-4 text-[#5f6368] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search roster..."
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
      </div>

      {/* Pinned Google Indeterminate Progress Bar during background refresh */}
      {loading && attendance.length > 0 && (
        <GoogleProgressBar height="h-1" />
      )}

      {/* Loading Skeleton */}
      {loading && attendance.length === 0 ? (
        <TableSkeleton
          rows={5}
          cols={6}
          headers={["Student Name", "Status", "Source", "Check-in Time", "Notes", "Attendance Action"]}
        />
      ) : (
        <>
          {/* Mobile Card List (< md and mobileMode === 'cards') */}
          <div className={`${mobileMode === "cards" ? "block md:hidden" : "hidden"} divide-y divide-[#e8eaed]`}>
            {filteredAttendance.length === 0 ? (
              <div className="p-8 text-center">
                <EmptyState
                  icon={<IconUsers className="w-6 h-6" />}
                  title={
                    searchQuery
                      ? "No students match your filter"
                      : "No students in this class roster"
                  }
                  description={
                    searchQuery
                      ? "Try clearing your search term to see all students."
                      : "Share the class join code with your students to enroll them."
                  }
                  className="border-none p-4"
                />
              </div>
            ) : (
              filteredAttendance.map((rec) => {
                const isPresent = rec.status === "PRESENT";
                const isMarkedAbsent = !isPresent && Boolean(rec.source);

                return (
                  <div
                    key={rec.student_id}
                    className="p-4 space-y-3 hover:bg-[#f8f9fa] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar
                          user={{ full_name: rec.full_name, email: rec.email }}
                          className="w-10 h-10"
                          textClassName="text-sm font-bold"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-[#202124] truncate">
                            {rec.full_name}
                          </p>
                          <span className="text-xs text-[#5f6368] font-mono block truncate mt-0.5">
                            {rec.email}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isPresent ? (
                          <Badge variant="success" size="xs" dot>
                            Present
                          </Badge>
                        ) : (
                          <Badge variant="danger" size="xs" dot>
                            Absent
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Details Meta */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#5f6368] bg-[#f8f9fa] p-2.5 rounded-xl border border-[#dadce0]/60">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-[#80868b]">Source:</span>
                        {rec.source === "BIOMETRIC_LIVENESS" ? (
                          <span className="font-medium text-[#137333]">Face Biometric</span>
                        ) : rec.source === "MANUAL_OVERRIDE" ? (
                          <span className="font-medium text-[#b06000]">Manual Override</span>
                        ) : (
                          <span>{rec.source || "—"}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-[#80868b]">Time:</span>
                        <span>
                          {rec.recorded_at
                            ? new Date(rec.recorded_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })
                            : "—"}
                        </span>
                      </div>
                    </div>

                    {rec.override_reason && (
                      <p className="text-xs text-[#70757a] italic bg-[#fff8e1] px-2.5 py-1.5 rounded-lg border border-[#ffe082]/60">
                        Note: {rec.override_reason}
                      </p>
                    )}

                    {/* Touch Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        disabled={isPresent}
                        onClick={() => openDialog(rec, "PRESENT")}
                        className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center min-h-[38px] cursor-pointer ${
                          isPresent
                            ? "bg-[#e6f4ea] text-[#137333] border border-[#ceead6] cursor-default opacity-80"
                            : "bg-white text-[#3c4043] hover:bg-[#e6f4ea] hover:text-[#137333] border border-[#dadce0] shadow-2xs"
                        }`}
                      >
                        {isPresent ? "✓ Is Present" : "Mark Present"}
                      </button>
                      <button
                        type="button"
                        disabled={isMarkedAbsent}
                        onClick={() => openDialog(rec, "ABSENT")}
                        className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center min-h-[38px] cursor-pointer ${
                          isMarkedAbsent
                            ? "bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf] cursor-default opacity-80"
                            : "bg-white text-[#3c4043] hover:bg-[#fce8e6] hover:text-[#c5221f] border border-[#dadce0] shadow-2xs"
                        }`}
                      >
                        {isMarkedAbsent ? "✕ Is Absent" : "Mark Absent"}
                      </button>
                    </div>
                  </div>
                );
              })
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
                      onClick={() => handleSort("status")}
                      className="px-3 sm:px-5 py-2.5 sm:py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition min-w-[90px] sm:min-w-[110px]"
                    >
                      <div className="flex items-center justify-between">
                        <span>Status</span>
                        {renderSortIndicator("status")}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("source")}
                      className="px-3 sm:px-5 py-2.5 sm:py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition min-w-[110px] sm:min-w-[130px]"
                    >
                      <div className="flex items-center justify-between">
                        <span>Source</span>
                        {renderSortIndicator("source")}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("recorded_at")}
                      className="px-3 sm:px-5 py-2.5 sm:py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition min-w-[100px] sm:min-w-[120px]"
                    >
                      <div className="flex items-center justify-between">
                        <span>Check-in Time</span>
                        {renderSortIndicator("recorded_at")}
                      </div>
                    </th>
                    <th className="px-3 sm:px-5 py-2.5 sm:py-3 border-r border-[#dadce0]/70 min-w-[110px] sm:min-w-[140px]">Notes</th>
                    <th className="px-3 sm:px-5 py-2.5 sm:py-3 text-right min-w-[140px] sm:min-w-[160px]">Attendance Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8eaed] bg-white">
                  {filteredAttendance.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center">
                        <EmptyState
                          icon={<IconUsers className="w-6 h-6" />}
                          title={
                            searchQuery
                              ? "No students match your filter"
                              : "No students in this class roster"
                          }
                          description={
                            searchQuery
                              ? "Try clearing your search term to see all students."
                              : "Share the class join code with your students to enroll them."
                          }
                          className="border-none p-4"
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredAttendance.map((rec) => {
                      const isPresent = rec.status === "PRESENT";
                      const isMarkedAbsent = !isPresent && Boolean(rec.source);

                      return (
                        <tr
                          key={rec.student_id}
                          className="hover:bg-[#f8f9fa] transition-colors group"
                        >
                          {/* Student Name column (frozen on md+ desktop only) */}
                          <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 border-r border-[#e8eaed] md:sticky md:left-0 bg-white group-hover:bg-[#f8f9fa] md:z-10 md:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                            <div className="flex items-center gap-3">
                              <UserAvatar
                                user={{ full_name: rec.full_name, email: rec.email }}
                                className="w-8 h-8"
                                textClassName="text-xs font-bold"
                              />
                              <div className="min-w-0">
                                <p className="font-semibold text-[#202124] truncate">{rec.full_name}</p>
                                <span className="text-[11px] text-[#5f6368] font-mono block truncate">
                                  {rec.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 border-r border-[#e8eaed] whitespace-nowrap">
                            {isPresent ? (
                              <Badge variant="success" size="xs" dot>
                                ✓ Present
                              </Badge>
                            ) : (
                              <Badge variant="danger" size="xs" dot>
                                ✕ Absent
                              </Badge>
                            )}
                          </td>

                          <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs text-[#5f6368] border-r border-[#e8eaed] whitespace-nowrap">
                            {rec.source === "BIOMETRIC_LIVENESS" ? (
                              <span className="inline-flex items-center gap-1 font-medium text-[#137333]">
                                Face Biometric
                              </span>
                            ) : rec.source === "MANUAL_OVERRIDE" ? (
                              <span className="inline-flex items-center gap-1 font-medium text-[#b06000]">
                                Manual Override
                              </span>
                            ) : (
                              rec.source || "—"
                            )}
                          </td>

                          <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs text-[#5f6368] border-r border-[#e8eaed] whitespace-nowrap">
                            {rec.recorded_at
                              ? new Date(rec.recorded_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })
                              : "—"}
                          </td>

                          <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs text-[#70757a] italic border-r border-[#e8eaed] whitespace-nowrap">
                            {rec.override_reason || "—"}
                          </td>

                          <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-right whitespace-nowrap space-x-1">
                            <button
                              type="button"
                              disabled={isPresent}
                              onClick={() => openDialog(rec, "PRESENT")}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                                isPresent
                                  ? "bg-[#e6f4ea] text-[#137333] cursor-default opacity-70"
                                  : "text-[#137333] hover:bg-[#e6f4ea]"
                              }`}
                            >
                              Mark Present
                            </button>
                            <button
                              type="button"
                              disabled={isMarkedAbsent}
                              onClick={() => openDialog(rec, "ABSENT")}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                                isMarkedAbsent
                                  ? "bg-[#fce8e6] text-[#c5221f] cursor-default opacity-70"
                                  : "text-[#c5221f] hover:bg-[#fce8e6]"
                              }`}
                            >
                              Mark Absent
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Manual Override Dialog Modal */}
      <Modal
        isOpen={Boolean(pending)}
        onClose={closeDialog}
        title={`Override Attendance: ${pending?.student?.full_name || ""}`}
        subtitle={`Set status to ${pending?.status || ""}`}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-1.5">
              Reason / Override Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Excused absence, technical check-in issue, late arrival..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#dadce0] rounded-lg text-sm text-[#202124] focus:border-[#1a73e8] focus:outline-none focus:ring-3 focus:ring-[#e8f0fe] transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e8eaed]">
            <button
              type="button"
              onClick={closeDialog}
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-[#5f6368] hover:bg-[#f1f3f4] rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-5 py-2 disabled:opacity-50 text-white font-semibold rounded-lg text-xs shadow-xs transition cursor-pointer ${
                pending?.status === "ABSENT"
                  ? "bg-[#d93025] hover:bg-[#b3261e]"
                  : pending?.status === "PRESENT"
                  ? "bg-[#137333] hover:bg-[#0d652d]"
                  : "bg-[#1a73e8] hover:bg-[#1557b0]"
              }`}
            >
              {saving ? "Saving..." : "Confirm Override"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
