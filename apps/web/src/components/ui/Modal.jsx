// apps/web/src/components/ui/Modal.jsx
import { useEffect } from "react";
import { IconClose } from "./Icons";

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-md",
  className = "",
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#202124]/50 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`bg-white w-full ${maxWidth} rounded-2xl shadow-xl border border-[#dadce0] overflow-hidden flex flex-col max-h-[90vh] transition-all transform animate-in zoom-in-95 duration-150 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e8eaed] flex items-center justify-between">
          <div>
            <h3 id="modal-title" className="text-base font-semibold text-[#202124]">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-[#5f6368] mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124] transition-colors"
            aria-label="Close dialog"
          >
            <IconClose className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
