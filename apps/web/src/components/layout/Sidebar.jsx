import {
  IconClassroom,
  IconBook,
  IconUsers,
  IconClock,
  IconCamera,
  IconPlus,
  IconSettings,
  IconClose,
  IconShieldCheck,
  IconLogOut,
} from "../ui/Icons";
import { Badge } from "../ui/Badge";
import { AppLogo } from "../ui/AppLogo";
import { UserAvatar } from "../ui/UserAvatar";

export function Sidebar({
  isOpen,
  onClose,
  currentUser,
  activeNav,
  onNavSelect,
  onOpenSettings,
  onLogout,
}) {
  if (!currentUser) return null;

  const role = currentUser.role;
  const isBiometricEnrolled = Boolean(currentUser.has_biometric_enrolled);

  const getNavItems = () => {
    if (role === "PROFESSOR") {
      return [
        {
          id: "classes",
          label: "Teaching",
          sublabel: "All Classes",
          icon: <IconClassroom className="w-5 h-5" />,
        },
        {
          id: "create-class",
          label: "Create Class",
          sublabel: "Add new section",
          icon: <IconPlus className="w-5 h-5" />,
        },
      ];
    }
    if (role === "STUDENT") {
      return [
        {
          id: "classes",
          label: "Enrolled",
          sublabel: "My Classes",
          icon: <IconBook className="w-5 h-5" />,
        },
        {
          id: "enroll-face",
          label: "Face Setup",
          sublabel: isBiometricEnrolled ? "Biometrics Active" : "Action Required",
          icon: <IconCamera className="w-5 h-5" />,
          badge: !isBiometricEnrolled ? "Required" : null,
          badgeVariant: "warning",
        },
        {
          id: "history",
          label: "Attendance History",
          sublabel: "Past check-ins",
          icon: <IconClock className="w-5 h-5" />,
        },
      ];
    }
    if (role === "ADMIN") {
      return [
        {
          id: "users",
          label: "User Directory",
          sublabel: "Manage accounts",
          icon: <IconUsers className="w-5 h-5" />,
        },
        {
          id: "create-prof",
          label: "Add Professor",
          sublabel: "Invite faculty",
          icon: <IconPlus className="w-5 h-5" />,
        },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  const handleItemClick = (id) => {
    if (onNavSelect) {
      onNavSelect(id);
    }
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#202124]/40 backdrop-blur-2xs lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer (open by default on desktop, overlay on mobile) */}
      <aside
        className={`fixed bottom-0 left-0 w-72 bg-white border-r border-[#dadce0] flex flex-col transition-transform duration-200 ease-in-out z-40 lg:z-20 top-0 lg:top-16 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Mobile-only Drawer Header */}
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
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124] transition-colors"
            aria-label="Close navigation"
          >
            <IconClose className="w-5 h-5" />
          </button>
        </div>

        {/* User Card in Drawer */}
        <div className="p-4 mx-3 mt-3 rounded-xl bg-[#f8f9fa] border border-[#dadce0]/70">
          <div className="flex items-center gap-3">
            <UserAvatar
              user={currentUser}
              className="w-10 h-10"
              textClassName="text-base font-bold"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#202124] truncate">
                {currentUser.full_name}
              </p>
              <p className="text-[11px] text-[#5f6368] font-mono truncate">
                {currentUser.email}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <Badge
                  variant={
                    role === "ADMIN"
                      ? "purple"
                      : role === "PROFESSOR"
                      ? "primary"
                      : "success"
                  }
                  size="xs"
                >
                  {role}
                </Badge>
                {isBiometricEnrolled && (
                  <span
                    title="Face biometric verified"
                    className="inline-flex items-center text-[10px] text-[#137333] font-semibold"
                  >
                    <IconShieldCheck className="w-3.5 h-3.5 text-[#137333]" />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#70757a]">
            Navigation
          </div>
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-r-full text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#e8f0fe] text-[#1a73e8] font-semibold"
                    : "text-[#3c4043] hover:bg-[#f1f3f4] hover:text-[#202124]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={isActive ? "text-[#1a73e8]" : "text-[#5f6368]"}>
                    {item.icon}
                  </span>
                  <div className="text-left truncate">
                    <span className="block truncate">{item.label}</span>
                    {item.sublabel && (
                      <span className="block text-[11px] text-[#70757a] font-normal truncate">
                        {item.sublabel}
                      </span>
                    )}
                  </div>
                </div>
                {item.badge && (
                  <Badge variant={item.badgeVariant || "default"} size="xs">
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-[#dadce0] bg-white space-y-1">
          <button
            type="button"
            onClick={() => {
              if (onOpenSettings) onOpenSettings();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-[#3c4043] hover:bg-[#f1f3f4] transition-colors"
          >
            <IconSettings className="w-4 h-4 text-[#5f6368]" />
            <span>Account Settings</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onClose) onClose();
              if (onLogout) onLogout();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-[#d93025] hover:bg-[#fce8e6] transition-colors"
          >
            <IconLogOut className="w-4 h-4 text-[#d93025]" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
