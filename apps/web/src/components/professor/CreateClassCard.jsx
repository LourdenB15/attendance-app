// apps/web/src/components/professor/CreateClassCard.jsx
import { useState } from "react";
import { classesApi } from "../../api";
import { useToast } from "../../context/ToastContext";

export function CreateClassCard({ onCreated }) {
  const [name, setName] = useState("");
  const [semester, setSemester] = useState("");
  const [section, setSection] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const created = await classesApi.createClass({ name, semester, section });
      showToast("success", `Class "${created.name}" created! Join Code: ${created.join_code}`);
      setName("");
      setSemester("");
      setSection("");
      if (onCreated) onCreated();
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="text-sm font-bold text-slate-900 mb-3">Create New Class</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Class Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. CS101 Intro to Algorithms"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Semester
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Fall 2026"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Section
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Sec-A"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm shadow-xs transition"
          >
            {loading ? "Creating..." : "Create Class"}
          </button>
        </div>
      </form>
    </div>
  );
}
