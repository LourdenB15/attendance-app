// apps/web/src/components/professor/ClassDetailHeader.jsx
import { useState } from "react";
import { getClassTheme } from "../ui/classroomThemes";
import { IconChevronLeft, IconCopy, IconCheck, IconExpand, IconClassroom } from "../ui/Icons";
import { Modal } from "../ui/Modal";
import { useToast } from "../../context/useToast";

export function ClassDetailHeader({ selectedClass, onBack }) {
  const [copied, setCopied] = useState(false);
  const [showPresentModal, setShowPresentModal] = useState(false);
  const { showToast } = useToast();

  if (!selectedClass) return null;

  const theme = getClassTheme(selectedClass.id || selectedClass.name);

  const handleCopy = () => {
    if (copied || !selectedClass?.join_code) return;
    navigator.clipboard.writeText(selectedClass.join_code);
    setCopied(true);
    showToast("info", `Class join code "${selectedClass.join_code}" copied to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div
        style={{ background: theme.gradient, backgroundColor: theme.accentHex }}
        className={`${theme.bannerBg || theme.headerBg} rounded-2xl p-5 sm:p-7 text-white shadow-md relative overflow-hidden`}
      >
        {/* Subtle decorative elements */}
        <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-15 pointer-events-none">
          <IconClassroom className="w-40 h-40 sm:w-48 sm:h-48" />
        </div>
        <div className="absolute right-36 -top-10 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-5 sm:gap-6">
          <div className="space-y-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-white backdrop-blur-xs transition cursor-pointer"
            >
              <IconChevronLeft className="w-4 h-4" />
              <span>Back to Classes</span>
            </button>

            <div>
              <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                {selectedClass.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-md text-xs font-semibold text-white/95">
                  Section {selectedClass.section}
                </span>
                <span className="bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-md text-xs font-semibold text-white/95">
                  {selectedClass.semester}
                </span>
                {selectedClass.is_archived ? (
                  <span className="bg-black/30 backdrop-blur-xs px-2.5 py-0.5 rounded-md text-xs font-semibold text-white/90">
                    Archived
                  </span>
                ) : (
                  <span className="bg-emerald-500/30 backdrop-blur-xs px-2.5 py-0.5 rounded-md text-xs font-semibold text-emerald-100 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    Active Section
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Join Code Display Tile */}
          <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-4 self-stretch sm:self-start md:self-auto min-w-[240px] shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-white/80">
                Student Class Code
              </span>
              <span className="text-[10px] text-white/70 font-medium">Click to copy</span>
            </div>
            <div className="flex items-center justify-between gap-3 pt-1">
              <span
                onClick={handleCopy}
                className="font-mono text-xl sm:text-2xl font-black tracking-widest text-white select-all cursor-pointer hover:text-white/90"
                title="Click to copy join code"
              >
                {selectedClass.join_code}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={copied}
                  onClick={handleCopy}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition shadow-2xs cursor-pointer disabled:cursor-default"
                  title="Copy class code"
                  aria-label="Copy class code"
                >
                  {copied ? (
                    <IconCheck className="w-4 h-4 text-emerald-200" />
                  ) : (
                    <IconCopy className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPresentModal(true)}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition shadow-2xs cursor-pointer"
                  title="Present / Enlarge code for classroom"
                  aria-label="Present code"
                >
                  <IconExpand className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Classroom Code Projector Modal */}
      <Modal
        isOpen={showPresentModal}
        onClose={() => setShowPresentModal(false)}
        title="Class Join Code"
        subtitle={`${selectedClass.name} • Section ${selectedClass.section}`}
        maxWidth="max-w-lg"
      >
        <div className="text-center py-4 space-y-5">
          <p className="text-xs text-[#5f6368] font-semibold uppercase tracking-wider">
            Display to Students in Class
          </p>

          <div className="bg-[#f8f9fa] border-2 border-dashed border-[#dadce0] rounded-2xl py-6 px-4">
            <span className="font-mono text-4xl sm:text-6xl font-black tracking-widest text-[#1a73e8] select-all block break-all">
              {selectedClass.join_code}
            </span>
          </div>

          <p className="text-xs text-[#5f6368] max-w-sm mx-auto leading-relaxed">
            Instruct your students to open their student dashboard, click <strong>&quot;Join Class&quot;</strong>, and enter this code to join your roster.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              disabled={copied}
              onClick={handleCopy}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer disabled:cursor-default min-h-[40px]"
            >
              {copied ? (
                <>
                  <IconCheck className="w-4 h-4 text-white" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <IconCopy className="w-4 h-4 text-white" />
                  <span>Copy Join Code</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowPresentModal(false)}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#202124] rounded-xl text-xs font-semibold transition cursor-pointer min-h-[40px]"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

