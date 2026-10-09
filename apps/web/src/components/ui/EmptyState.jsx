// apps/web/src/components/ui/EmptyState.jsx

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl bg-white border border-[#dadce0] ${className}`}
    >
      {icon && (
        <div className="w-14 h-14 rounded-full bg-[#f1f3f4] text-[#5f6368] flex items-center justify-center mb-3">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-[#202124]">{title}</h3>
      {description && (
        <p className="text-xs sm:text-sm text-[#5f6368] mt-1 max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
