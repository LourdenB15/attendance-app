// apps/web/src/components/student/StudentClassDetail.jsx
import { useState } from "react";
import { livenessApi } from "../../api";
import { useToast } from "../../context/useToast";
import { useAuth } from "../../context/useAuth";
import { LivenessCamera } from "../liveness/LivenessCamera";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import { Badge } from "../ui/Badge";
import { getClassTheme } from "../ui/classroomThemes";
import {
  IconChevronLeft,
  IconCamera,
  IconCheck,
  IconClose,
  IconClock,
} from "../ui/Icons";

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
  const classRecords = attendanceRecords.filter((r) => r.class_id === classItem.class_id);

  const hasActiveSession = Boolean(classItem.active_session_id);
  const isAlreadyPresent = classItem.my_attendance_status === "PRESENT";
  const isMarkedAbsent =
    classItem.my_attendance_source === "MANUAL_OVERRIDE" && !isAlreadyPresent;

  const theme = getClassTheme(classItem.class_id || classItem.name);

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
        if (onAttendanceMarked) await onAttendanceMarked();
        showToast("success", `Attendance recorded as PRESENT for ${classItem.name}!`);
      } else {
        showToast("error", res.message || "Face not recognized. Attendance not recorded.");
      }
    } catch (err) {
      showToast("error", err.message);
      if (err.code === "ATTENDANCE_OVERRIDDEN" && onAttendanceMarked) onAttendanceMarked();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {loading && <LoadingOverlay message="Recording your attendance..." />}

      {/* Google Classroom Class Header Banner */}
      <div
        className={`${theme.bannerBg} rounded-2xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden`}
      >
        <div className="absolute -right-8 -bottom-12 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-black/15 hover:bg-black/25 text-white backdrop-blur-xs transition mb-3"
            >
              <IconChevronLeft className="w-3.5 h-3.5" />
              <span>Back to My Classes</span>
            </button>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
              {classItem.name}
            </h2>
            <p className={`text-sm ${theme.subText} font-medium mt-1`}>
              Teacher: {classItem.professor_name || "Faculty Member"} • {classItem.section} ({classItem.semester})
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl px-4 py-3 self-start md:self-auto">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-white/80">
              Class Code
            </span>
            <span className="font-mono text-lg font-black tracking-widest text-white">
              {classItem.join_code}
            </span>
          </div>
        </div>
      </div>

      {/* Live Attendance Check-In Action Section */}
      <div className="bg-white rounded-2xl shadow-xs border border-[#dadce0] p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#5f6368] mb-4">
          Session Attendance Status
        </h3>

        {hasActiveSession ? (
          isAlreadyPresent ? (
            <div className="bg-[#e6f4ea] border border-[#ceead6] rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[#137333] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <IconCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#137333]">
                    Attendance Successfully Logged!
                  </h4>
                  <p className="text-xs text-[#1e8e3e] mt-0.5">
                    You have verified your identity and are marked as <strong>PRESENT</strong> for this session.
                    {classItem.my_checked_in_at &&
                      ` (${new Date(classItem.my_checked_in_at).toLocaleTimeString()})`}
                  </p>
                </div>
              </div>
              <Badge variant="success" size="md" dot>
                PRESENT
              </Badge>
            </div>
          ) : isMarkedAbsent ? (
            <div className="bg-[#fce8e6] border border-[#fad2cf] rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[#c5221f] text-white flex items-center justify-center shrink-0">
                  <IconClose className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#c5221f]">
                    Attendance Status: Absent
                  </h4>
                  <p className="text-xs text-[#b3261e] mt-0.5">
                    Your attendance was marked as absent for this session by your instructor.
                  </p>
                </div>
              </div>
              <Badge variant="danger" size="md" dot>
                ABSENT
              </Badge>
            </div>
          ) : !isEnrolled ? (
            <div className="bg-[#fef7e0] border border-[#feefc3] rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[#b06000] text-white flex items-center justify-center shrink-0">
                  <IconCamera className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#b06000]">
                    Action Required: Face Profile Setup
                  </h4>
                  <p className="text-xs text-[#824400] mt-0.5">
                    A live attendance window is active, but you must register your face profile before taking attendance.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onGoToEnroll}
                className="px-5 py-2.5 bg-[#b06000] hover:bg-[#8f4e00] text-white text-xs font-bold rounded-lg shadow-xs transition shrink-0"
              >
                Go to Face Setup →
              </button>
            </div>
          ) : (
            <div className="bg-[#e8f0fe] border border-[#d2e3fc] rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[#1a73e8] text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
                  <IconCamera className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1a73e8] animate-ping" />
                    <h4 className="text-base font-bold text-[#1a73e8]">
                      Live Attendance Window is Open!
                    </h4>
                  </div>
                  <p className="text-xs text-[#1967d2] mt-0.5">
                    {classItem.active_session_label ? `Topic: ${classItem.active_session_label} • ` : ""}
                    Check in now with a quick biometric camera scan.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={handleTakeAttendanceClick}
                className="px-6 py-3 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white font-bold rounded-xl shadow-md text-xs transition shrink-0 inline-flex items-center gap-2 hover:scale-102 active:scale-98"
              >
                <IconCamera className="w-4 h-4" />
                <span>Verify Face & Check In</span>
              </button>
            </div>
          )
        ) : (
          <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-white border border-[#dadce0] text-[#5f6368] flex items-center justify-center mx-auto mb-2 shadow-2xs">
              <IconClock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-[#202124]">
              No Active Attendance Session
            </h4>
            <p className="text-xs text-[#5f6368] mt-0.5 max-w-sm mx-auto">
              Your instructor has not opened an attendance window for this class right now. Please check back during class time.
            </p>
          </div>
        )}
      </div>

      {/* Liveness Camera Scanner Modal */}
      {showScanner && (
        <LivenessCamera
          mode="attendance"
          title={`Check-In: ${classItem.name}`}
          onComplete={handleTakeAttendance}
          onCancel={() => setShowScanner(false)}
        />
      )}

      {/* Class Attendance History Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-[#dadce0] overflow-hidden">
        <div className="p-4 border-b border-[#dadce0] flex items-center justify-between">
          <h3 className="font-bold text-[#202124] text-sm">
            Past Class Check-Ins ({classRecords.length})
          </h3>
          <span className="text-xs text-[#5f6368]">
            Records logged via active liveness
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f8f9fa] text-[#5f6368] uppercase text-[11px] tracking-wider border-b border-[#dadce0] font-semibold">
              <tr>
                <th className="px-5 py-3">Session Topic / Label</th>
                <th className="px-5 py-3">Check-in Time</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8eaed]">
              {classRecords.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-5 py-8 text-center text-xs text-[#5f6368]">
                    No past attendance records found for this class yet.
                  </td>
                </tr>
              ) : (
                classRecords.map((r, i) => (
                  <tr key={r.session_id || i} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="px-5 py-3.5 font-medium text-[#202124]">
                      {r.session_label || "Standard Class Session"}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#5f6368]">
                      {r.recorded_at ? new Date(r.recorded_at).toLocaleString() : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      {r.status === "PRESENT" ? (
                        <Badge variant="success" size="xs" dot>
                          Present
                        </Badge>
                      ) : r.status === "LATE" ? (
                        <Badge variant="warning" size="xs" dot>
                          Late
                        </Badge>
                      ) : (
                        <Badge variant="danger" size="xs" dot>
                          Absent
                        </Badge>
                      )}
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
