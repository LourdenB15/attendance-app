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
          className="fixed inset-0 z-50 bg-[#202124]/50 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity animate-in fade-in duration-150"
          onClick={() => close(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-[#dadce0] p-6 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="confirm-dialog-title" className="text-base font-semibold text-[#202124]">
              {dialog.title}
            </h3>
            {dialog.message && (
              <p className="text-sm text-[#5f6368] mt-2 leading-relaxed">
                {dialog.message}
              </p>
            )}
            <div className="flex justify-end items-center gap-2 mt-6">
              <button
                type="button"
                autoFocus
                onClick={() => close(false)}
                className="px-4 py-2 text-sm font-medium text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => close(true)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition shadow-xs ${
                  dialog.danger
                    ? "bg-[#d93025] hover:bg-[#b3261e] text-white"
                    : "bg-[#1a73e8] hover:bg-[#1557b0] text-white"
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
