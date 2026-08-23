// apps/web/src/context/ToastContextProvider.jsx
import { useState, useCallback } from "react";
import { ToastContext } from "./ToastContext";

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((type, text) => {
    setToast({ type, text });
  }, []);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, showToast, clearToast }}>
      {children}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md animate-bounce-in">
          <div
            className={`p-4 rounded-xl border shadow-lg flex items-start justify-between gap-3 text-sm ${
              toast.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-sky-50 border-sky-200 text-sky-800"
            }`}
          >
            <div>
              <strong className="uppercase text-[10px] tracking-wider block font-bold mb-0.5">
                [{toast.type}]
              </strong>
              {toast.text}
            </div>
            <button
              type="button"
              onClick={clearToast}
              className="text-slate-400 hover:text-slate-600 text-base leading-none font-bold ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
