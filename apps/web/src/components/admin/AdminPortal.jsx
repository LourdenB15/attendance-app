// apps/web/src/components/admin/AdminPortal.jsx
import { useState, useEffect, useCallback } from "react";
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

  const loadUsers = useCallback(async (role) => {
    try {
      const users = await adminApi.getUsers(role);
      setUserList(users);
    } catch (err) {
      showToast("error", err.message);
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
    return () => {
      ignore = true;
    };
  }, [roleFilter, showToast]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Admin Control Center</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage user accounts and professor invitations</p>
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

      {adminTab === "create-prof" && (
        <CreateProfessorCard
          onCreated={() => {
            loadUsers(roleFilter);
            setAdminTab("users");
          }}
        />
      )}

      {adminTab === "users" && (
        <UserDirectoryTable
          users={userList}
          currentUserId={currentUser?.id}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          onRefresh={() => loadUsers(roleFilter)}
          onDeactivate={handleDeactivate}
        />
      )}
    </div>
  );
}
