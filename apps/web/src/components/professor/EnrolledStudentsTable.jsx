// apps/web/src/components/professor/EnrolledStudentsTable.jsx
import { Badge } from "../ui/Badge";
import { classesApi } from "../../api";
import { useToast } from "../../context/ToastContext";

export function EnrolledStudentsTable({ classId, joinCode, students, onStudentDropped }) {
  const { showToast } = useToast();

  const handleDrop = async (studentId) => {
    if (!window.confirm("Are you sure you want to drop this student from the class?")) return;
    try {
      await classesApi.dropStudent(classId, studentId);
      showToast("success", "Student dropped from class.");
      if (onStudentDropped) onStudentDropped();
    } catch (err) {
      showToast("error", err.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h4 className="font-bold text-slate-800 text-sm">Enrolled Students ({students.length})</h4>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] tracking-wider border-b border-slate-200 font-bold">
            <tr>
              <th className="px-5 py-3">Student Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Enrolled Via</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Enrolled Date</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-5 py-8 text-center text-slate-400">
                  No students currently enrolled. Share join code <strong>{joinCode}</strong>.
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s.student_id} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-3 font-semibold text-slate-800">{s.full_name}</td>
                  <td className="px-5 py-3 text-xs text-slate-600 font-mono">{s.email}</td>
                  <td className="px-5 py-3 text-xs text-slate-500">{s.enrolled_via}</td>
                  <td className="px-5 py-3">
                    <Badge variant={s.status === "ACTIVE" ? "success" : "default"} size="xs">
                      {s.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-400">
                    {new Date(s.enrolled_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {s.status === "ACTIVE" && (
                      <button
                        type="button"
                        onClick={() => handleDrop(s.student_id)}
                        className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-md font-medium transition"
                      >
                        Drop Student
                      </button>
                    )}
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
