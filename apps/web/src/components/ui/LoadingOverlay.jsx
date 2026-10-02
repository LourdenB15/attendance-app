// apps/web/src/components/ui/LoadingOverlay.jsx
// Full-screen spinner shown while a check-in is being verified and saved
export function LoadingOverlay({ message }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        role="status"
        aria-live="polite"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 px-8 py-6 flex flex-col items-center gap-3"
      >
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-700">{message}</p>
      </div>
    </div>
  );
}
