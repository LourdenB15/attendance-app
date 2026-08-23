// apps/web/src/components/ui/Badge.jsx
export function Badge({ children, variant = "default", size = "sm" }) {
  const variantStyles = {
    default: "bg-slate-100 text-slate-700",
    primary: "bg-indigo-100 text-indigo-700",
    success: "bg-emerald-100 text-emerald-800",
    danger: "bg-rose-100 text-rose-800",
    warning: "bg-amber-100 text-amber-800",
    purple: "bg-purple-100 text-purple-700",
    sky: "bg-sky-100 text-sky-700",
  };

  const sizeStyles = {
    xs: "text-[10px] px-2 py-0.5",
    sm: "text-xs px-2.5 py-0.5",
    md: "text-sm px-3 py-1",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-extrabold uppercase tracking-wider rounded-full ${
        variantStyles[variant] || variantStyles.default
      } ${sizeStyles[size] || sizeStyles.sm}`}
    >
      {children}
    </span>
  );
}
