// apps/web/src/components/liveness/ProgressBar.jsx
import { IconChevronLeft, IconChevronRight } from "../ui/Icons";

export function ProgressBar({ progress = 0, direction = "left" }) {
  const clampedProgress = Math.max(0, Math.min(progress, 1));
  const isLeft = direction === "left";

  return (
    <div className="flex w-full items-center gap-3.5 rounded-2xl border border-white/20 bg-[#202124]/80 p-3 shadow-xl backdrop-blur-md text-white">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          isLeft
            ? "bg-[#1a73e8] text-white animate-pulse shadow-xs"
            : "bg-white/10 text-white/40"
        }`}
      >
        <IconChevronLeft className="w-5 h-5" />
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between text-[11px] font-semibold tracking-wide uppercase mb-1.5 px-0.5">
          <span>{isLeft ? "Slowly turn head left" : "Slowly turn head right"}</span>
          <span>{Math.round(clampedProgress * 100)}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full bg-[#1a73e8] rounded-full transition-all duration-150 ease-out"
            style={{ width: `${clampedProgress * 100}%` }}
          />
        </div>
      </div>

      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          !isLeft
            ? "bg-[#1a73e8] text-white animate-pulse shadow-xs"
            : "bg-white/10 text-white/40"
        }`}
      >
        <IconChevronRight className="w-5 h-5" />
      </div>
    </div>
  );
}
