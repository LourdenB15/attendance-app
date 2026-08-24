// apps/web/src/components/admin/AdminPortal.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { adminApi } from "../../api";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import { CreateProfessorCard } from "./CreateProfessorCard";
import { UserDirectoryTable } from "./UserDirectoryTable";

export function AdminPortal() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [adminTab, setAdminTab] = useState("users"); // "users" | "create-prof"
  const [userList, setUserList] = useState([]);
  const [roleFilter, setRoleFilter] = useState("ALL");

  const roleFilterRef = useRef(roleFilter);
  useEffect(() => {
    roleFilterRef.current = roleFilter;
  }, [roleFilter]);

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
    if (!window.confirm("Are you sure you want to deactivate this user?")) return;
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
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Admin Control Center</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage user accounts, roles, and professor invitations</p>
        </div>

        <div className="flex bg-slate-200 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setAdminTab("users")}
            className={`px-3 py-1.5 rounded-lg transition ${
              adminTab === "users" ? "bg-white text-indigo-600 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            User Directory
          </button>
          <button
            type="button"
            onClick={() => setAdminTab("create-prof")}
            className={`px-3 py-1.5 rounded-lg transition ${
              adminTab === "create-prof" ? "bg-white text-indigo-600 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            + Add Professor
          </button>
        </div>
      </div>

      {adminTab === "users" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-slate-500">Filter Role:</span>
            {["ALL", "STUDENT", "PROFESSOR", "ADMIN"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  roleFilter === r
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <UserDirectoryTable
            currentUserId={currentUser?.id}
            users={userList}
            onRoleChange={handleUpdateRole}
            onDeactivate={handleDeactivate}
            onReactivate={handleReactivate}
          />
        </div>
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
