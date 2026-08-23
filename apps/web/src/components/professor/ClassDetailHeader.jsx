// apps/web/src/components/professor/ClassDetailHeader.jsx
export function ClassDetailHeader({ selectedClass, onBack }) {
  if (!selectedClass) return null;

  return (
    <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white flex flex-wrap items-center justify-between gap-4 shadow-md">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-indigo-300 hover:text-white font-semibold underline"
          >
            ← Back to All Classes
          </button>
        </div>
        <h3 className="text-xl font-bold">{selectedClass.name}</h3>
        <p className="text-xs text-indigo-200 mt-1">
          Semester: {selectedClass.semester} | Section: {selectedClass.section}
        </p>
      </div>

      <div className="text-right">
        <span className="text-xs uppercase text-indigo-300 font-bold block mb-1">Student Join Code</span>
        <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-xl font-mono text-lg font-black tracking-widest text-indigo-300 border border-white/20">
          {selectedClass.join_code}
        </span>
      </div>
    </div>
  );
}
