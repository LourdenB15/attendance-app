// apps/web/src/components/layout/Header.jsx
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../ui/Badge";

export function Header() {
  const { currentUser, logout } = useAuth();

  if (!currentUser) return null;

  const roleBadgeVariant =
    currentUser.role === "ADMIN"
      ? "purple"
      : currentUser.role === "PROFESSOR"
      ? "primary"
      : "success";

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-xs">
            A
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 leading-tight">Attendance Tracker</h1>
            <span className="text-xs text-slate-500 font-medium">Active Liveness Biometrics</span>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-slate-800">{currentUser.full_name}</div>
            <div className="text-xs text-slate-500 flex items-center justify-end gap-1.5 mt-0.5">
              <span className="font-mono">{currentUser.email}</span>
              <Badge variant={roleBadgeVariant} size="xs">
                {currentUser.role}
              </Badge>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 text-xs font-semibold rounded-lg border border-slate-200 transition shadow-2xs"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
