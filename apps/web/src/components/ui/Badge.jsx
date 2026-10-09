// apps/web/src/components/ui/Badge.jsx

export function Badge({
  children,
  variant = "default",
  size = "sm",
  dot = false,
  className = "",
}) {
  const variantStyles = {
    default: "bg-[#f1f3f4] text-[#3c4043] border-[#dadce0]",
    primary: "bg-[#e8f0fe] text-[#1a73e8] border-[#d2e3fc]",
    success: "bg-[#e6f4ea] text-[#137333] border-[#ceead6]",
    danger: "bg-[#fce8e6] text-[#c5221f] border-[#fad2cf]",
    warning: "bg-[#fef7e0] text-[#b06000] border-[#feefc3]",
    purple: "bg-[#f3e8fd] text-[#7627bb] border-[#e9d2fd]",
    sky: "bg-[#e8f0fe] text-[#1967d2] border-[#c2e7ff]",
  };

  const dotStyles = {
    default: "bg-[#5f6368]",
    primary: "bg-[#1a73e8]",
    success: "bg-[#137333]",
    danger: "bg-[#d93025]",
    warning: "bg-[#f9ab00]",
    purple: "bg-[#9334e9]",
    sky: "bg-[#1a73e8]",
  };

  const sizeStyles = {
    xs: "text-[10px] px-2 py-0.5 font-bold tracking-wider",
    sm: "text-xs px-2.5 py-0.5 font-semibold",
    md: "text-sm px-3 py-1 font-semibold",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-colors ${
        variantStyles[variant] || variantStyles.default
      } ${sizeStyles[size] || sizeStyles.sm} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant] || dotStyles.default}`}
        />
      )}
      {children}
    </span>
  );
}
