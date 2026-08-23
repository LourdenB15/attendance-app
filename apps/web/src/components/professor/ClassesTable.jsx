// apps/web/src/components/professor/ClassesTable.jsx
import { useState } from "react";
import { Badge } from "../ui/Badge";
import { classesApi } from "../../api";
import { useToast } from "../../context/ToastContext";

export function ClassesTable({ classes, onSelectClass, onRefresh }) {
  const [editingClass, setEditingClass] = useState(null);
  const [editName, setEditName] = useState("");
  const [editSemester, setEditSemester] = useState("");
  const [editSection, setEditSection] = useState("");
  const { showToast } = useToast();

  const startEdit = (cls) => {
    setEditingClass(cls);
    setEditName(cls.name);
    setEditSemester(cls.semester);
    setEditSection(cls.section);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingClass) return;
    try {
      await classesApi.updateClass(editingClass.id, {
        name: editName,
        semester: editSemester,
        section: editSection,
      });
      showToast("success", "Class updated successfully.");
      setEditingClass(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast("error", err.message);
    }
  };

  const handleArchive = async (classId) => {
    if (!window.confirm("Are you sure you want to archive this class?")) return;
    try {
      await classesApi.archiveClass(classId);
      showToast("success", "Class archived successfully.");
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast("error", err.message);
    }
  };

  return (
    <div className="space-y-4">
      {editingClass && (
        <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 shadow-sm">
          <h3 className="text-sm font-bold text-amber-900 mb-3">Edit Class: {editingClass.name}</h3>
          <form onSubmit={handleUpdate} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-amber-800 mb-1">Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-amber-800 mb-1">Semester</label>
              <input
                type="text"
                value={editSemester}
                onChange={(e) => setEditSemester(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-amber-800 mb-1">Section</label>
              <input
                type="text"
                value={editSection}
                onChange={(e) => setEditSection(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-sm transition"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditingClass(null)}
                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Your Classes ({classes.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] tracking-wider border-b border-slate-200 font-bold">
              <tr>
                <th className="px-5 py-3">Class Name</th>
                <th className="px-5 py-3">Semester</th>
                <th className="px-5 py-3">Section</th>
                <th className="px-5 py-3">Join Code</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-400">
                    No classes created yet. Use the form above to add your first class.
                  </td>
                </tr>
              ) : (
                classes.map((cls) => (
                  <tr key={cls.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3 font-semibold text-slate-900">{cls.name}</td>
                    <td className="px-5 py-3 text-slate-600">{cls.semester}</td>
                    <td className="px-5 py-3 text-slate-600">{cls.section}</td>
                    <td className="px-5 py-3">
                      <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-bold rounded-lg text-xs">
                        {cls.join_code}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {cls.is_archived ? (
                        <Badge variant="default" size="xs">Archived</Badge>
                      ) : (
                        <Badge variant="success" size="xs">Active</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => onSelectClass(cls)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition"
                      >
                        Manage
                      </button>
                      {!cls.is_archived && (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(cls)}
                            className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-medium transition"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleArchive(cls.id)}
                            className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-medium transition"
                          >
                            Archive
                          </button>
                        </>
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
