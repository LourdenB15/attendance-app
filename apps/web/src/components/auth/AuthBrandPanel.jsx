// apps/web/src/components/auth/AuthBrandPanel.jsx
import { AppLogo } from "../ui/AppLogo";
import { IconCheck, IconShieldCheck, IconClock, IconUsers } from "../ui/Icons";

export function AuthBrandPanel() {
  return (
    <div className="relative flex flex-col justify-between h-full p-8 lg:p-12 select-none">
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3">
          <AppLogo className="w-9 h-9 rounded-lg" />
          <div>
            <span className="text-base font-bold text-[#202124] tracking-tight block">
              Attendance Live
            </span>
            <span className="text-xs text-[#5f6368] font-medium block">
              Smart Classroom Attendance
            </span>
          </div>
        </div>

        {/* Minimalist headline */}
        <div className="mt-8 space-y-2 max-w-sm">
          <h1 className="text-2xl lg:text-3xl font-bold text-[#202124] tracking-tight leading-snug">
            Classroom attendance, verified in seconds.
          </h1>
          <p className="text-xs text-[#5f6368] leading-relaxed">
            Fast, effortless biometric attendance verification designed for modern lecture halls and classrooms.
          </p>
        </div>
      </div>

      {/* Google Classroom-style Preview Card */}
      <div className="my-8 max-w-sm">
        <div className="bg-white rounded-lg shadow-xs overflow-hidden border border-[#dadce0]/60">
          {/* Course Banner */}
          <div className="bg-linear-to-r from-[#1a73e8] to-[#1557b0] p-4 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-100 bg-white/15 px-2 py-0.5 rounded-md inline-block mb-1">
                  CS 204 • Section A
                </span>
                <h3 className="font-bold text-sm text-white tracking-tight">
                  Data Structures & Algorithms
                </h3>
                <p className="text-[11px] text-blue-100 mt-0.5">
                  Prof. Richardson • Rm 402
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34a853] animate-pulse" />
                <span>Live</span>
              </div>
            </div>
          </div>

          {/* Stats & Check-in Row */}
          <div className="p-3.5 space-y-2.5 bg-white">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-[#5f6368]">
                <IconUsers className="w-3.5 h-3.5 text-[#1a73e8]" />
                <span className="font-medium">Turnout</span>
              </div>
              <span className="font-bold text-[#202124]">38 / 40 Present</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-md bg-[#e6f4ea] text-[#137333] text-xs">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#137333] text-white flex items-center justify-center shrink-0">
                  <IconCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-[11px] block">Biometric verified</span>
                  <span className="text-[10px] text-[#0d652d] block">Anti-spoofing passed</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#0d652d] uppercase tracking-wider">
                95% Rate
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Features */}
      <div className="flex items-center gap-4 text-xs text-[#5f6368]">
        <div className="flex items-center gap-1.5">
          <IconShieldCheck className="w-3.5 h-3.5 text-[#137333]" />
          <span>Liveness verified</span>
        </div>
        <span className="text-[#dadce0]">•</span>
        <div className="flex items-center gap-1.5">
          <IconClock className="w-3.5 h-3.5 text-[#1a73e8]" />
          <span>Real-time sync</span>
        </div>
      </div>
    </div>
  );
}
