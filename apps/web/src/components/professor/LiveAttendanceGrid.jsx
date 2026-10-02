// apps/web/src/components/professor/LiveAttendanceGrid.jsx
import { useState, useEffect } from "react";
import { Badge } from "../ui/Badge";
import { sessionsApi } from "../../api";
import { useToast } from "../../context/useToast";

export function LiveAttendanceGrid({ activeSessionId, attendance, onOverrideSuccess }) {
  // Override waiting for the note dialog: { student, status }
  const [pending, setPending] = useState(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const openDialog = (student, status) => {
    setPending({ student, status });
    setNote(student.override_reason || "");
  };

  const closeDialog = () => {
    if (saving) return;
    setPending(null);
    setNote("");
  };

  // Escape closes the dialog
  useEffect(() => {
    if (!pending) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape" && !saving) {
        setPending(null);
        setNote("");
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [pending, saving]);

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
      showToast("success", `${student.full_name} marked ${status.toLowerCase()}.`);
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <h4 className="font-bold text-slate-900 text-sm">Live Attendance Grid</h4>
        <p className="text-xs text-slate-500 mt-0.5">
          Use the Present / Absent buttons to override a student's attendance.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] tracking-wider border-b border-slate-200 font-bold">
            <tr>
              <th className="px-5 py-3">Student Name</th>
              <th className="px-5 py-3">Attendance Status</th>
              <th className="px-5 py-3">Source</th>
              <th className="px-5 py-3">Check-in Time</th>
              <th className="px-5 py-3">Notes</th>
              <th className="px-5 py-3 text-right">Mark As</th>
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
              attendance.map((rec) => {
                const isPresent = rec.status === "PRESENT";
                // Only a recorded absence counts; "no record yet" can still be marked absent
                const isMarkedAbsent = !isPresent && Boolean(rec.source);

                return (
                  <tr key={rec.student_id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-800">{rec.full_name}</p>
                      <span className="text-[11px] text-slate-400 font-mono">{rec.email}</span>
                    </td>
                    <td className="px-5 py-3">
                      {isPresent ? (
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
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden text-xs font-semibold">
                        <button
                          type="button"
                          disabled={isPresent}
                          onClick={() => openDialog(rec, "PRESENT")}
                          className={`px-3 py-1.5 transition disabled:cursor-not-allowed ${
                            isPresent
                              ? "bg-emerald-600 text-white"
                              : "bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          disabled={isMarkedAbsent}
                          onClick={() => openDialog(rec, "ABSENT")}
                          className={`px-3 py-1.5 border-l border-slate-200 transition disabled:cursor-not-allowed ${
                            isMarkedAbsent
                              ? "bg-rose-600 text-white"
                              : "bg-white text-slate-600 hover:bg-rose-50 hover:text-rose-700"
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

      {/* Mark-as dialog with an optional note */}
      {pending && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={closeDialog}
        >
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="mark-as-title"
            onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 p-6"
          >
            <h3 id="mark-as-title" className="text-base font-bold text-slate-900">
              Mark {pending.student.full_name} as {pending.status === "PRESENT" ? "present" : "absent"}?
            </h3>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mt-4 mb-1">
              Note (optional)
            </label>
            <input
              type="text"
              autoFocus
              maxLength={255}
              placeholder="e.g. Excused, medical"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={closeDialog}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`px-4 py-2 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50 ${
                  pending.status === "PRESENT"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {saving ? "Saving..." : `Mark ${pending.status === "PRESENT" ? "Present" : "Absent"}`}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
