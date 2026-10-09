// apps/web/src/components/student/AttendanceHistoryTable.jsx
import { useState } from "react";
import { Badge } from "../ui/Badge";
import { StatCard } from "../ui/StatCard";
import { EmptyState } from "../ui/EmptyState";
import {
  IconClock,
  IconCheck,
  IconClose,
  IconRefresh,
  IconSearch,
} from "../ui/Icons";

export function AttendanceHistoryTable({ records = [], onRefresh }) {
  const [searchQuery, setSearchQuery] = useState("");

  const total = records.length;
  const presentCount = records.filter((r) => r.status === "PRESENT").length;
  const absentCount = total - presentCount;
  const rate = total > 0 ? Math.round((presentCount / total) * 100) : 100;

  const filteredRecords = records.filter((rec) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (rec.class_name && rec.class_name.toLowerCase().includes(q)) ||
      (rec.section && rec.section.toLowerCase().includes(q)) ||
      (rec.session_label && rec.session_label.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<IconCheck className="w-6 h-6" />}
          label="Present Sessions"
          value={presentCount}
          subtitle={`${rate}% attendance record`}
          variant="green"
        />
        <StatCard
          icon={<IconClose className="w-6 h-6" />}
          label="Absent Sessions"
          value={absentCount}
          subtitle="Missed or excused"
          variant={absentCount > 0 ? "amber" : "gray"}
        />
        <StatCard
          icon={<IconClock className="w-6 h-6" />}
          label="Total Logged"
          value={total}
          subtitle="Sessions conducted"
          variant="blue"
        />
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl shadow-xs border border-[#dadce0] overflow-hidden">
        {/* Table Header & Search */}
        <div className="p-4 sm:p-5 border-b border-[#dadce0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-[#202124] text-base">
              Attendance History Records
            </h3>
            <p className="text-xs text-[#5f6368] mt-0.5">
              Verified facial biometric and professor override logs across all enrolled classes.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative sm:w-60">
              <IconSearch className="w-4 h-4 text-[#5f6368] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 bg-[#f8f9fa] border border-[#dadce0] rounded-lg text-xs text-[#202124] placeholder-[#80868b] focus:bg-white focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#e8f0fe] transition-all"
              />
            </div>

            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#3c4043] bg-white hover:bg-[#f1f3f4] border border-[#dadce0] rounded-lg transition shadow-2xs shrink-0"
              title="Refresh attendance records"
            >
              <IconRefresh className="w-3.5 h-3.5 text-[#5f6368]" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f8f9fa] text-[#5f6368] uppercase text-[11px] tracking-wider border-b border-[#dadce0] font-semibold">
              <tr>
                <th className="px-5 py-3">Class</th>
                <th className="px-5 py-3">Section</th>
                <th className="px-5 py-3">Session Label</th>
                <th className="px-5 py-3">Date & Time</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Verification Source</th>
                <th className="px-5 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8eaed]">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center">
                    <EmptyState
                      icon={<IconClock className="w-6 h-6" />}
                      title={
                        searchQuery
                          ? "No matching attendance records"
                          : "No attendance records logged yet"
                      }
                      description={
                        searchQuery
                          ? `No records found for "${searchQuery}".`
                          : "When you verify your face and check into class sessions, your attendance history will be tracked here."
                      }
                      className="border-none p-4"
                    />
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec, idx) => (
                  <tr
                    key={rec.session_id || idx}
                    className="hover:bg-[#f8f9fa] transition-colors"
                  >
                    <td className="px-5 py-3.5 font-semibold text-[#202124]">
                      {rec.class_name}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#5f6368]">{rec.section}</td>
                    <td className="px-5 py-3.5 text-xs text-[#202124] font-medium">
                      {rec.session_label || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#5f6368]">
                      {new Date(rec.opened_at).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      {rec.status === "PRESENT" ? (
                        <Badge variant="success" size="xs" dot>
                          Present
                        </Badge>
                      ) : (
                        <Badge variant="danger" size="xs" dot>
                          Absent
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#5f6368]">
                      {rec.source === "BIOMETRIC_LIVENESS" ? (
                        <span className="text-[#137333] font-medium">Face Biometric</span>
                      ) : rec.source === "MANUAL_OVERRIDE" ? (
                        <span className="text-[#b06000] font-medium">Professor Override</span>
                      ) : (
                        rec.source || "—"
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#70757a] italic">
                      {rec.override_reason || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
