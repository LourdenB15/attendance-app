// apps/web/src/components/professor/LiveAttendanceGrid.jsx
import { useState } from "react";
import { Badge } from "../ui/Badge";
import { sessionsApi } from "../../api";
import { useToast } from "../../context/useToast";
import { Modal } from "../ui/Modal";
import { EmptyState } from "../ui/EmptyState";
import {
  IconSearch,
  IconUsers,
} from "../ui/Icons";

export function LiveAttendanceGrid({
  activeSessionId,
  attendance = [],
  onOverrideSuccess,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // "ALL" | "PRESENT" | "ABSENT"
  const [pending, setPending] = useState(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const totalCount = attendance.length;
  const presentCount = attendance.filter((r) => r.status === "PRESENT").length;
  const absentCount = totalCount - presentCount;
  const rate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  const filteredAttendance = attendance.filter((rec) => {
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
      <div className="p-5 border-b border-[#dadce0] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-bold text-[#202124]">
              Live Attendance Roster
            </h4>
            <p className="text-xs text-[#5f6368] mt-0.5">
              Live biometric check-ins will appear here in real time. Use actions to override if needed.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#f8f9fa] border border-[#dadce0] px-4 py-2 rounded-xl shrink-0">
            <div className="text-right">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#5f6368]">
                Attendance Rate
              </span>
              <span className="text-base font-black text-[#137333]">
                {presentCount} / {totalCount} ({rate}%)
              </span>
            </div>
            <div className="w-16 h-2 bg-[#e8eaed] rounded-full overflow-hidden shrink-0">
              <div
                className="h-full bg-[#137333] rounded-full transition-all duration-300"
                style={{ width: `${rate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Search & Status Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="flex bg-[#f1f3f4] p-1 rounded-lg text-xs font-semibold">
            {[
              { id: "ALL", label: `All (${totalCount})` },
              { id: "PRESENT", label: `Present (${presentCount})` },
              { id: "ABSENT", label: `Absent (${absentCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1 rounded-md transition-all ${
                  statusFilter === tab.id
                    ? "bg-white text-[#1a73e8] shadow-xs font-bold"
                    : "text-[#5f6368] hover:text-[#202124]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative sm:w-64">
            <IconSearch className="w-4 h-4 text-[#5f6368] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 bg-[#f8f9fa] border border-[#dadce0] rounded-lg text-xs text-[#202124] placeholder-[#80868b] focus:bg-white focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#e8f0fe] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f8f9fa] text-[#5f6368] uppercase text-[11px] tracking-wider border-b border-[#dadce0] font-semibold">
            <tr>
              <th className="px-5 py-3">Student Name</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Source</th>
              <th className="px-5 py-3">Check-in Time</th>
              <th className="px-5 py-3">Notes</th>
              <th className="px-5 py-3 text-right">Attendance Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8eaed]">
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
                    className="hover:bg-[#f8f9fa] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-[#202124]">{rec.full_name}</p>
                      <span className="text-[11px] text-[#5f6368] font-mono">
                        {rec.email}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
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
                    <td className="px-5 py-3.5 text-xs text-[#5f6368]">
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
                    <td className="px-5 py-3.5 text-xs text-[#5f6368]">
                      {rec.recorded_at
                        ? new Date(rec.recorded_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#70757a] italic">
                      {rec.override_reason || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex rounded-lg border border-[#dadce0] overflow-hidden text-xs font-semibold shadow-2xs">
                        <button
                          type="button"
                          disabled={isPresent}
                          onClick={() => openDialog(rec, "PRESENT")}
                          className={`px-3 py-1.5 transition disabled:cursor-not-allowed ${
                            isPresent
                              ? "bg-[#137333] text-white"
                              : "bg-white text-[#3c4043] hover:bg-[#e6f4ea] hover:text-[#137333]"
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          disabled={isMarkedAbsent}
                          onClick={() => openDialog(rec, "ABSENT")}
                          className={`px-3 py-1.5 border-l border-[#dadce0] transition disabled:cursor-not-allowed ${
                            isMarkedAbsent
                              ? "bg-[#c5221f] text-white"
                              : "bg-white text-[#3c4043] hover:bg-[#fce8e6] hover:text-[#c5221f]"
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Manual Override Confirmation & Note Modal */}
      <Modal
        isOpen={Boolean(pending)}
        onClose={closeDialog}
        title={
          pending
            ? `Mark ${pending.student.full_name} as ${
                pending.status === "PRESENT" ? "Present" : "Absent"
              }?`
            : ""
        }
        subtitle="This manual override will update their status for this live session."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-1.5">
              Reason / Note (Optional)
            </label>
            <input
              type="text"
              autoFocus
              maxLength={255}
              placeholder="e.g. Excused medical absence, verified in-person"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#dadce0] rounded-lg text-sm text-[#202124] focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#e8f0fe] transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e8eaed]">
            <button
              type="button"
              onClick={closeDialog}
              className="px-4 py-2 text-xs font-semibold text-[#5f6368] hover:bg-[#f1f3f4] rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-5 py-2 text-white text-xs font-bold rounded-lg shadow-xs transition disabled:opacity-50 ${
                pending?.status === "PRESENT"
                  ? "bg-[#137333] hover:bg-[#0d5324]"
                  : "bg-[#d93025] hover:bg-[#b3261e]"
              }`}
            >
              {saving
                ? "Saving..."
                : `Confirm as ${pending?.status === "PRESENT" ? "Present" : "Absent"}`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
