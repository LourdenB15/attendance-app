// apps/web/src/context/ToastContextProvider.jsx
import { useState, useCallback, useRef } from "react";
import { ToastContext } from "./ToastContext";

const FADE_MS = 300;

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [visible, setVisible] = useState(false);
  const autoHideRef = useRef(null);
  const unmountRef = useRef(null);

  const dismiss = useCallback(() => {
    setVisible(false);
    unmountRef.current = setTimeout(() => setToast(null), FADE_MS);
  }, []);

  const clearToast = useCallback(() => {
    if (autoHideRef.current) clearTimeout(autoHideRef.current);
    dismiss();
  }, [dismiss]);

  const showToast = useCallback(
    (type, text) => {
      if (autoHideRef.current) clearTimeout(autoHideRef.current);
      if (unmountRef.current) clearTimeout(unmountRef.current);
      setToast({ type, text });
      setVisible(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      autoHideRef.current = setTimeout(dismiss, 4000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast, showToast, clearToast }}>
      {children}
      {toast && (
        <div
          className={`fixed bottom-5 left-4 right-4 sm:left-auto sm:right-5 sm:max-w-md z-50 transition-opacity duration-300 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`p-4 rounded-xl border shadow-lg flex items-start justify-between gap-3 text-sm ${
              toast.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-sky-50 border-sky-200 text-sky-800"
            }`}
          >
            <div>{toast.text}</div>
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
