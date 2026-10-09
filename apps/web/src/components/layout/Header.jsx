// apps/web/src/components/layout/Header.jsx
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../ui/Badge";
import { AppLogo } from "../ui/AppLogo";
import {
  IconMenu,
  IconLogOut,
  IconSettings,
  IconChevronDown,
} from "../ui/Icons";

export function Header({ onToggleSidebar, onOpenSettings }) {
  const { currentUser, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!currentUser) return null;

  const roleBadgeVariant =
    currentUser.role === "ADMIN"
      ? "purple"
      : currentUser.role === "PROFESSOR"
      ? "primary"
      : "success";

  const userInitial = currentUser.full_name
    ? currentUser.full_name[0].toUpperCase()
    : "U";

  return (
    <header className="bg-white border-b border-[#dadce0] sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Sidebar Toggle & Brand */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124] transition-colors"
            title="Main menu"
            aria-label="Toggle navigation menu"
          >
            <IconMenu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <AppLogo className="w-9 h-9" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-[#202124] tracking-tight leading-none">
                  Attendance Live
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]">
                  Classroom
                </span>
              </div>
              <span className="text-[11px] text-[#5f6368] font-normal leading-tight hidden xs:block mt-0.5">
                Biometric Liveness Verification
              </span>
            </div>
          </div>
        </div>

        {/* Right: User Profile & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-[#f1f3f4] border border-transparent hover:border-[#dadce0] transition-all"
              aria-expanded={profileOpen}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                {userInitial}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-semibold text-[#202124] leading-tight truncate max-w-[140px]">
                  {currentUser.full_name}
                </div>
                <div className="text-[10px] text-[#5f6368] leading-tight truncate max-w-[140px]">
                  {currentUser.email}
                </div>
              </div>
              <IconChevronDown className="w-3.5 h-3.5 text-[#5f6368] hidden sm:block" />
            </button>

            {/* Profile Dropdown Menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#dadce0] p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center gap-3 pb-3 border-b border-[#e8eaed]">
                  <div className="w-12 h-12 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                    {userInitial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#202124] truncate">
                      {currentUser.full_name}
                    </p>
                    <p className="text-xs text-[#5f6368] font-mono truncate">
                      {currentUser.email}
                    </p>
                    <div className="mt-1">
                      <Badge variant={roleBadgeVariant} size="xs">
                        {currentUser.role}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="py-2 space-y-1">
                  {onOpenSettings && (
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        onOpenSettings();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#3c4043] hover:bg-[#f1f3f4] transition-colors"
                    >
                      <IconSettings className="w-4 h-4 text-[#5f6368]" />
                      <span>Account Settings & Password</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#c5221f] hover:bg-[#fce8e6] transition-colors"
                  >
                    <IconLogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Sign Out Button (desktop) */}
          <button
            type="button"
            onClick={logout}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-[#fce8e6] hover:text-[#c5221f] hover:border-[#fad2cf] text-[#3c4043] text-xs font-semibold rounded-lg border border-[#dadce0] transition shadow-2xs"
            title="Sign out of account"
          >
            <IconLogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
