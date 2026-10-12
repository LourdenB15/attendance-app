// apps/web/src/components/professor/CreateClassCard.jsx
import { useState } from "react";
import { classesApi } from "../../api";
import { useToast } from "../../context/useToast";
import { IconClassroom } from "../ui/Icons";
import { formatClassDisplayName } from "../../utils/classFormatting";

export function CreateClassCard({ onCreated, onCancel, isModal = false }) {
  const [name, setName] = useState("");
  const [semester, setSemester] = useState("");
  const [section, setSection] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !semester.trim() || !section.trim()) return;
    setLoading(true);
    try {
      const created = await classesApi.createClass({
        name: name.trim(),
        semester: semester.trim(),
        section: section.trim().toUpperCase(),
      });
      showToast(
        "success",
        `Class "${formatClassDisplayName(created.name, created.section)}" created! Join Code: ${created.join_code}`,
      );
      setName("");
      setSemester("");
      setSection("");
      if (onCreated) onCreated(created);
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={
        isModal
          ? "space-y-4"
          : "bg-white p-5 sm:p-8 rounded-2xl shadow-xs border border-[#dadce0] max-w-lg"
      }
    >
      {!isModal && (
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
            <IconClassroom className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#202124]">
              Create a New Class
            </h3>
            <p className="text-xs text-[#5f6368] mt-0.5">
              Set up a course section with an automatic unique student join code.
            </p>
          </div>
        </div>
      )}

      {isModal && (
        <p className="text-xs text-[#5f6368] mb-3">
          Enter course details to set up your class. A unique student join code will be generated automatically.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-1.5">
            Class / Course Name
          </label>
          <input
            type="text"
            required
            autoFocus={isModal}
            placeholder="e.g. CS101 Intro to Algorithms or Science 10"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-[#dadce0] rounded-lg text-sm text-[#202124] placeholder-[#80868b] focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#e8f0fe] transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-1.5">
              Semester / Term
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 1st Sem 2026 or SY 2026-2027"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#dadce0] rounded-lg text-sm text-[#202124] placeholder-[#80868b] focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#e8f0fe] transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-1.5">
              Section / Year & Block
            </label>
            <input
              type="text"
              required
              placeholder="e.g. BSCS-3A, 10-Emerald, or 1A"
              value={section}
              onChange={(e) => setSection(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2.5 bg-white border border-[#dadce0] rounded-lg text-sm text-[#202124] placeholder-[#80868b] uppercase focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#e8f0fe] transition-all"
            />
            <p className="text-[11px] text-[#5f6368] mt-1">
              Supports college blocks (e.g. BSCS-3A) and high school sections (e.g. 10-Emerald).
            </p>
          </div>
        </div>

        {name.trim() && (
          <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-lg p-2.5 flex items-center justify-between text-xs animate-in fade-in duration-150">
            <span className="text-[#5f6368] font-medium">Display Title:</span>
            <span className="font-bold text-[#1a73e8] tracking-tight">
              {formatClassDisplayName(name, section)}
            </span>
          </div>
        )}

        <div className={`flex items-center ${isModal ? "justify-end gap-2.5 pt-2 border-t border-[#e8eaed]" : "gap-3"}`}>
          {isModal && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 text-xs font-semibold text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124] rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim() || !semester.trim() || !section.trim()}
            className={`${
              isModal ? "px-5" : "w-full"
            } py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs text-xs sm:text-sm transition cursor-pointer`}
          >
            {loading ? "Creating class..." : "Create Class"}
          </button>
        </div>
      </form>
    </div>
  );
}

