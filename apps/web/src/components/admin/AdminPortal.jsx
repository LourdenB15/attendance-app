// apps/web/src/components/admin/AdminPortal.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { adminApi } from "../../api";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import { useConfirm } from "../../context/useConfirm";
import { CreateProfessorCard } from "./CreateProfessorCard";
import { UserDirectoryTable } from "./UserDirectoryTable";
import { Modal } from "../ui/Modal";
import { IconPlus } from "../ui/Icons";
import {
  getUrlParams,
  updateUrlParams,
  saveSessionState,
  getSessionState,
} from "../../utils/navigation";

export function AdminPortal({ activeNav, navKey = 0 }) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [showAddProfModal, setShowAddProfModal] = useState(false);

  // Restore role filter from URL or session
  const initialParams = getUrlParams();
  const savedState = getSessionState("admin_filter");
  const [roleFilter, setRoleFilter] = useState(
    () => initialParams.get("role") || savedState?.role || "ALL"
  );
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);

  const roleFilterRef = useRef(roleFilter);
  useEffect(() => {
    roleFilterRef.current = roleFilter;
    updateUrlParams({ role: roleFilter }, true);
    saveSessionState("admin_filter", { role: roleFilter });
  }, [roleFilter]);

  // Synchronize state when navigation triggers arrive from sidebar
  const [prevNavKey, setPrevNavKey] = useState(navKey);
  if (navKey !== prevNavKey) {
    setPrevNavKey(navKey);
    if (activeNav === "create-prof") {
      setShowAddProfModal(true);
    }
  }

  const loadUsers = useCallback(async (role, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const users = await adminApi.getUsers(role);
      setUserList(users);
    } catch (err) {
      if (!silent) showToast("error", err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    let ignore = false;
    async function fetchUsers() {
      setLoading(true);
      try {
        const users = await adminApi.getUsers(roleFilter);
        if (!ignore) setUserList(users);
      } catch (err) {
        if (!ignore) showToast("error", err.message);
      } finally {
        if (!ignore) setLoading(false);
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
      loadUsers(roleFilter, true);
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
      loadUsers(roleFilter, true);
    } catch (err) {
      showToast("error", err.message);
    }
  };

  const handleReactivate = async (userId) => {
    try {
      await adminApi.reactivateUser(userId);
      showToast("success", "User reactivated successfully.");
      loadUsers(roleFilter, true);
    } catch (err) {
      showToast("error", err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Portal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#dadce0]">
        <div>
          <h2 className="text-xl font-bold text-[#202124]">Admin Control Center</h2>
          <p className="text-xs text-[#5f6368] mt-0.5">
            Manage user accounts, roles, permissions, and faculty invitations
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddProfModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <IconPlus className="w-4 h-4" />
          <span>Add Professor</span>
        </button>
      </div>

      {/* Directory Table with Spreadsheet styling and Skeleton loading */}
      <UserDirectoryTable
        currentUserId={currentUser?.id}
        users={userList}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        onUpdateRole={handleUpdateRole}
        onDeactivate={handleDeactivate}
        onReactivate={handleReactivate}
        onRefresh={() => loadUsers(roleFilter)}
        onAddProfessor={() => setShowAddProfModal(true)}
        loading={loading}
      />

      {/* Add Professor Modal Dialog */}
      <Modal
        isOpen={showAddProfModal}
        onClose={() => setShowAddProfModal(false)}
        title="Invite New Professor"
        subtitle="Create faculty account credentials and send welcome access"
      >
        <CreateProfessorCard
          onCreated={() => {
            setShowAddProfModal(false);
            loadUsers(roleFilter);
          }}
        />
      </Modal>
    </div>
  );
}
