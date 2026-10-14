// apps/web/src/components/ui/ProgressBar.jsx

/**
 * Google Workspace / Classroom Material Indeterminate Linear Progress Bar
 * Pinned to the top of headers, tables, or cards during refresh operations.
 */
export function GoogleProgressBar({ className = "", height = "h-1" }) {
  return (
    <div
      className={`w-full ${height} bg-[#e8f0fe] overflow-hidden relative ${className}`}
      role="progressbar"
      aria-label="Loading in progress"
    >
      <div className="absolute top-0 bottom-0 bg-[#1a73e8] rounded-full animate-google-progress-1" />
      <div className="absolute top-0 bottom-0 bg-[#1a73e8] rounded-full animate-google-progress-2" />
    </div>
  );
}

/**
 * Authentic Google Material Circular Progress Loader
 * Features continuous smooth rotation with a morphing stroke dash arc.
 */
export function MaterialSpinner({ size = "md", className = "", color = "text-[#1a73e8]" }) {
  const dimensions =
    {
      xs: "w-3.5 h-3.5",
      sm: "w-5 h-5",
      md: "w-8 h-8",
      lg: "w-10 h-10",
      xl: "w-12 h-12",
    }[size] || "w-8 h-8";

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${dimensions} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <svg className={`animate-spin ${color} w-full h-full`} viewBox="0 0 48 48">
        <circle
          className="animate-material-dash"
          cx="24"
          cy="24"
          r="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
