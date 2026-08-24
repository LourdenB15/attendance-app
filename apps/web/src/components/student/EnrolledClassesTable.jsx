// apps/web/src/components/student/EnrolledClassesTable.jsx
export function EnrolledClassesTable({ classes, onSelectClass, onTakeAttendance }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">
            Your Enrolled Classes ({classes.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Click on any class to open details or take live attendance when a session is active.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] tracking-wider border-b border-slate-200 font-bold">
            <tr>
              <th className="px-5 py-3">Class Name</th>
              <th className="px-5 py-3">Professor</th>
              <th className="px-5 py-3">Section / Term</th>
              <th className="px-5 py-3">Join Code</th>
              <th className="px-5 py-3 text-center">Session Status</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {classes.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-5 py-8 text-center text-slate-400 text-xs">
                  You haven't joined any classes yet. Enter a join code above to enroll.
                </td>
              </tr>
            ) : (
              classes.map((c) => {
                const hasActive = Boolean(c.active_session_id);
                const isPresent = c.my_attendance_status === "PRESENT";

                return (
                  <tr
                    key={c.class_id}
                    className="hover:bg-slate-50/80 transition cursor-pointer"
                    onClick={() => onSelectClass && onSelectClass(c.class_id)}
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900 hover:text-indigo-600 transition">
                        {c.name}
                      </p>
                      <span className="text-[11px] text-slate-400">
                        Enrolled: {new Date(c.enrolled_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 text-xs font-medium">
                      {c.professor_name || "Faculty Member"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-xs">
                      {c.semester} • {c.section}
                    </td>
                    <td className="px-5 py-3.5">
                      <code className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-mono text-xs font-bold">
                        {c.join_code}
                      </code>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {hasActive ? (
                        isPresent ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            ✓ Present
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                            Live Session
                          </span>
                        )
                      ) : (
                        <span className="text-slate-400 text-xs font-medium">
                          No Session
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {hasActive && !isPresent ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onTakeAttendance) onTakeAttendance(c.class_id);
                          }}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs text-xs transition inline-flex items-center gap-1.5"
                        >
                          📸 Take Attendance
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectClass) onSelectClass(c.class_id);
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition"
                        >
                          View Class →
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
