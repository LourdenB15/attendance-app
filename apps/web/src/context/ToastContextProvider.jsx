// apps/web/src/context/ToastContextProvider.jsx
import { useState, useCallback, useRef, useMemo } from "react";
import { ToastContext } from "./ToastContext";
import { IconCheck, IconAlert, IconClose } from "../components/ui/Icons";

const FADE_MS = 300;
const AUTO_HIDE_MS = 4000;
const MAX_TOASTS = 4; // oldest toasts drop off beyond this

export function ToastProvider({ children }) {
  // Each toast: { id, type, text, visible }. New toasts stack below older ones.
  const [toasts, setToasts] = useState([]);
  const nextIdRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, visible: false } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, FADE_MS);
  }, []);

  const clearToast = useCallback(() => {
    setToasts((prev) => prev.map((t) => ({ ...t, visible: false })));
    setTimeout(() => setToasts([]), FADE_MS);
  }, []);

  const showToast = useCallback(
    (type, text) => {
      const id = nextIdRef.current++;
      setToasts((prev) => [...prev, { id, type, text, visible: false }].slice(-MAX_TOASTS));
      // Two frames so the toast renders hidden first, then fades in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, visible: true } : t)));
        });
      });
      setTimeout(() => dismiss(id), AUTO_HIDE_MS);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toasts, showToast, clearToast }), [toasts, showToast, clearToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 flex flex-col gap-2.5 pointer-events-none">
          {toasts.map((toast) => {
            const isError = toast.type === "error";
            const isSuccess = toast.type === "success";

            return (
              <div
                key={toast.id}
                className={`pointer-events-auto px-4 py-3 rounded-xl border shadow-lg flex items-center justify-between gap-3 text-sm transition-all duration-300 transform ${
                  toast.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                } ${
                  isError
                    ? "bg-[#fce8e6] border-[#fad2cf] text-[#c5221f]"
                    : isSuccess
                    ? "bg-[#e6f4ea] border-[#ceead6] text-[#137333]"
                    : "bg-[#e8f0fe] border-[#d2e3fc] text-[#1a73e8]"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="shrink-0">
                    {isSuccess && <IconCheck className="w-4 h-4 text-[#137333]" />}
                    {isError && <IconAlert className="w-4 h-4 text-[#c5221f]" />}
                    {!isSuccess && !isError && <IconAlert className="w-4 h-4 text-[#1a73e8]" />}
                  </span>
                  <div className="whitespace-pre-line font-medium text-xs sm:text-sm leading-snug">
                    {toast.text}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  className="w-6 h-6 rounded-full flex items-center justify-center opacity-70 hover:opacity-100 hover:bg-black/5 transition shrink-0 ml-1"
                  aria-label="Dismiss notification"
                >
                  <IconClose className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </ToastContext.Provider>
  );
}
