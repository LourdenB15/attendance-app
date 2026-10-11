// apps/web/src/components/layout/Sidebar.jsx
import { useState, useEffect } from "react";
import { studentApi, classesApi } from "../../api";
import { getClassTheme } from "../ui/classroomThemes";
import {
  IconHome,
  IconClassroom,
  IconGraduationCap,
  IconUsers,
  IconClock,
  IconCamera,
  IconPlus,
  IconSettings,
  IconClose,
  IconLogOut,
  IconArchive,
  IconChevronDown,
  IconChevronUp,
} from "../ui/Icons";
import { Badge } from "../ui/Badge";
import { AppLogo } from "../ui/AppLogo";

export function Sidebar({
  isOpen,
  onClose,
  currentUser,
  activeNav,
  onNavSelect,
  onSelectClass,
  onOpenSettings,
  onLogout,
}) {
  const [classesList, setClassesList] = useState([]);
  const [enrolledGroupOpen, setEnrolledGroupOpen] = useState(true);

  const role = currentUser?.role;
  const isBiometricEnrolled = Boolean(currentUser?.has_biometric_enrolled);

  // Load user's classes for the sidebar drawer list (Google Classroom style)
  useEffect(() => {
    let ignore = false;
    async function fetchClasses() {
      try {
        if (role === "STUDENT") {
          const res = await studentApi.getMyClasses();
          if (!ignore) setClassesList(res || []);
        } else if (role === "PROFESSOR") {
          const res = await classesApi.getClasses();
          if (!ignore) setClassesList(res || []);
        }
      } catch {
        // silently fallback
      }
    }
    if (currentUser) {
      fetchClasses();
    }
    return () => {
      ignore = true;
    };
  }, [role, currentUser]);

  if (!currentUser) return null;

  const handleItemClick = (id) => {
    if (onNavSelect) onNavSelect(id);
    if (onClose) onClose();
  };

  const handleClassClick = (cls) => {
    if (onSelectClass) onSelectClass(cls);
    else if (onNavSelect) onNavSelect("classes");
    if (onClose) onClose();
  };

  const isHomeActive = activeNav === "classes" || !activeNav;

  return (
    <>
      {/* =========================================================================
          1. MINI ICON RAIL (Screenshot 1: Default desktop collapsed state)
          ========================================================================= */}
      <aside
        className="hidden lg:flex fixed top-16 bottom-0 left-0 w-[72px] bg-white border-r border-[#dadce0] z-20 flex-col items-center py-3 select-none justify-between"
        aria-label="Sidebar Mini Rail"
      >
        <div className="flex flex-col items-center gap-2 w-full">
          {/* Home Icon */}
          <button
            type="button"
            onClick={() => handleItemClick("classes")}
            className={`w-12 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isHomeActive
                ? "bg-[#c2e7ff] text-[#001d35] font-bold shadow-2xs"
                : "text-[#444746] hover:bg-[#f1f3f4]"
            }`}
            title="Home"
            aria-label="Home"
          >
            <IconHome className="w-5 h-5" />
          </button>

          {/* Student Secondary Icons */}
          {role === "STUDENT" && (
            <>
              <button
                type="button"
                onClick={() => handleItemClick("enroll-face")}
                className={`relative w-12 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  activeNav === "enroll-face"
                    ? "bg-[#c2e7ff] text-[#001d35] font-bold shadow-2xs"
                    : "text-[#444746] hover:bg-[#f1f3f4]"
                }`}
                title="Face Setup"
                aria-label="Face Setup"
              >
                <IconCamera className="w-5 h-5" />
                {!isBiometricEnrolled && (
                  <span className="w-2 h-2 rounded-full bg-[#b06000] absolute top-2 right-3 ring-2 ring-white" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleItemClick("history")}
                className={`w-12 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  activeNav === "history"
                    ? "bg-[#c2e7ff] text-[#001d35] font-bold shadow-2xs"
                    : "text-[#444746] hover:bg-[#f1f3f4]"
                }`}
                title="Attendance History"
                aria-label="Attendance History"
              >
                <IconClock className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Professor Secondary Icons */}
          {role === "PROFESSOR" && (
            <>
              <button
                type="button"
                onClick={() => handleItemClick("classes")}
                className={`w-12 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  activeNav === "classes"
                    ? "bg-[#c2e7ff] text-[#001d35] font-bold shadow-2xs"
                    : "text-[#444746] hover:bg-[#f1f3f4]"
                }`}
                title="Teaching"
                aria-label="Teaching"
              >
                <IconClassroom className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => handleItemClick("create-class")}
                className={`w-12 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  activeNav === "create-class"
                    ? "bg-[#c2e7ff] text-[#001d35] font-bold shadow-2xs"
                    : "text-[#444746] hover:bg-[#f1f3f4]"
                }`}
                title="Create Class"
                aria-label="Create Class"
              >
                <IconPlus className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Admin Secondary Icons */}
          {role === "ADMIN" && (
            <>
              <button
                type="button"
                onClick={() => handleItemClick("users")}
                className={`w-12 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  activeNav === "users"
                    ? "bg-[#c2e7ff] text-[#001d35] font-bold shadow-2xs"
                    : "text-[#444746] hover:bg-[#f1f3f4]"
                }`}
                title="User Directory"
                aria-label="User Directory"
              >
                <IconUsers className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => handleItemClick("create-prof")}
                className={`w-12 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  activeNav === "create-prof"
                    ? "bg-[#c2e7ff] text-[#001d35] font-bold shadow-2xs"
                    : "text-[#444746] hover:bg-[#f1f3f4]"
                }`}
                title="Add Professor"
                aria-label="Add Professor"
              >
                <IconPlus className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Bottom Settings Icon */}
        <div className="flex flex-col items-center gap-2 w-full pb-1">
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-12 h-10 rounded-full flex items-center justify-center text-[#444746] hover:bg-[#f1f3f4] transition-all cursor-pointer"
            title="Settings"
            aria-label="Settings"
          >
            <IconSettings className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* =========================================================================
          2. EXPANDED DRAWER (Screenshot 2: Triggered by Hamburger menu)
          ========================================================================= */}
      {/* Overlay Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#202124]/40 backdrop-blur-2xs transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Expanded Drawer Panel */}
      <aside
        className={`fixed bottom-0 left-0 w-72 bg-white border-r border-[#dadce0] flex flex-col transition-transform duration-200 ease-in-out z-50 top-0 lg:top-16 shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Main Navigation Drawer"
      >
        {/* Mobile-only Drawer Top Banner with Close button */}
        <div className="h-16 px-4 border-b border-[#dadce0] flex items-center justify-between lg:hidden select-none">
          <div className="flex items-center gap-2.5">
            <AppLogo className="w-8 h-8" />
            <div>
              <span className="font-bold text-sm text-[#202124] leading-tight block">
                Attendance Live
              </span>
              <span className="text-[11px] text-[#5f6368] font-medium block">
                Classroom
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124] transition-colors cursor-pointer"
            aria-label="Close navigation"
          >
            <IconClose className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-3 pr-3 select-none">
          {/* Main Items */}
          <div className="space-y-0.5">
            {/* Home Link */}
            <button
              type="button"
              onClick={() => handleItemClick("classes")}
              className={`w-full flex items-center gap-4 px-6 py-3 rounded-r-full text-sm transition-colors cursor-pointer ${
                isHomeActive
                  ? "bg-[#c2e7ff] text-[#001d35] font-semibold"
                  : "text-[#3c4043] hover:bg-[#f1f3f4] font-medium"
              }`}
            >
              <IconHome className="w-5 h-5 shrink-0" />
              <span>Home</span>
            </button>

            {/* Student Additional Primary Links */}
            {role === "STUDENT" && (
              <>
                <button
                  type="button"
                  onClick={() => handleItemClick("enroll-face")}
                  className={`w-full flex items-center justify-between px-6 py-3 rounded-r-full text-sm transition-colors cursor-pointer ${
                    activeNav === "enroll-face"
                      ? "bg-[#c2e7ff] text-[#001d35] font-semibold"
                      : "text-[#3c4043] hover:bg-[#f1f3f4] font-medium"
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <IconCamera className="w-5 h-5 shrink-0" />
                    <span className="truncate">Face Setup</span>
                  </div>
                  {!isBiometricEnrolled && (
                    <Badge variant="warning" size="xs">
                      Required
                    </Badge>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleItemClick("history")}
                  className={`w-full flex items-center gap-4 px-6 py-3 rounded-r-full text-sm transition-colors cursor-pointer ${
                    activeNav === "history"
                      ? "bg-[#c2e7ff] text-[#001d35] font-semibold"
                      : "text-[#3c4043] hover:bg-[#f1f3f4] font-medium"
                  }`}
                >
                  <IconClock className="w-5 h-5 shrink-0" />
                  <span>Attendance History</span>
                </button>
              </>
            )}

            {/* Professor Primary Links */}
            {role === "PROFESSOR" && (
              <button
                type="button"
                onClick={() => handleItemClick("create-class")}
                className={`w-full flex items-center gap-4 px-6 py-3 rounded-r-full text-sm transition-colors cursor-pointer ${
                  activeNav === "create-class"
                    ? "bg-[#c2e7ff] text-[#001d35] font-semibold"
                    : "text-[#3c4043] hover:bg-[#f1f3f4] font-medium"
                }`}
              >
                <IconPlus className="w-5 h-5 shrink-0" />
                <span>Create Class</span>
              </button>
            )}

            {/* Admin Primary Links */}
            {role === "ADMIN" && (
              <>
                <button
                  type="button"
                  onClick={() => handleItemClick("users")}
                  className={`w-full flex items-center gap-4 px-6 py-3 rounded-r-full text-sm transition-colors cursor-pointer ${
                    activeNav === "users"
                      ? "bg-[#c2e7ff] text-[#001d35] font-semibold"
                      : "text-[#3c4043] hover:bg-[#f1f3f4] font-medium"
                  }`}
                >
                  <IconUsers className="w-5 h-5 shrink-0" />
                  <span>User Directory</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleItemClick("create-prof")}
                  className={`w-full flex items-center gap-4 px-6 py-3 rounded-r-full text-sm transition-colors cursor-pointer ${
                    activeNav === "create-prof"
                      ? "bg-[#c2e7ff] text-[#001d35] font-semibold"
                      : "text-[#3c4043] hover:bg-[#f1f3f4] font-medium"
                  }`}
                >
                  <IconPlus className="w-5 h-5 shrink-0" />
                  <span>Add Professor</span>
                </button>
              </>
            )}
          </div>

          {/* Group Divider */}
          <div className="my-2 border-t border-[#e8eaed]" />

          {/* Collapsible Enrolled / Teaching Classes Section (Screenshot 2) */}
          {(role === "STUDENT" || role === "PROFESSOR") && (
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setEnrolledGroupOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-6 py-2 text-xs font-bold uppercase tracking-wider text-[#5f6368] hover:text-[#202124] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <IconGraduationCap className="w-4 h-4 text-[#5f6368]" />
                  <span>{role === "STUDENT" ? "Enrolled" : "Teaching"}</span>
                </div>
                {enrolledGroupOpen ? (
                  <IconChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <IconChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {enrolledGroupOpen && (
                <div className="space-y-0.5 pt-0.5">
                  {classesList.length === 0 ? (
                    <div className="px-6 py-2 text-xs text-[#80868b] italic">
                      No classes yet
                    </div>
                  ) : (
                    classesList.map((cls) => {
                      const theme = getClassTheme(cls.id || cls.name);
                      const initial = cls.name ? cls.name[0].toUpperCase() : "C";

                      return (
                        <button
                          key={cls.id}
                          type="button"
                          onClick={() => handleClassClick(cls)}
                          className="w-full flex items-center gap-3.5 px-6 py-2 rounded-r-full text-sm text-[#3c4043] hover:bg-[#f1f3f4] hover:text-[#202124] transition-colors cursor-pointer text-left"
                          title={`${cls.name} (${cls.section})`}
                        >
                          {/* Circular initial avatar matching Google Classroom */}
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs ${theme.bannerBg}`}
                          >
                            {initial}
                          </div>

                          <div className="min-w-0 flex-1">
                            <span className="block text-xs font-semibold text-[#202124] truncate leading-tight">
                              {cls.name}
                            </span>
                            <span className="block text-[10px] text-[#5f6368] truncate leading-tight mt-0.5">
                              {cls.section || cls.semester}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              )}

              {/* Group Divider */}
              <div className="my-2 border-t border-[#e8eaed]" />
            </div>
          )}

          {/* Bottom Navigation Utilities (Screenshot 2: Archived classes, Settings, Sign Out) */}
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => handleItemClick("classes")}
              className="w-full flex items-center gap-4 px-6 py-3 rounded-r-full text-sm font-medium text-[#3c4043] hover:bg-[#f1f3f4] transition-colors cursor-pointer"
            >
              <IconArchive className="w-5 h-5 shrink-0 text-[#5f6368]" />
              <span>Archived classes</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onOpenSettings) onOpenSettings();
                if (onClose) onClose();
              }}
              className="w-full flex items-center gap-4 px-6 py-3 rounded-r-full text-sm font-medium text-[#3c4043] hover:bg-[#f1f3f4] transition-colors cursor-pointer"
            >
              <IconSettings className="w-5 h-5 shrink-0 text-[#5f6368]" />
              <span>Settings</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onClose) onClose();
                if (onLogout) onLogout();
              }}
              className="w-full flex items-center gap-4 px-6 py-3 rounded-r-full text-sm font-medium text-[#c5221f] hover:bg-[#fce8e6] transition-colors cursor-pointer"
            >
              <IconLogOut className="w-5 h-5 shrink-0 text-[#c5221f]" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
