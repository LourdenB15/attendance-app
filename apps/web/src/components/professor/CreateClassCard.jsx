// apps/web/src/components/professor/CreateClassCard.jsx
import { useState } from "react";
import { classesApi } from "../../api";
import { useToast } from "../../context/ToastContext";
import { IconPlus, IconClassroom } from "../ui/Icons";

export function CreateClassCard({ onCreated }) {
  const [isOpen, setIsOpen] = useState(false);
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
      showToast(
        "success",
        `Class "${created.name}" created! Join Code: ${created.join_code}`,
      );
      setName("");
      setSemester("");
      setSection("");
      setIsOpen(false);
      if (onCreated) onCreated();
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="bg-white border border-[#dadce0] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
            <IconClassroom className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#202124]">Create a New Class</h3>
            <p className="text-xs text-[#5f6368] mt-0.5">
              Set up a course section with an automatic unique student join code.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded-lg shadow-xs transition"
        >
          <IconPlus className="w-4 h-4" />
          <span>New Class</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-[#dadce0] animate-in fade-in duration-150">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#e8eaed]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center">
            <IconPlus className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-[#202124]">Create New Class</h3>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-xs font-medium text-[#5f6368] hover:text-[#202124] transition-colors"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-1.5">
            Class Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. CS101 Intro to Algorithms"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-[#dadce0] rounded-lg text-sm text-[#202124] placeholder-[#80868b] focus:border-[#1a73e8] focus:outline-none focus:ring-3 focus:ring-[#e8f0fe] transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-1.5">
            Semester / Term
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Fall 2026"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-[#dadce0] rounded-lg text-sm text-[#202124] placeholder-[#80868b] focus:border-[#1a73e8] focus:outline-none focus:ring-3 focus:ring-[#e8f0fe] transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-1.5">
            Section
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Section 1A"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-[#dadce0] rounded-lg text-sm text-[#202124] placeholder-[#80868b] focus:border-[#1a73e8] focus:outline-none focus:ring-3 focus:ring-[#e8f0fe] transition-all"
          />
        </div>
        <div className="sm:col-span-3 flex justify-end items-center gap-2.5 pt-2 border-t border-[#e8eaed]">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-[#5f6368] hover:bg-[#f1f3f4] rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white font-semibold rounded-lg text-xs shadow-xs transition"
          >
            {loading ? "Creating..." : "Create Class"}
          </button>
        </div>
      </form>
    </div>
  );
}
