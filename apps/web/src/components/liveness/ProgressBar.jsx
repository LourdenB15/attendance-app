// src/components/ProgressBar.jsx
const Arrow = ({ direction }) => (
  <div
    className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white`}
  >
    {direction === "left" ? (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M15 19l-7-7 7-7"
        ></path>
      </svg>
    ) : (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 5l7 7-7 7"
        ></path>
      </svg>
    )}
  </div>
);

export function ProgressBar({ progress, direction }) {
  const clampedProgress = Math.max(0, Math.min(progress, 1));

  return (
    <div className="flex w-full items-center gap-4 rounded-xl border border-white/10 bg-black/40 p-3 shadow-lg backdrop-blur-md">
      <div
        className={`${direction === "right" ? "opacity-30" : "animate-pulse text-blue-400 opacity-100"}`}
      >
        <Arrow direction="left" />
      </div>

      <div className="h-3 grow overflow-hidden rounded-full bg-white/20">
        <div
          className="h-full bg-linear-to-r from-blue-500 to-indigo-500 transition-all duration-100 ease-out"
          style={{ width: `${clampedProgress * 100}%` }}
        />
      </div>

      <div
        className={`${direction === "left" ? "opacity-30" : "animate-pulse text-blue-400 opacity-100"}`}
      >
        <Arrow direction="right" />
      </div>
    </div>
  );
}
