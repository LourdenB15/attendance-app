// apps/web/src/components/professor/LiveAttendanceGrid.jsx
import { useState } from "react";
import { Badge } from "../ui/Badge";
import { sessionsApi } from "../../api";
import { useToast } from "../../context/useToast";

export function LiveAttendanceGrid({ activeSessionId, attendance, onOverrideSuccess }) {
  const [studentId, setStudentId] = useState("");
  const [status, setStatus] = useState("PRESENT");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleOverride = async (e) => {
    e.preventDefault();
    if (!studentId) return;
    setLoading(true);
    try {
      await sessionsApi.overrideAttendance(activeSessionId, {
        studentId,
        status,
        reason: reason || undefined,
      });
      showToast("success", "Attendance override recorded.");
      setStudentId("");
      setReason("");
      if (onOverrideSuccess) onOverrideSuccess();
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <h4 className="font-bold text-slate-900 text-sm">Live Attendance Grid</h4>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] tracking-wider border-b border-slate-200 font-bold">
            <tr>
              <th className="px-5 py-3">Student Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Attendance Status</th>
              <th className="px-5 py-3">Source</th>
              <th className="px-5 py-3">Check-in Time</th>
              <th className="px-5 py-3">Override Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {attendance.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-5 py-8 text-center text-slate-400">
                  No enrolled students in this class.
                </td>
              </tr>
            ) : (
              attendance.map((rec) => (
                <tr key={rec.student_id} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-3 font-semibold text-slate-800">{rec.full_name}</td>
                  <td className="px-5 py-3 text-xs text-slate-500 font-mono">{rec.email}</td>
                  <td className="px-5 py-3">
                    {rec.status === "PRESENT" ? (
                      <Badge variant="success" size="xs">✓ Present</Badge>
                    ) : (
                      <Badge variant="danger" size="xs">✕ Absent</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-600">{rec.source || "—"}</td>
                  <td className="px-5 py-3 text-xs text-slate-500">
                    {rec.recorded_at ? new Date(rec.recorded_at).toLocaleTimeString() : "—"}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500 italic">{rec.override_reason || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Manual Override Sub-Panel */}
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Manual Attendance Override
        </h5>
        <form onSubmit={handleOverride} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Select Student</label>
            <select
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Choose Student --</option>
              {attendance.map((s) => (
                <option key={s.student_id} value={s.student_id}>
                  {s.full_name} ({s.status})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">New Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
            >
              <option value="PRESENT">PRESENT</option>
              <option value="ABSENT">ABSENT</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Reason Note</label>
            <input
              type="text"
              placeholder="e.g. Excused medical absence"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition"
          >
            {loading ? "Saving..." : "Apply Override"}
          </button>
        </form>
      </div>
    </div>
  );
}
