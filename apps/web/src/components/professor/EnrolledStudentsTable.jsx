// apps/web/src/components/professor/EnrolledStudentsTable.jsx
import { useState } from "react";
import { Badge } from "../ui/Badge";
import { classesApi } from "../../api";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/useConfirm";

export function EnrolledStudentsTable({ classId, joinCode, students, onStudentDropped }) {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [listTab, setListTab] = useState("active"); // "active" | "dropped"

  const activeStudents = students.filter((s) => s.status === "ACTIVE");
  const droppedStudents = students.filter((s) => s.status === "DROPPED");
  const visibleStudents = listTab === "dropped" ? droppedStudents : activeStudents;

  const handleDrop = async (student) => {
    const confirmed = await confirm({
      title: "Drop this student?",
      message: `${student.full_name} will be removed from this class and can't rejoin with the join code. You can restore them later.`,
      confirmLabel: "Drop student",
      danger: true,
    });
    if (!confirmed) return;
    try {
      await classesApi.dropStudent(classId, student.student_id);
      showToast("success", "Student dropped from class.");
      if (onStudentDropped) onStudentDropped();
    } catch (err) {
      showToast("error", err.message);
    }
  };

  const handleRestore = async (student) => {
    try {
      await classesApi.restoreStudent(classId, student.student_id);
      showToast("success", `${student.full_name} restored to the class.`);
      if (onStudentDropped) onStudentDropped(); // reloads the roster
    } catch (err) {
      showToast("error", err.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <h4 className="font-bold text-slate-800 text-sm">Students</h4>
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {[
            { id: "active", label: `Active (${activeStudents.length})` },
            { id: "dropped", label: `Dropped (${droppedStudents.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setListTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition ${
                listTab === tab.id
                  ? "bg-white text-indigo-600 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
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
            {visibleStudents.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-5 py-8 text-center text-slate-400">
                  {listTab === "dropped" ? (
                    "No dropped students."
                  ) : (
                    <>
                      No students currently enrolled. Share join code <strong>{joinCode}</strong>.
                    </>
                  )}
                </td>
              </tr>
            ) : (
              visibleStudents.map((s) => (
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
                    {s.status === "ACTIVE" ? (
                      <button
                        type="button"
                        onClick={() => handleDrop(s)}
                        className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-md font-medium transition"
                      >
                        Drop Student
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRestore(s)}
                        className="px-2.5 py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded-md font-medium transition"
                      >
                        Restore
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
