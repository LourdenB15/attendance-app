// apps/web/src/components/ui/LoadingOverlay.jsx
import { MaterialSpinner } from "./ProgressBar";

// Full-screen spinner shown while a check-in is being verified and saved
export function LoadingOverlay({ message = "Verifying your identity..." }) {
  return (
    <div className="fixed inset-0 z-50 bg-[#202124]/40 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity animate-in fade-in duration-150">
      <div
        role="status"
        aria-live="polite"
        className="bg-white rounded-2xl shadow-xl border border-[#dadce0] px-8 py-6 flex flex-col items-center gap-3.5 max-w-sm text-center animate-in zoom-in-95 duration-150"
      >
        <MaterialSpinner size="lg" />
        <div>
          <p className="text-sm font-semibold text-[#202124]">{message}</p>
          <p className="text-xs text-[#5f6368] mt-0.5">Please keep this window open</p>
        </div>
      </div>
    </div>
  );
}
