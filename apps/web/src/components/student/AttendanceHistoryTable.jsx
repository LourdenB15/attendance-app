// apps/web/src/components/student/AttendanceHistoryTable.jsx
import { Badge } from "../ui/Badge";

export function AttendanceHistoryTable({ records, onRefresh }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 text-sm">Attendance Records</h3>
        <button
          type="button"
          onClick={onRefresh}
          className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
        >
          🔄 Refresh History
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] tracking-wider border-b border-slate-200 font-bold">
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
          <tbody className="divide-y divide-slate-100">
            {records.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-5 py-8 text-center text-slate-400">
                  No attendance records logged yet.
                </td>
              </tr>
            ) : (
              records.map((rec, idx) => (
                <tr key={rec.session_id || idx} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-3 font-semibold text-slate-900">{rec.class_name}</td>
                  <td className="px-5 py-3 text-slate-600">{rec.section}</td>
                  <td className="px-5 py-3 text-slate-600">{rec.session_label || "—"}</td>
                  <td className="px-5 py-3 text-xs text-slate-500">
                    {new Date(rec.opened_at).toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    {rec.status === "PRESENT" ? (
                      <Badge variant="success" size="xs">✓ Present</Badge>
                    ) : (
                      <Badge variant="danger" size="xs">✕ Absent</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-600">{rec.source || "—"}</td>
                  <td className="px-5 py-3 text-xs text-slate-500 italic">{rec.override_reason || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
