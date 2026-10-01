// apps/web/src/context/ToastContextProvider.jsx
import { useState, useCallback, useRef, useMemo } from "react";
import { ToastContext } from "./ToastContext";

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
        <div className="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-5 sm:max-w-md z-50 flex flex-col gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`p-4 rounded-xl border shadow-lg flex items-start justify-between gap-3 text-sm transition-opacity duration-300 ${
                toast.visible ? "opacity-100" : "opacity-0"
              } ${
                toast.type === "error"
                  ? "bg-rose-50 border-rose-200 text-rose-800"
                  : toast.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-sky-50 border-sky-200 text-sky-800"
              }`}
            >
              <div className="whitespace-pre-line">{toast.text}</div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="text-slate-400 hover:text-slate-600 text-base leading-none font-bold ml-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}
