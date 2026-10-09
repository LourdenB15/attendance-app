// apps/web/src/components/admin/UserDirectoryTable.jsx
import { useState } from "react";
import { Badge } from "../ui/Badge";
import { EmptyState } from "../ui/EmptyState";
import {
  IconUsers,
  IconRefresh,
  IconSearch,
  IconShieldCheck,
} from "../ui/Icons";

export function UserDirectoryTable({
  users = [],
  currentUserId,
  roleFilter = "ALL",
  onRoleFilterChange,
  onRefresh,
  onUpdateRole,
  onDeactivate,
  onReactivate,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.full_name && u.full_name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-[#dadce0] overflow-hidden">
      {/* Directory Filter & Search Header */}
      <div className="p-4 sm:p-5 border-b border-[#dadce0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Role Filter Tabs */}
        <div className="flex bg-[#f1f3f4] p-1 rounded-lg text-xs font-semibold self-start sm:self-auto overflow-x-auto">
          {[
            { id: "ALL", label: "All Users" },
            { id: "PROFESSOR", label: "Professors" },
            { id: "STUDENT", label: "Students" },
            { id: "ADMIN", label: "Admins" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onRoleFilterChange(tab.id)}
              className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                roleFilter === tab.id
                  ? "bg-white text-[#1a73e8] shadow-xs font-bold"
                  : "text-[#5f6368] hover:text-[#202124]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2.5">
          <div className="relative sm:w-60">
            <IconSearch className="w-4 h-4 text-[#5f6368] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search directory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 bg-[#f8f9fa] border border-[#dadce0] rounded-lg text-xs text-[#202124] placeholder-[#80868b] focus:bg-white focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#e8f0fe] transition-all"
            />
          </div>

          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#3c4043] bg-white hover:bg-[#f1f3f4] border border-[#dadce0] rounded-lg transition shadow-2xs shrink-0"
            title="Refresh directory"
          >
            <IconRefresh className="w-3.5 h-3.5 text-[#5f6368]" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Directory Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f8f9fa] text-[#5f6368] uppercase text-[11px] tracking-wider border-b border-[#dadce0] font-semibold">
            <tr>
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Change Role</th>
              <th className="px-5 py-3">Account Status</th>
              <th className="px-5 py-3">Created</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8eaed]">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center">
                  <EmptyState
                    icon={<IconUsers className="w-6 h-6" />}
                    title={
                      searchQuery
                        ? "No users match your search"
                        : "No users in this category"
                    }
                    description="Try selecting a different role filter or clearing your search term."
                    className="border-none p-4"
                  />
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const initial = u.full_name ? u.full_name[0].toUpperCase() : "U";
                const isCurrent = u.id === currentUserId;

                return (
                  <tr key={u.id} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#202124] truncate">
                              {u.full_name}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] bg-[#e8f0fe] text-[#1a73e8] font-bold px-1.5 py-0.5 rounded border border-[#d2e3fc]">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#5f6368] font-mono flex items-center gap-1.5">
                            <span>{u.email}</span>
                            {u.is_email_verified && (
                              <span
                                title="Email verified"
                                className="inline-flex items-center text-[10px] text-[#137333]"
                              >
                                <IconShieldCheck className="w-3 h-3 text-[#137333]" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <Badge
                        variant={
                          u.role === "ADMIN"
                            ? "purple"
                            : u.role === "PROFESSOR"
                            ? "primary"
                            : "success"
                        }
                        size="xs"
                        dot
                      >
                        {u.role}
                      </Badge>
                    </td>

                    <td className="px-5 py-3.5">
                      {isCurrent ? (
                        <span className="text-xs text-[#70757a] italic">
                          Cannot change self
                        </span>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => onUpdateRole(u.id, e.target.value)}
                          className="px-2.5 py-1 bg-white border border-[#dadce0] rounded-lg text-xs font-semibold text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#e8f0fe] cursor-pointer hover:border-[#bdc1c6] transition shadow-2xs"
                        >
                          <option value="STUDENT">Student</option>
                          <option value="PROFESSOR">Professor</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      {u.is_active ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#137333]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1e8e3e]" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#c5221f]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#d93025]" />
                          <span>Deactivated</span>
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-xs text-[#70757a]">
                      {new Date(u.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      {!isCurrent &&
                        (u.is_active ? (
                          <button
                            type="button"
                            onClick={() => onDeactivate(u.id)}
                            className="px-2.5 py-1 text-xs text-[#c5221f] hover:bg-[#fce8e6] rounded-md font-medium transition"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onReactivate(u.id)}
                            className="px-2.5 py-1 text-xs text-[#137333] hover:bg-[#e6f4ea] rounded-md font-medium transition"
                          >
                            Reactivate
                          </button>
                        ))}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
