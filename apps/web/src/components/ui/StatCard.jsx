// apps/web/src/components/ui/StatCard.jsx

export function StatCard({
  icon,
  label,
  value,
  subtitle,
  variant = "blue",
  className = "",
}) {
  const variantStyles = {
    blue: {
      iconBg: "bg-[#e8f0fe] text-[#1a73e8]",
      text: "text-[#1a73e8]",
    },
    green: {
      iconBg: "bg-[#e6f4ea] text-[#137333]",
      text: "text-[#137333]",
    },
    amber: {
      iconBg: "bg-[#fef7e0] text-[#b06000]",
      text: "text-[#b06000]",
    },
    gray: {
      iconBg: "bg-[#f1f3f4] text-[#5f6368]",
      text: "text-[#202124]",
    },
  };

  const style = variantStyles[variant] || variantStyles.blue;

  return (
    <div
      className={`bg-white border border-[#dadce0] rounded-xl p-4 sm:p-5 flex items-center gap-4 shadow-xs transition hover:shadow-sm ${className}`}
    >
      {icon && (
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg}`}
        >
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-[#5f6368]">
          {label}
        </p>
        <p className={`text-2xl font-bold mt-0.5 tracking-tight ${style.text}`}>
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-[#70757a] mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
