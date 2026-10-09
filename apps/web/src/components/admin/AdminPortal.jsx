// apps/web/src/components/admin/AdminPortal.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { adminApi } from "../../api";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import { useConfirm } from "../../context/useConfirm";
import { CreateProfessorCard } from "./CreateProfessorCard";
import { UserDirectoryTable } from "./UserDirectoryTable";
import { IconUsers, IconPlus } from "../ui/Icons";

export function AdminPortal({ activeNav, navKey = 0, onNavSelect }) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [adminTab, setAdminTab] = useState(activeNav || "users"); // "users" | "create-prof"
  const [userList, setUserList] = useState([]);
  const [roleFilter, setRoleFilter] = useState("ALL");

  const roleFilterRef = useRef(roleFilter);
  useEffect(() => {
    roleFilterRef.current = roleFilter;
  }, [roleFilter]);

  // Synchronize state when navigation triggers arrive from sidebar without cascading effect renders
  const [prevNavKey, setPrevNavKey] = useState(navKey);
  if (navKey !== prevNavKey) {
    setPrevNavKey(navKey);
    if (activeNav === "users" || activeNav === "create-prof") {
      setAdminTab(activeNav);
    }
  }

  const handleTabChange = (tab) => {
    setAdminTab(tab);
    if (onNavSelect) onNavSelect(tab);
  };

  const loadUsers = useCallback(async (role, silent = false) => {
    try {
      const users = await adminApi.getUsers(role);
      setUserList(users);
    } catch (err) {
      if (!silent) showToast("error", err.message);
    }
  }, [showToast]);

  useEffect(() => {
    let ignore = false;
    async function fetchUsers() {
      try {
        const users = await adminApi.getUsers(roleFilter);
        if (!ignore) setUserList(users);
      } catch (err) {
        if (!ignore) showToast("error", err.message);
      }
    }
    fetchUsers();

    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        loadUsers(roleFilterRef.current, true);
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      ignore = true;
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [roleFilter, loadUsers, showToast]);

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const updated = await adminApi.updateUserRole(userId, newRole);
      showToast("success", `Role updated to ${newRole} for ${updated.full_name}.`);
      loadUsers(roleFilter);
    } catch (err) {
      showToast("error", err.message);
    }
  };

  const handleDeactivate = async (userId) => {
    const user = userList.find((u) => u.id === userId);
    const confirmed = await confirm({
      title: "Deactivate this user account?",
      message: `${user?.full_name || "This user"} will be prevented from logging in until reactivated by an admin.`,
      confirmLabel: "Deactivate Account",
      danger: true,
    });
    if (!confirmed) return;
    try {
      await adminApi.deactivateUser(userId);
      showToast("success", "User deactivated successfully.");
      loadUsers(roleFilter);
    } catch (err) {
      showToast("error", err.message);
    }
  };

  const handleReactivate = async (userId) => {
    try {
      await adminApi.reactivateUser(userId);
      showToast("success", "User reactivated successfully.");
      loadUsers(roleFilter);
    } catch (err) {
      showToast("error", err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#dadce0]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-[#202124]">
              Admin Control Center
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#f3e8fd] text-[#7627bb] border border-[#e9d2fd]">
              Administrator View
            </span>
          </div>
          <p className="text-xs text-[#5f6368] mt-0.5">
            Manage user accounts, roles, faculty invitations, and access permissions.
          </p>
        </div>

        <div className="flex bg-[#f1f3f4] p-1 rounded-xl text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => handleTabChange("users")}
            className={`px-3.5 py-1.5 rounded-lg transition-all inline-flex items-center gap-1.5 ${
              adminTab === "users"
                ? "bg-white text-[#1a73e8] shadow-xs font-bold"
                : "text-[#5f6368] hover:text-[#202124]"
            }`}
          >
            <IconUsers className="w-3.5 h-3.5" />
            <span>User Directory</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("create-prof")}
            className={`px-3.5 py-1.5 rounded-lg transition-all inline-flex items-center gap-1.5 ${
              adminTab === "create-prof"
                ? "bg-white text-[#1a73e8] shadow-xs font-bold"
                : "text-[#5f6368] hover:text-[#202124]"
            }`}
          >
            <IconPlus className="w-3.5 h-3.5" />
            <span>Add Professor</span>
          </button>
        </div>
      </div>

      {adminTab === "users" && (
        <UserDirectoryTable
          currentUserId={currentUser?.id}
          users={userList}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          onRefresh={() => loadUsers(roleFilter)}
          onUpdateRole={handleUpdateRole}
          onDeactivate={handleDeactivate}
          onReactivate={handleReactivate}
        />
      )}

      {adminTab === "create-prof" && (
        <CreateProfessorCard
          onCreated={() => {
            setAdminTab("users");
            loadUsers(roleFilter);
          }}
        />
      )}
    </div>
  );
}
