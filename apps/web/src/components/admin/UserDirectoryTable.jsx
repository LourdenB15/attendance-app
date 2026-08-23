// apps/web/src/components/admin/UserDirectoryTable.jsx
import { Badge } from "../ui/Badge";

export function UserDirectoryTable({
  users,
  currentUserId,
  roleFilter,
  onRoleFilterChange,
  onRefresh,
  onDeactivate,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Filter Role:
          </label>
          <select
            value={roleFilter}
            onChange={(e) => onRoleFilterChange(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Roles</option>
            <option value="PROFESSOR">Professors</option>
            <option value="STUDENT">Students</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
        >
          🔄 Refresh Directory
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] tracking-wider border-b border-slate-200 font-bold">
            <tr>
              <th className="px-5 py-3">Full Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Created</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-5 py-8 text-center text-slate-400 text-sm">
                  No users found in directory.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-3 font-semibold text-slate-800">{u.full_name}</td>
                  <td className="px-5 py-3 text-slate-600 text-xs font-mono">{u.email}</td>
                  <td className="px-5 py-3">
                    <Badge
                      variant={
                        u.role === "ADMIN"
                          ? "purple"
                          : u.role === "PROFESSOR"
                          ? "sky"
                          : "success"
                      }
                      size="xs"
                    >
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    {u.is_active ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Deactivated
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-400">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {u.is_active && u.id !== currentUserId && (
                      <button
                        type="button"
                        onClick={() => onDeactivate(u.id)}
                        className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-md font-medium transition"
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
