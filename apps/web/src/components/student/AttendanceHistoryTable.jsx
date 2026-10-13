// apps/web/src/components/student/AttendanceHistoryTable.jsx
import { useState, useMemo } from "react";
import { Badge } from "../ui/Badge";
import { StatCard } from "../ui/StatCard";
import { EmptyState } from "../ui/EmptyState";
import { TableSkeleton, StatCardSkeleton } from "../ui/Skeleton";
import { GoogleProgressBar } from "../ui/ProgressBar";
import {
  IconClock,
  IconCheck,
  IconClose,
  IconRefresh,
  IconSearch,
} from "../ui/Icons";
import { formatClassDisplayName } from "../../utils/classFormatting";

export function AttendanceHistoryTable({
  records = [],
  onRefresh,
  loading = false,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("opened_at");
  const [sortAsc, setSortAsc] = useState(false);
  const [mobileMode, setMobileMode] = useState("cards"); // "cards" | "sheet"

  const total = records.length;
  const presentCount = records.filter((r) => r.status === "PRESENT").length;
  const absentCount = total - presentCount;
  const rate = total > 0 ? Math.round((presentCount / total) * 100) : 100;

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
    let list = records.filter((rec) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (rec.class_name && rec.class_name.toLowerCase().includes(q)) ||
        (rec.section && rec.section.toLowerCase().includes(q)) ||
        (rec.session_label && rec.session_label.toLowerCase().includes(q)) ||
        (rec.status && rec.status.toLowerCase().includes(q))
      );
    });

    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "opened_at") {
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
  }, [records, searchQuery, sortField, sortAsc]);

  return (
    <div className="space-y-4">
      {/* Top Metrics Cards */}
      {loading ? (
        <StatCardSkeleton count={3} />
      ) : (
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
      )}

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl shadow-xs border border-[#dadce0] overflow-hidden">
        {/* Table Header & Search */}
        <div className="p-4 sm:p-5 border-b border-[#dadce0] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-[#202124] text-base">
              Attendance History Records
            </h3>
            <p className="text-xs text-[#5f6368] mt-0.5">
              Verified facial biometric and professor override logs across all enrolled classes.
            </p>
          </div>

          <div className="flex items-center gap-2.5 justify-between md:justify-end w-full md:w-auto">
            <div className="relative flex-1 min-w-0 sm:w-60">
              <IconSearch className="w-4 h-4 text-[#5f6368] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search history..."
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

            {/* Mobile phone toggle */}
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

            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#3c4043] bg-white hover:bg-[#f1f3f4] border border-[#dadce0] rounded-lg transition shadow-2xs shrink-0 cursor-pointer disabled:opacity-70"
              title="Refresh attendance records"
            >
              <IconRefresh className={`w-3.5 h-3.5 text-[#5f6368] ${loading ? "animate-spin text-[#1a73e8]" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Pinned Google Indeterminate Progress Bar during background refresh */}
        {loading && records.length > 0 && (
          <GoogleProgressBar height="h-1" />
        )}

        {/* Loading Skeleton */}
        {loading && records.length === 0 ? (
          <TableSkeleton
            rows={5}
            cols={7}
            headers={["Class", "Section", "Session Label", "Date & Time", "Status", "Verification Source", "Notes"]}
          />
        ) : (
          <>
            {/* Mobile Card List (< md when mobileMode === 'cards') */}
            <div className={`${mobileMode === "cards" ? "block md:hidden" : "hidden"} divide-y divide-[#e8eaed]`}>
              {filteredRecords.length === 0 ? (
                <div className="p-8 text-center">
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
                </div>
              ) : (
                filteredRecords.map((rec, idx) => (
                  <div key={rec.session_id || idx} className="p-4 space-y-2.5 hover:bg-[#f8f9fa] transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-sm text-[#202124]">{formatClassDisplayName(rec.class_name, rec.section)}</p>
                        <p className="text-xs text-[#5f6368] mt-0.5">
                          Section {rec.section ? rec.section.toUpperCase() : "—"} • {rec.session_label || "Regular Session"}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {rec.status === "PRESENT" ? (
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

                    <div className="flex items-center justify-between text-xs text-[#5f6368] bg-[#f8f9fa] p-2.5 rounded-xl border border-[#dadce0]/60">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#80868b] block">Time</span>
                        <span>{new Date(rec.opened_at).toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[#80868b] block">Source</span>
                        <span className="font-medium">
                          {rec.source === "BIOMETRIC_LIVENESS"
                            ? "Face Biometric"
                            : rec.source === "MANUAL_OVERRIDE"
                            ? "Professor Override"
                            : rec.source || "—"}
                        </span>
                      </div>
                    </div>

                    {rec.override_reason && (
                      <p className="text-xs text-[#70757a] italic bg-[#fff8e1] px-2.5 py-1.5 rounded-lg border border-[#ffe082]/60">
                        Note: {rec.override_reason}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* SPREADSHEET TABLE VIEW (Desktop >= md or mobile when mobileMode === 'sheet') */}
            <div className={`${mobileMode === "cards" ? "hidden md:block" : "block"}`}>
              <div className="md:hidden px-4 py-2 bg-[#f1f3f4] border-b border-[#dadce0] text-[11px] text-[#5f6368] flex items-center justify-between">
                <span>↔ Swipe horizontally for full spreadsheet</span>
                <span className="text-[10px] font-semibold text-[#1a73e8]">Spreadsheet View</span>
              </div>

              <div className="overflow-x-auto overscroll-x-contain relative">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead className="bg-[#f8f9fa] text-[#5f6368] uppercase text-[10px] sm:text-[11px] tracking-wider border-b border-[#dadce0] font-semibold">
                    <tr>
                      <th
                        onClick={() => handleSort("class_name")}
                        className="px-3 sm:px-5 py-2.5 sm:py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition md:sticky md:left-0 bg-[#f8f9fa] md:z-20 md:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] min-w-[130px] sm:min-w-[160px]"
                      >
                        <div className="flex items-center justify-between">
                          <span>Class</span>
                          {renderSortIndicator("class_name")}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("section")}
                        className="px-3 sm:px-5 py-2.5 sm:py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition min-w-[80px] sm:min-w-[100px]"
                      >
                        <div className="flex items-center justify-between">
                          <span>Section</span>
                          {renderSortIndicator("section")}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("session_label")}
                        className="px-3 sm:px-5 py-2.5 sm:py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition min-w-[120px] sm:min-w-[150px]"
                      >
                        <div className="flex items-center justify-between">
                          <span>Session Label</span>
                          {renderSortIndicator("session_label")}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("opened_at")}
                        className="px-3 sm:px-5 py-2.5 sm:py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition min-w-[110px] sm:min-w-[140px]"
                      >
                        <div className="flex items-center justify-between">
                          <span>Date & Time</span>
                          {renderSortIndicator("opened_at")}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("status")}
                        className="px-3 sm:px-5 py-2.5 sm:py-3 text-center border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition min-w-[80px] sm:min-w-[100px]"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Status</span>
                          {renderSortIndicator("status")}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("source")}
                        className="px-3 sm:px-5 py-2.5 sm:py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition min-w-[120px] sm:min-w-[150px]"
                      >
                        <div className="flex items-center justify-between">
                          <span>Verification Source</span>
                          {renderSortIndicator("source")}
                        </div>
                      </th>
                      <th className="px-3 sm:px-5 py-2.5 sm:py-3 min-w-[110px] sm:min-w-[140px]">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8eaed] bg-white">
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
                          className="hover:bg-[#f8f9fa] transition-colors group"
                        >
                          {/* Class Name column (frozen on md+ desktop only) */}
                          <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 font-semibold text-[#202124] border-r border-[#e8eaed] md:sticky md:left-0 bg-white group-hover:bg-[#f8f9fa] md:z-10 md:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] whitespace-nowrap">
                            {formatClassDisplayName(rec.class_name, rec.section)}
                          </td>
                          <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs text-[#5f6368] border-r border-[#e8eaed] whitespace-nowrap uppercase">
                            {rec.section}
                          </td>
                          <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs text-[#202124] font-medium border-r border-[#e8eaed] whitespace-nowrap">
                            {rec.session_label || "—"}
                          </td>
                          <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs text-[#5f6368] border-r border-[#e8eaed] whitespace-nowrap">
                            {new Date(rec.opened_at).toLocaleString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-center border-r border-[#e8eaed] whitespace-nowrap">
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
                          <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs text-[#5f6368] border-r border-[#e8eaed] whitespace-nowrap">
                            {rec.source === "BIOMETRIC_LIVENESS" ? (
                              <span className="text-[#137333] font-medium">Face Biometric</span>
                            ) : rec.source === "MANUAL_OVERRIDE" ? (
                              <span className="text-[#b06000] font-medium">Professor Override</span>
                            ) : (
                              rec.source || "—"
                            )}
                          </td>
                          <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs text-[#70757a] italic whitespace-nowrap">
                            {rec.override_reason || "—"}
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
    </div>
  );
}
