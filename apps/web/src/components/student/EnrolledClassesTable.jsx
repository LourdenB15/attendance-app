// apps/web/src/components/student/EnrolledClassesTable.jsx
export function EnrolledClassesTable({ classes }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-800 text-sm">Your Enrolled Classes ({classes.length})</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] tracking-wider border-b border-slate-200 font-bold">
            <tr>
              <th className="px-5 py-3">Class Name</th>
              <th className="px-5 py-3">Semester</th>
              <th className="px-5 py-3">Section</th>
              <th className="px-5 py-3">Join Code</th>
              <th className="px-5 py-3">Enrolled Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {classes.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-5 py-8 text-center text-slate-400">
                  You haven't joined any classes yet. Enter a join code above to enroll.
                </td>
              </tr>
            ) : (
              classes.map((c) => (
                <tr key={c.class_id} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-3 font-semibold text-slate-900">{c.name}</td>
                  <td className="px-5 py-3 text-slate-600">{c.semester}</td>
                  <td className="px-5 py-3 text-slate-600">{c.section}</td>
                  <td className="px-5 py-3">
                    <code className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-mono text-xs">
                      {c.join_code}
                    </code>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-400">
                    {new Date(c.enrolled_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
