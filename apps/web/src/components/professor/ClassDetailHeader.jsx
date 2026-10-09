// apps/web/src/components/professor/ClassDetailHeader.jsx
import { useState } from "react";
import { getClassTheme } from "../ui/classroomThemes";
import { IconChevronLeft, IconCopy, IconCheck } from "../ui/Icons";
import { useToast } from "../../context/useToast";

export function ClassDetailHeader({ selectedClass, onBack }) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  if (!selectedClass) return null;

  const theme = getClassTheme(selectedClass.id || selectedClass.name);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedClass.join_code);
    setCopied(true);
    showToast("info", `Class join code "${selectedClass.join_code}" copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`${theme.bannerBg} rounded-2xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden`}
    >
      {/* Subtle decorative circles */}
      <div className="absolute -right-8 -bottom-12 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute right-32 -top-10 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-black/15 hover:bg-black/25 text-white backdrop-blur-xs transition mb-3"
          >
            <IconChevronLeft className="w-3.5 h-3.5" />
            <span>All Classes</span>
          </button>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
            {selectedClass.name}
          </h2>
          <p className={`text-sm ${theme.subText} font-medium mt-1`}>
            {selectedClass.section} • {selectedClass.semester}
          </p>
        </div>

        {/* Join Code Display Tile */}
        <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-4 self-start md:self-auto min-w-[200px]">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-white/80 mb-1">
            Student Class Code
          </span>
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-xl sm:text-2xl font-black tracking-widest text-white select-all">
              {selectedClass.join_code}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition shadow-2xs"
              title="Copy class code"
              aria-label="Copy class code"
            >
              {copied ? (
                <IconCheck className="w-4 h-4 text-emerald-200" />
              ) : (
                <IconCopy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
