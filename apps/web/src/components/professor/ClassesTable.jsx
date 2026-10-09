// apps/web/src/components/professor/ClassesTable.jsx
import { useState } from "react";
import { Badge } from "../ui/Badge";
import { classesApi } from "../../api";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/useConfirm";
import { getClassTheme } from "../ui/classroomThemes";
import { Modal } from "../ui/Modal";
import { EmptyState } from "../ui/EmptyState";
import {
  IconGrid,
  IconList,
  IconCopy,
  IconCheck,
  IconClassroom,
  IconSearch,
} from "../ui/Icons";

export function ClassesTable({ classes = [], onSelectClass, onRefresh }) {
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"
  const [searchQuery, setSearchQuery] = useState("");
  const [listTab, setListTab] = useState("active"); // "active" | "archived"
  const [editingClass, setEditingClass] = useState(null);
  const [editName, setEditName] = useState("");
  const [editSemester, setEditSemester] = useState("");
  const [editSection, setEditSection] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const { showToast } = useToast();
  const confirm = useConfirm();

  const activeClasses = classes.filter((c) => !c.is_archived);
  const archivedClasses = classes.filter((c) => c.is_archived);
  const pool = listTab === "archived" ? archivedClasses : activeClasses;

  const visibleClasses = pool.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.section && c.section.toLowerCase().includes(q)) ||
      (c.semester && c.semester.toLowerCase().includes(q)) ||
      (c.join_code && c.join_code.toLowerCase().includes(q))
    );
  });

  const startEdit = (cls) => {
    setEditingClass(cls);
    setEditName(cls.name || "");
    setEditSemester(cls.semester || "");
    setEditSection(cls.section || "");
  };

  const hasEditChanges =
    editingClass !== null &&
    (editName.trim() !== (editingClass.name || "") ||
      editSemester.trim() !== (editingClass.semester || "") ||
      editSection.trim() !== (editingClass.section || ""));

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingClass || !hasEditChanges) return;
    try {
      await classesApi.updateClass(editingClass.id, {
        name: editName,
        semester: editSemester,
        section: editSection,
      });
      showToast("success", "Class updated successfully.");
      setEditingClass(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast("error", err.message);
    }
  };

  const handleArchive = async (cls) => {
    const confirmed = await confirm({
      title: "Archive this class?",
      message: `${cls.name} will move to the Archived section. Students won't be able to join and sessions cannot be opened until restored.`,
      confirmLabel: "Archive Class",
    });
    if (!confirmed) return;
    try {
      await classesApi.archiveClass(cls.id);
      showToast("success", "Class archived successfully.");
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast("error", err.message);
    }
  };

  const handleUnarchive = async (classId) => {
    try {
      await classesApi.unarchiveClass(classId);
      showToast("success", "Class restored to active teaching.");
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast("error", err.message);
    }
  };

  const handleCopyJoinCode = (e, code, classId) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedId(classId);
    showToast("info", `Join code "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & View Controls */}
      <div className="bg-white border border-[#dadce0] rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        {/* Segmented Tab Toggle: Active vs Archived */}
        <div className="flex bg-[#f1f3f4] p-1 rounded-lg text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setListTab("active")}
            className={`px-3.5 py-1.5 rounded-md transition-all ${
              listTab === "active"
                ? "bg-white text-[#1a73e8] shadow-xs font-bold"
                : "text-[#5f6368] hover:text-[#202124]"
            }`}
          >
            Active Classes ({activeClasses.length})
          </button>
          <button
            type="button"
            onClick={() => setListTab("archived")}
            className={`px-3.5 py-1.5 rounded-md transition-all ${
              listTab === "archived"
                ? "bg-white text-[#1a73e8] shadow-xs font-bold"
                : "text-[#5f6368] hover:text-[#202124]"
            }`}
          >
            Archived ({archivedClasses.length})
          </button>
        </div>

        {/* Search & Grid/Table View Switcher */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <IconSearch className="w-4 h-4 text-[#5f6368] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search classes or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 bg-[#f8f9fa] hover:bg-white border border-[#dadce0] rounded-lg text-xs text-[#202124] placeholder-[#80868b] focus:bg-white focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#e8f0fe] transition-all"
            />
          </div>

          <div className="flex items-center border border-[#dadce0] rounded-lg p-0.5 bg-[#f8f9fa] shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-[#1a73e8] shadow-2xs"
                  : "text-[#5f6368] hover:text-[#202124]"
              }`}
              title="Card Grid View"
              aria-label="Card Grid View"
            >
              <IconGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "table"
                  ? "bg-white text-[#1a73e8] shadow-2xs"
                  : "text-[#5f6368] hover:text-[#202124]"
              }`}
              title="Table View"
              aria-label="Table View"
            >
              <IconList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Classes Presentation */}
      {visibleClasses.length === 0 ? (
        <EmptyState
          icon={<IconClassroom className="w-7 h-7" />}
          title={
            searchQuery
              ? "No classes match your search"
              : listTab === "archived"
              ? "No archived classes"
              : "No active classes yet"
          }
          description={
            searchQuery
              ? `No classes found matching "${searchQuery}". Try a different keyword.`
              : listTab === "archived"
              ? "Classes you archive will appear here for reference or unarchiving."
              : "Create your first classroom section to start taking biometric attendance."
          }
        />
      ) : viewMode === "grid" ? (
        /* GOOGLE CLASSROOM CARD GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleClasses.map((cls) => {
            const theme = getClassTheme(cls.id || cls.name);
            const isArchived = Boolean(cls.is_archived);

            return (
              <div
                key={cls.id}
                onClick={isArchived ? undefined : () => onSelectClass && onSelectClass(cls)}
                className={`gc-card rounded-2xl overflow-hidden flex flex-col justify-between group text-left ${
                  isArchived ? "opacity-75 cursor-default" : "cursor-pointer"
                }`}
              >
                {/* Course Header Banner */}
                <div className={`${theme.bannerBg} p-5 relative select-none`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4
                        className="text-base font-bold text-white leading-tight truncate group-hover:underline"
                        title={cls.name}
                      >
                        {cls.name}
                      </h4>
                      <p className={`text-xs ${theme.subText} mt-1 font-medium truncate`}>
                        {cls.section} • {cls.semester}
                      </p>
                    </div>

                    {isArchived ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white backdrop-blur-xs">
                        Archived
                      </span>
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
                    )}
                  </div>
                </div>

                {/* Course Card Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white gap-4">
                  {/* Join Code Widget */}
                  <div className="flex items-center justify-between bg-[#f8f9fa] border border-[#dadce0] rounded-xl px-3 py-2">
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-[#70757a]">
                        Student Join Code
                      </span>
                      <code className="text-xs font-mono font-bold text-[#202124]">
                        {cls.join_code}
                      </code>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleCopyJoinCode(e, cls.join_code, cls.id)}
                      className="p-1.5 rounded-lg hover:bg-white text-[#5f6368] hover:text-[#1a73e8] border border-transparent hover:border-[#dadce0] transition shadow-2xs flex items-center gap-1 text-[11px] font-medium"
                      title="Copy join code"
                    >
                      {copiedId === cls.id ? (
                        <>
                          <IconCheck className="w-3.5 h-3.5 text-[#137333]" />
                          <span className="text-[#137333] font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <IconCopy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-2 border-t border-[#e8eaed] flex items-center justify-between gap-2">
                    {isArchived ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnarchive(cls.id);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-[#1a73e8] hover:bg-[#e8f0fe] rounded-lg transition"
                      >
                        Restore Class
                      </button>
                    ) : (
                      <>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(cls);
                            }}
                            className="px-2.5 py-1 text-xs font-medium text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124] rounded-md transition"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchive(cls);
                            }}
                            className="px-2.5 py-1 text-xs font-medium text-[#c5221f] hover:bg-[#fce8e6] rounded-md transition"
                          >
                            Archive
                          </button>
                        </div>

                        <span className="text-xs font-semibold text-[#1a73e8] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                          <span>Open Class</span>
                          <span>→</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* GOOGLE CLASSROOM TABLE VIEW */
        <div className="bg-white rounded-xl shadow-xs border border-[#dadce0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f8f9fa] text-[#5f6368] uppercase text-[11px] tracking-wider border-b border-[#dadce0] font-semibold">
                <tr>
                  <th className="px-5 py-3">Class Name</th>
                  <th className="px-5 py-3">Semester</th>
                  <th className="px-5 py-3">Section</th>
                  <th className="px-5 py-3">Join Code</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8eaed]">
                {visibleClasses.map((cls) => (
                  <tr
                    key={cls.id}
                    onClick={cls.is_archived ? undefined : () => onSelectClass && onSelectClass(cls)}
                    className={
                      cls.is_archived
                        ? ""
                        : "hover:bg-[#f8f9fa] cursor-pointer transition-colors"
                    }
                  >
                    <td className="px-5 py-3.5 font-semibold text-[#202124] hover:text-[#1a73e8]">
                      {cls.name}
                    </td>
                    <td className="px-5 py-3.5 text-[#5f6368]">{cls.semester}</td>
                    <td className="px-5 py-3.5 text-[#5f6368]">{cls.section}</td>
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={(e) => handleCopyJoinCode(e, cls.join_code, cls.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#f1f3f4] hover:bg-[#e8f0fe] hover:text-[#1a73e8] border border-[#dadce0] text-[#202124] font-mono font-bold rounded-lg text-xs transition"
                        title="Click to copy join code"
                      >
                        {copiedId === cls.id ? (
                          <>
                            <IconCheck className="w-3.5 h-3.5 text-[#137333]" />
                            <span className="text-[#137333]">Copied!</span>
                          </>
                        ) : (
                          <>
                            <span>{cls.join_code}</span>
                            <IconCopy className="w-3 h-3 text-[#5f6368]" />
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      {cls.is_archived ? (
                        <Badge variant="default" size="xs">Archived</Badge>
                      ) : (
                        <Badge variant="success" size="xs" dot>Active</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1">
                      {cls.is_archived ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnarchive(cls.id);
                          }}
                          className="px-3 py-1 bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#202124] rounded-lg text-xs font-semibold transition"
                        >
                          Unarchive
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(cls);
                            }}
                            className="px-2.5 py-1 text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124] rounded-md text-xs font-medium transition"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchive(cls);
                            }}
                            className="px-2.5 py-1 text-[#c5221f] hover:bg-[#fce8e6] rounded-md text-xs font-medium transition"
                          >
                            Archive
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      <Modal
        isOpen={Boolean(editingClass)}
        onClose={() => setEditingClass(null)}
        title={`Edit Class: ${editingClass?.name || ""}`}
        subtitle="Update course details and section metadata"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-1.5">
              Class Name
            </label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#dadce0] rounded-lg text-sm text-[#202124] focus:border-[#1a73e8] focus:outline-none focus:ring-3 focus:ring-[#e8f0fe] transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-1.5">
              Semester
            </label>
            <input
              type="text"
              required
              value={editSemester}
              onChange={(e) => setEditSemester(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#dadce0] rounded-lg text-sm text-[#202124] focus:border-[#1a73e8] focus:outline-none focus:ring-3 focus:ring-[#e8f0fe] transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-1.5">
              Section
            </label>
            <input
              type="text"
              required
              value={editSection}
              onChange={(e) => setEditSection(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#dadce0] rounded-lg text-sm text-[#202124] focus:border-[#1a73e8] focus:outline-none focus:ring-3 focus:ring-[#e8f0fe] transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e8eaed]">
            <button
              type="button"
              onClick={() => setEditingClass(null)}
              className="px-4 py-2 text-xs font-semibold text-[#5f6368] hover:bg-[#f1f3f4] rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!hasEditChanges}
              className="px-5 py-2 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white font-semibold rounded-lg text-xs shadow-xs transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
