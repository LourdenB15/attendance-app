// apps/web/src/components/ui/AppLogo.jsx
export function AppLogo({ className = "w-9 h-9" }) {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xs"
      >
        <defs>
          <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a73e8" />
            <stop offset="100%" stopColor="#1557b0" />
          </linearGradient>
          <linearGradient id="logoCheckGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34a853" />
            <stop offset="100%" stopColor="#137333" />
          </linearGradient>
        </defs>

        {/* Squircle base */}
        <rect width="64" height="64" rx="16" fill="url(#logoBgGrad)" />

        {/* Biometric Viewfinder Corners */}
        <path
          d="M16 23V18C16 16.8954 16.8954 16 18 16H23"
          stroke="#ffffff"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M48 23V18C48 16.8954 47.1046 16 46 16H41"
          stroke="#ffffff"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M16 41V46C16 47.1046 16.8954 48 18 48H23"
          stroke="#ffffff"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Biometric Center Silhouette */}
        <circle cx="32" cy="27" r="7" stroke="#ffffff" strokeWidth="2.6" fill="none" opacity="0.95" />
        <path
          d="M21 42C21.5 37 26 35 32 35C35 35 37.8 35.8 39.8 37.5"
          stroke="#ffffff"
          strokeWidth="2.6"
          strokeLinecap="round"
          fill="none"
          opacity="0.95"
        />

        {/* Verified Attendance Live Beacon (Bottom Right) */}
        <circle cx="45" cy="45" r="9.5" fill="#ffffff" />
        <circle cx="45" cy="45" r="8" fill="url(#logoCheckGrad)" />
        <path
          d="M41.5 45L43.8 47.3L48.5 42.5"
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
