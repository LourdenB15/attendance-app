// apps/web/src/context/ConfirmContextProvider.jsx
import { useState, useCallback, useRef, useEffect } from "react";
import { ConfirmContext } from "./ConfirmContext";

// Styled replacement for window.confirm(). confirm(options) resolves true when the
// user confirms, false when they cancel, press Escape, or click outside the dialog.
export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null); // { title, message, confirmLabel, danger }
  const resolveRef = useRef(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setDialog(options);
    });
  }, []);

  const close = useCallback((result) => {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setDialog(null);
  }, []);

  useEffect(() => {
    if (!dialog) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") close(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [dialog, close]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {dialog && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => close(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="confirm-dialog-title" className="text-base font-bold text-slate-900">
              {dialog.title}
            </h3>
            {dialog.message && <p className="text-sm text-slate-600 mt-2">{dialog.message}</p>}
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                autoFocus
                onClick={() => close(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => close(true)}
                className={`px-4 py-2 text-white text-sm font-semibold rounded-xl transition ${
                  dialog.danger ? "bg-rose-600 hover:bg-rose-700" : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {dialog.confirmLabel || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
