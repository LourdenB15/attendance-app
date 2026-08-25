// apps/web/src/components/student/StudentClassDetail.jsx
import { useState } from "react";
import { livenessApi } from "../../api";
import { useToast } from "../../context/useToast";
import { useAuth } from "../../context/useAuth";
import { LivenessCamera } from "../liveness/LivenessCamera";

export function StudentClassDetail({
  classItem,
  onBack,
  onAttendanceMarked,
  onGoToEnroll,
  attendanceRecords = [],
}) {
  const { currentUser } = useAuth();
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const isEnrolled = Boolean(currentUser?.has_biometric_enrolled);

  const classRecords = attendanceRecords.filter(
    (r) => r.class_id === classItem.class_id || r.class_name === classItem.name,
  );

  const hasActiveSession = Boolean(classItem.active_session_id);
  const isAlreadyPresent = classItem.my_attendance_status === "PRESENT";

  const handleTakeAttendanceClick = () => {
    if (!isEnrolled) {
      showToast("error", "Please enroll your face first in the Face Setup tab.");
      if (onGoToEnroll) onGoToEnroll();
      return;
    }
    setShowScanner(true);
  };

  const handleTakeAttendance = async (livenessResult) => {
    setShowScanner(false);
    setLoading(true);
    try {
      const res = await livenessApi.checkIn(classItem.active_session_id, livenessResult);
      if (res.present) {
        showToast("success", `Attendance recorded as PRESENT for ${classItem.name}!`);
        if (onAttendanceMarked) onAttendanceMarked();
      } else {
        showToast("error", res.message || "Face not recognized. Attendance not recorded.");
      }
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button
                type="button"
                onClick={onBack}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
              >
                ← Back to My Classes
              </button>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{classItem.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Professor: <span className="font-semibold text-slate-700">{classItem.professor_name || "Assigned Faculty"}</span> • {classItem.semester} ({classItem.section})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600">
              Code: <strong className="text-slate-900">{classItem.join_code}</strong>
            </span>
          </div>
        </div>

        {/* Live Attendance Action Box */}
        <div className="mt-6">
          {hasActiveSession ? (
            isAlreadyPresent ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900">Attendance Recorded</h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      You are marked as <strong>PRESENT</strong> for this active session.
                      {classItem.my_checked_in_at && ` (Checked in: ${new Date(classItem.my_checked_in_at).toLocaleTimeString()})`}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-200 text-emerald-800 text-xs font-bold rounded-lg shrink-0">
                  PRESENT
                </span>
              </div>
            ) : !isEnrolled ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-bold">
                    👤
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-950">
                      Face Setup Required Before Attendance
                    </h4>
                    <p className="text-xs text-amber-800 mt-0.5">
                      A live session is open, but you haven't registered your face profile yet. Please complete Face Setup to check in.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onGoToEnroll}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md text-xs transition shrink-0 flex items-center gap-2"
                >
                  👤 Go to Face Setup
                </button>
              </div>
            ) : (
              <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
                  <div>
                    <h4 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                      Live Attendance Session Open!
                      {classItem.active_session_label && (
                        <span className="text-xs font-normal text-indigo-600">
                          ({classItem.active_session_label})
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-indigo-700 mt-0.5">
                      Your professor is currently taking attendance. Complete quick face verification to check in.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleTakeAttendanceClick}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md text-xs transition shrink-0 flex items-center gap-2"
                >
                  📸 Take Attendance Now
                </button>
              </div>
            )
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center">
              <span className="text-xl block mb-1">⏳</span>
              <h4 className="text-sm font-bold text-slate-700">No Active Attendance Session</h4>
              <p className="text-xs text-slate-500 mt-0.5 max-w-md mx-auto">
                There is no live attendance session open for this class right now. When your professor opens a session, the "Take Attendance" button will appear here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Liveness Scanner Modal / Container */}
      {showScanner && (
        <LivenessCamera
          mode="attendance"
          title={`Attendance Check-In: ${classItem.name}`}
          onComplete={handleTakeAttendance}
          onCancel={() => setShowScanner(false)}
        />
      )}

      {/* Attendance History for this specific class */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">
            Class Attendance History ({classRecords.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] tracking-wider border-b border-slate-200 font-bold">
              <tr>
                <th className="px-5 py-3">Session Label</th>
                <th className="px-5 py-3">Check-in Time</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classRecords.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-5 py-8 text-center text-slate-400 text-xs">
                    No past attendance records found for this class yet.
                  </td>
                </tr>
              ) : (
                classRecords.map((r, i) => (
                  <tr key={r.id || i} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3 font-semibold text-slate-800">
                      {r.session_label || "Standard Class Session"}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {r.checked_in_at ? new Date(r.checked_in_at).toLocaleString() : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          r.status === "PRESENT"
                            ? "bg-emerald-100 text-emerald-800"
                            : r.status === "LATE"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {r.status}
                      </span>
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
