// apps/web/src/components/admin/UserDirectoryTable.jsx
import { useState, useMemo } from "react";
import { Badge } from "../ui/Badge";
import { EmptyState } from "../ui/EmptyState";
import { UserAvatar } from "../ui/UserAvatar";
import { TableSkeleton } from "../ui/Skeleton";
import { GoogleProgressBar } from "../ui/ProgressBar";
import {
  IconUsers,
  IconRefresh,
  IconSearch,
  IconShieldCheck,
  IconPlus,
  IconCopy,
  IconCheck,
} from "../ui/Icons";

export function UserDirectoryTable({
  users = [],
  currentUserId,
  roleFilter = "ALL",
  onRoleFilterChange,
  onRefresh,
  onUpdateRole,
  onRoleChange,
  onDeactivate,
  onReactivate,
  onAddProfessor,
  loading = false,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("created_at"); // "full_name" | "role" | "is_active" | "created_at"
  const [sortAsc, setSortAsc] = useState(false);
  const [mobileMode, setMobileMode] = useState("cards"); // "cards" | "sheet"
  const [copiedEmail, setCopiedEmail] = useState(null);

  const handleRoleUpdate = onUpdateRole || onRoleChange;

  const handleCopyEmail = (email, e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 1800);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filteredAndSortedUsers = useMemo(() => {
    let list = users.filter((u) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (u.full_name && u.full_name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q))
      );
    });

    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "created_at") {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = (valB || "").toLowerCase();
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return list;
  }, [users, searchQuery, sortField, sortAsc]);

  const renderSortIndicator = (field) => {
    if (sortField !== field) {
      return <span className="text-[#dadce0] ml-1 text-[10px]">↕</span>;
    }
    return (
      <span className="text-[#1a73e8] ml-1 text-[10px] font-bold">
        {sortAsc ? "▲" : "▼"}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-[#dadce0] overflow-hidden">
      {/* Directory Filter & Search Header */}
      <div className="p-4 sm:p-5 border-b border-[#dadce0] flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Role Filter Tabs */}
        <div className="flex bg-[#f1f3f4] p-1 rounded-lg text-xs font-semibold overflow-x-auto scrollbar-none w-full md:w-auto shrink-0">
          {[
            { id: "ALL", label: "All Users" },
            { id: "PROFESSOR", label: "Professors" },
            { id: "STUDENT", label: "Students" },
            { id: "ADMIN", label: "Admins" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onRoleFilterChange && onRoleFilterChange(tab.id)}
              className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap cursor-pointer ${
                roleFilter === tab.id
                  ? "bg-white text-[#1a73e8] shadow-xs font-bold"
                  : "text-[#5f6368] hover:text-[#202124]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search, Mobile Mode & Refresh */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="relative flex-1 sm:w-60">
            <IconSearch className="w-4 h-4 text-[#5f6368] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search directory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-7 py-2 sm:py-1.5 bg-[#f8f9fa] border border-[#dadce0] rounded-lg text-xs text-[#202124] placeholder-[#80868b] focus:bg-white focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#e8f0fe] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Mobile phone spreadsheet/card view toggle */}
          <div className="flex md:hidden bg-[#f1f3f4] p-0.5 rounded-lg text-[11px] font-semibold shrink-0">
            <button
              type="button"
              onClick={() => setMobileMode("cards")}
              className={`px-2 py-1 rounded transition-colors ${
                mobileMode === "cards"
                  ? "bg-white text-[#1a73e8] shadow-2xs font-bold"
                  : "text-[#5f6368]"
              }`}
            >
              Cards
            </button>
            <button
              type="button"
              onClick={() => setMobileMode("sheet")}
              className={`px-2 py-1 rounded transition-colors ${
                mobileMode === "sheet"
                  ? "bg-white text-[#1a73e8] shadow-2xs font-bold"
                  : "text-[#5f6368]"
              }`}
            >
              Sheet
            </button>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 sm:py-1.5 text-xs font-semibold text-[#3c4043] bg-white hover:bg-[#f1f3f4] border border-[#dadce0] rounded-lg transition shadow-2xs shrink-0 cursor-pointer disabled:opacity-70"
            title="Refresh directory"
          >
            <IconRefresh className={`w-3.5 h-3.5 text-[#5f6368] ${loading ? "animate-spin text-[#1a73e8]" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Pinned Google Indeterminate Progress Bar during background refresh */}
      {loading && users.length > 0 && (
        <GoogleProgressBar height="h-1" />
      )}

      {/* Loading Skeleton */}
      {loading && users.length === 0 ? (
        <TableSkeleton
          rows={6}
          cols={6}
          headers={["User", "Role", "Change Role", "Account Status", "Created", "Actions"]}
        />
      ) : (
        <>
          {/* Mobile Card List (< md and mobileMode === 'cards') */}
          <div className={`${mobileMode === "cards" ? "block md:hidden" : "hidden"} divide-y divide-[#e8eaed]`}>
            {filteredAndSortedUsers.length === 0 ? (
              <div className="p-8 text-center">
                <EmptyState
                  icon={<IconUsers className="w-6 h-6" />}
                  title={
                    searchQuery
                      ? "No users match your search"
                      : "No users in this category"
                  }
                  description="Try selecting a different role filter or clearing your search term."
                  action={
                    !searchQuery && onAddProfessor ? (
                      <button
                        type="button"
                        onClick={onAddProfessor}
                        className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
                      >
                        <IconPlus className="w-3.5 h-3.5" />
                        <span>Invite Professor</span>
                      </button>
                    ) : null
                  }
                  className="border-none p-4"
                />
              </div>
            ) : (
              filteredAndSortedUsers.map((u) => {
                const isCurrent = u.id === currentUserId;
                return (
                  <div key={u.id} className="p-4 space-y-3 hover:bg-[#f8f9fa] transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar
                          user={u}
                          className="w-10 h-10"
                          textClassName="text-sm font-bold"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-[#202124] truncate">
                              {u.full_name}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] bg-[#e8f0fe] text-[#1a73e8] font-bold px-1.5 py-0.5 rounded border border-[#d2e3fc]">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#5f6368] font-mono flex items-center gap-1.5 truncate mt-0.5">
                            <span className="truncate">{u.email}</span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyEmail(u.email, e)}
                              className="text-slate-400 hover:text-indigo-600 transition"
                              title="Copy email"
                            >
                              {copiedEmail === u.email ? (
                                <IconCheck className="w-3 h-3 text-[#137333]" />
                              ) : (
                                <IconCopy className="w-3 h-3" />
                              )}
                            </button>
                            {u.is_email_verified && (
                              <span
                                title="Email verified"
                                className="shrink-0 text-[#137333]"
                              >
                                <IconShieldCheck className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Account Status Badge */}
                      <div className="shrink-0">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#137333] bg-[#e6f4ea] px-2 py-0.5 rounded-full border border-[#ceead6]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1e8e3e]" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#c5221f] bg-[#fce8e6] px-2 py-0.5 rounded-full border border-[#fad2cf]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#d93025]" />
                            <span>Deactivated</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#5f6368] pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] uppercase font-semibold text-[#80868b]">
                          Role:
                        </span>
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
                      </div>
                      <span className="text-[11px] text-[#70757a]">
                        Joined{" "}
                        {new Date(u.created_at).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Mobile Action Controls */}
                    <div className="flex items-center gap-2 pt-2 border-t border-[#f1f3f4]">
                      {isCurrent ? (
                        <span className="text-xs text-[#70757a] italic py-1.5">
                          Current account (role locked)
                        </span>
                      ) : (
                        <>
                          <div className="flex-1">
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleUpdate && handleRoleUpdate(u.id, e.target.value)}
                              className="w-full px-3 py-2 bg-[#f8f9fa] border border-[#dadce0] rounded-lg text-xs font-semibold text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#e8f0fe] cursor-pointer"
                              aria-label={`Change role for ${u.full_name}`}
                            >
                              <option value="STUDENT">Role: Student</option>
                              <option value="PROFESSOR">Role: Professor</option>
                              <option value="ADMIN">Role: Admin</option>
                            </select>
                          </div>
                          {u.is_active ? (
                            <button
                              type="button"
                              onClick={() => onDeactivate(u.id)}
                              className="px-3.5 py-2 text-xs font-semibold text-[#c5221f] bg-[#fce8e6] hover:bg-[#fad2cf] border border-[#fad2cf] rounded-lg transition cursor-pointer"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onReactivate(u.id)}
                              className="px-3.5 py-2 text-xs font-semibold text-[#137333] bg-[#e6f4ea] hover:bg-[#ceead6] border border-[#ceead6] rounded-lg transition cursor-pointer"
                            >
                              Reactivate
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* SPREADSHEET TABLE VIEW (Desktop >= md, or mobile when mobileMode === 'sheet') */}
          <div className={`${mobileMode === "cards" ? "hidden md:block" : "block"}`}>
            {/* Mobile swipe helper badge (pinned above table) */}
            <div className="md:hidden px-4 py-2 bg-[#f1f3f4] border-b border-[#dadce0] text-[11px] text-[#5f6368] flex items-center justify-between">
              <span>↔ Swipe horizontally for full spreadsheet</span>
              <span className="text-[10px] font-semibold text-[#1a73e8]">Spreadsheet View</span>
            </div>

            <div className="overflow-x-auto overscroll-x-contain relative">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead className="bg-[#f8f9fa] text-[#5f6368] uppercase text-[10px] sm:text-[11px] tracking-wider border-b border-[#dadce0] font-semibold">
                  <tr>
                    <th
                      onClick={() => handleSort("full_name")}
                      className="px-3 sm:px-5 py-2.5 sm:py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition md:sticky md:left-0 bg-[#f8f9fa] md:z-20 md:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] min-w-[150px] sm:min-w-[180px]"
                    >
                      <div className="flex items-center justify-between">
                        <span>User</span>
                        {renderSortIndicator("full_name")}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("role")}
                      className="px-3 sm:px-5 py-2.5 sm:py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition min-w-[100px] sm:min-w-[120px]"
                    >
                      <div className="flex items-center justify-between">
                        <span>Role</span>
                        {renderSortIndicator("role")}
                      </div>
                    </th>
                    <th className="px-3 sm:px-5 py-2.5 sm:py-3 border-r border-[#dadce0]/70 min-w-[120px] sm:min-w-[140px]">
                      Change Role
                    </th>
                    <th
                      onClick={() => handleSort("is_active")}
                      className="px-3 sm:px-5 py-2.5 sm:py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition min-w-[110px] sm:min-w-[130px]"
                    >
                      <div className="flex items-center justify-between">
                        <span>Account Status</span>
                        {renderSortIndicator("is_active")}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("created_at")}
                      className="px-3 sm:px-5 py-2.5 sm:py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition min-w-[100px] sm:min-w-[120px]"
                    >
                      <div className="flex items-center justify-between">
                        <span>Created</span>
                        {renderSortIndicator("created_at")}
                      </div>
                    </th>
                    <th className="px-3 sm:px-5 py-2.5 sm:py-3 text-right min-w-[90px] sm:min-w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8eaed] bg-white">
                  {filteredAndSortedUsers.length === 0 ? (
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
                          action={
                            !searchQuery && onAddProfessor ? (
                              <button
                                type="button"
                                onClick={onAddProfessor}
                                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
                              >
                                <IconPlus className="w-3.5 h-3.5" />
                                <span>Invite Professor</span>
                              </button>
                            ) : null
                          }
                          className="border-none p-4"
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedUsers.map((u) => {
                      const isCurrent = u.id === currentUserId;

                      return (
                        <tr key={u.id} className="hover:bg-[#f8f9fa] transition-colors group">
                          {/* User column (frozen on md+ desktop only) */}
                          <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 border-r border-[#e8eaed] md:sticky md:left-0 bg-white group-hover:bg-[#f8f9fa] md:z-10 md:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                            <div className="flex items-center gap-3">
                              <UserAvatar
                                user={u}
                                className="w-8 h-8"
                                textClassName="text-xs font-bold"
                              />
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
                                <span className="truncate">{u.email}</span>
                                <button
                                  type="button"
                                  onClick={(e) => handleCopyEmail(u.email, e)}
                                  className="text-slate-400 hover:text-indigo-600 transition"
                                  title="Copy email"
                                >
                                  {copiedEmail === u.email ? (
                                    <IconCheck className="w-3 h-3 text-[#137333]" />
                                  ) : (
                                    <IconCopy className="w-3 h-3" />
                                  )}
                                </button>
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

                        <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 border-r border-[#e8eaed] whitespace-nowrap">
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

                        <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 border-r border-[#e8eaed] whitespace-nowrap">
                          {isCurrent ? (
                            <span className="text-xs text-[#70757a] italic">
                              Cannot change self
                            </span>
                          ) : (
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleUpdate && handleRoleUpdate(u.id, e.target.value)}
                              className="px-2.5 py-1 bg-white border border-[#dadce0] rounded-lg text-xs font-semibold text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#e8f0fe] cursor-pointer hover:border-[#bdc1c6] transition shadow-2xs"
                            >
                              <option value="STUDENT">Student</option>
                              <option value="PROFESSOR">Professor</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                          )}
                        </td>

                        <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 border-r border-[#e8eaed] whitespace-nowrap">
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

                        <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs text-[#70757a] border-r border-[#e8eaed] whitespace-nowrap">
                          {new Date(u.created_at).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>

                        <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-right whitespace-nowrap">
                          {!isCurrent &&
                            (u.is_active ? (
                              <button
                                type="button"
                                onClick={() => onDeactivate(u.id)}
                                className="px-2.5 py-1 text-xs text-[#c5221f] hover:bg-[#fce8e6] rounded-md font-medium transition cursor-pointer"
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onReactivate(u.id)}
                                className="px-2.5 py-1 text-xs text-[#137333] hover:bg-[#e6f4ea] rounded-md font-medium transition cursor-pointer"
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
        </>
      )}
    </div>
  );
}
