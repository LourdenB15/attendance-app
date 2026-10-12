// apps/web/src/components/professor/ClassesTable.jsx
import { useState, useMemo, useEffect } from "react";
import { Badge } from "../ui/Badge";
import { classesApi } from "../../api";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/useConfirm";
import { getClassTheme } from "../ui/classroomThemes";
import { Modal } from "../ui/Modal";
import { EmptyState } from "../ui/EmptyState";
import { TableSkeleton, ClassGridSkeleton } from "../ui/Skeleton";
import {
  IconGrid,
  IconList,
  IconCopy,
  IconCheck,
  IconClassroom,
  IconSearch,
  IconDotsVertical,
  IconArchive,
  IconPencil,
  IconRefresh,
  IconExpand,
  IconPlus,
} from "../ui/Icons";

export function ClassesTable({
  classes = [],
  onSelectClass,
  onCreateClass,
  onRefresh,
  initialTab = "active",
  loading = false,
}) {
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"
  const [searchQuery, setSearchQuery] = useState("");
  const [listTab, setListTab] = useState(initialTab);
  const [sortField, setSortField] = useState("name"); // "name" | "semester" | "section" | "join_code" | "status"
  const [sortAsc, setSortAsc] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [presentingClass, setPresentingClass] = useState(null);

  // Close 3-dot menu on click outside
  useEffect(() => {
    if (!openMenuId) return;
    const handleClickOutside = (e) => {
      if (!e.target.closest("[data-menu-dropdown]")) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openMenuId]);

  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);
  if (initialTab !== prevInitialTab) {
    setPrevInitialTab(initialTab);
    setListTab(initialTab);
  }

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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const visibleClasses = useMemo(() => {
    let list = pool.filter((c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.section && c.section.toLowerCase().includes(q)) ||
        (c.semester && c.semester.toLowerCase().includes(q)) ||
        (c.join_code && c.join_code.toLowerCase().includes(q))
      );
    });

    list.sort((a, b) => {
      let valA = a[sortField] || "";
      let valB = b[sortField] || "";

      if (sortField === "status") {
        valA = a.is_archived ? 1 : 0;
        valB = b.is_archived ? 1 : 0;
      } else if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return list;
  }, [pool, searchQuery, sortField, sortAsc]);

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

  const startEdit = (cls) => {
    setEditingClass(cls);
    setEditName(cls.name || "");
    setEditSemester(cls.semester || "");
    setEditSection(cls.section || "");
    setOpenMenuId(null);
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
    setOpenMenuId(null);
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
    setOpenMenuId(null);
    try {
      await classesApi.unarchiveClass(classId);
      showToast("success", "Class restored to active teaching list.");
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast("error", err.message);
    }
  };

  const handleCopyJoinCode = (e, code, id) => {
    e.stopPropagation();
    if (!code || copiedId === id) return;
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    showToast("info", `Class code "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & View Controls */}
      <div className="bg-white border border-[#dadce0] rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        {/* Segmented Tab Toggle: Active vs Archived */}
        <div className="flex bg-[#f1f3f4] p-1 rounded-lg text-xs font-semibold overflow-x-auto scrollbar-none whitespace-nowrap shrink-0">
          <button
            type="button"
            onClick={() => setListTab("active")}
            className={`px-3.5 py-1.5 rounded-md transition-all whitespace-nowrap cursor-pointer ${
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
            className={`px-3.5 py-1.5 rounded-md transition-all whitespace-nowrap cursor-pointer ${
              listTab === "archived"
                ? "bg-white text-[#1a73e8] shadow-xs font-bold"
                : "text-[#5f6368] hover:text-[#202124]"
            }`}
          >
            Archived ({archivedClasses.length})
          </button>
        </div>

        {/* Search & Grid/Table View Switcher */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <IconSearch className="w-4 h-4 text-[#5f6368] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search classes or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-7 py-2 sm:py-1.5 bg-[#f8f9fa] hover:bg-white border border-[#dadce0] rounded-lg text-xs text-[#202124] placeholder-[#80868b] focus:bg-white focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#e8f0fe] transition-all"
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

          <div className="flex items-center border border-[#dadce0] rounded-lg p-0.5 bg-[#f8f9fa] shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
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
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-[#1a73e8] shadow-2xs"
                  : "text-[#5f6368] hover:text-[#202124]"
              }`}
              title="Spreadsheet Table View"
              aria-label="Spreadsheet Table View"
            >
              <IconList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        viewMode === "grid" ? (
          <ClassGridSkeleton count={6} />
        ) : (
          <div className="bg-white rounded-xl shadow-xs border border-[#dadce0] overflow-hidden">
            <TableSkeleton
              rows={5}
              cols={6}
              headers={["Class Name", "Semester", "Section", "Join Code", "Status", "Actions"]}
            />
          </div>
        )
      ) : visibleClasses.length === 0 ? (
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
          action={
            !searchQuery && listTab === "active" && onCreateClass ? (
              <button
                type="button"
                onClick={onCreateClass}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
              >
                <IconPlus className="w-4 h-4" />
                <span>Create Your First Class</span>
              </button>
            ) : null
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
                className={`bg-white rounded-2xl border border-[#dadce0] transition-all duration-200 flex flex-col group relative ${
                  openMenuId === cls.id ? "z-30" : "z-0"
                } ${
                  isArchived
                    ? "opacity-80"
                    : "hover:shadow-md hover:border-[#bdc1c6] cursor-pointer"
                }`}
              >
                {/* Colored Top Header Tile */}
                <div
                  style={{ background: theme.gradient, backgroundColor: theme.accentHex }}
                  className={`p-5 text-white flex flex-col justify-between min-h-[120px] relative rounded-t-2xl ${theme.headerBg || theme.bannerBg}`}
                >
                  <div className="absolute inset-0 overflow-hidden rounded-t-2xl pointer-events-none">
                    <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-15">
                      <IconClassroom className="w-28 h-28" />
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-3 relative z-10">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-lg sm:text-xl leading-tight truncate group-hover:underline">
                        {cls.name}
                      </h3>
                      <p className="text-xs text-white/90 font-medium mt-0.5 truncate">
                        Section {cls.section}
                      </p>
                    </div>

                    <div className="relative shrink-0" data-menu-dropdown>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === cls.id ? null : cls.id);
                        }}
                        className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition cursor-pointer"
                        title="Class options"
                        aria-label="Class options"
                      >
                        <IconDotsVertical className="w-5 h-5" />
                      </button>

                      {openMenuId === cls.id && (
                        <div
                          className="absolute right-0 top-full mt-1.5 w-40 bg-white rounded-xl shadow-xl border border-[#dadce0] py-1 z-50 text-[#202124] text-xs font-medium animate-in fade-in zoom-in-95 duration-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {!isArchived ? (
                            <>
                              <button
                                type="button"
                                onClick={() => startEdit(cls)}
                                className="w-full text-left px-3 py-2 hover:bg-[#f1f3f4] flex items-center gap-2.5 transition text-[#202124] cursor-pointer"
                              >
                                <IconPencil className="w-3.5 h-3.5 text-[#5f6368]" />
                                <span>Edit details</span>
                              </button>
                              <button
                                type="button"
                                disabled={copiedId === cls.id}
                                onClick={(e) => handleCopyJoinCode(e, cls.join_code, cls.id)}
                                className="w-full text-left px-3 py-2 hover:bg-[#f1f3f4] flex items-center gap-2.5 transition text-[#202124] cursor-pointer disabled:cursor-default"
                              >
                                <IconCopy className="w-3.5 h-3.5 text-[#5f6368]" />
                                <span>{copiedId === cls.id ? "Copied" : "Copy code"}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleArchive(cls)}
                                className="w-full text-left px-3 py-2 hover:bg-[#f1f3f4] flex items-center gap-2.5 transition text-[#202124] cursor-pointer"
                              >
                                <IconArchive className="w-3.5 h-3.5 text-[#5f6368]" />
                                <span>Archive</span>
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUnarchive(cls.id)}
                              className="w-full text-left px-3 py-2 hover:bg-[#f1f3f4] flex items-center gap-2.5 transition text-[#202124] cursor-pointer"
                            >
                              <IconRefresh className="w-3.5 h-3.5 text-[#5f6368]" />
                              <span>Restore</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative z-10 flex items-center justify-between text-xs text-white/90 pt-3">
                    <span className="font-medium truncate">{cls.semester}</span>
                    {isArchived ? (
                      <span className="bg-black/25 px-2 py-0.5 rounded text-[11px] font-semibold">
                        Archived
                      </span>
                    ) : (
                      <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-semibold">
                        Active
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
                  {/* Dedicated Join Code Block */}
                  <div className="bg-[#f8f9fa] rounded-xl p-3 border border-[#e8eaed] flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-[#5f6368] uppercase tracking-wider block">
                        Student Join Code
                      </span>
                      <span
                        onClick={(e) => handleCopyJoinCode(e, cls.join_code, cls.id)}
                        className="font-mono text-sm sm:text-base font-extrabold text-[#202124] tracking-wider select-all cursor-pointer hover:text-[#1a73e8] transition-colors truncate block"
                        title="Click to copy join code"
                      >
                        {cls.join_code}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={copiedId === cls.id}
                        onClick={(e) => handleCopyJoinCode(e, cls.join_code, cls.id)}
                        className="p-1.5 rounded-lg bg-white hover:bg-[#e8f0fe] hover:text-[#1a73e8] border border-[#dadce0] text-[#5f6368] transition cursor-pointer shadow-2xs disabled:cursor-default"
                        title="Copy join code"
                        aria-label="Copy join code"
                      >
                        {copiedId === cls.id ? (
                          <IconCheck className="w-4 h-4 text-[#137333]" />
                        ) : (
                          <IconCopy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPresentingClass(cls);
                        }}
                        className="p-1.5 rounded-lg bg-white hover:bg-[#e8f0fe] hover:text-[#1a73e8] border border-[#dadce0] text-[#5f6368] transition cursor-pointer shadow-2xs"
                        title="Project / Present code for classroom"
                        aria-label="Present code"
                      >
                        <IconExpand className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-3 border-t border-[#f1f3f4] flex items-center justify-between">
                    {isArchived ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnarchive(cls.id);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1a73e8] hover:underline cursor-pointer"
                      >
                        <IconRefresh className="w-3.5 h-3.5" />
                        <span>Restore Class</span>
                      </button>
                    ) : (
                      <div className="w-full flex items-center justify-between text-xs font-semibold text-[#1a73e8] group-hover:text-[#1557b0] transition">
                        <span>Enter Teaching Hub</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* SPREADSHEET TABLE VIEW */
        <div className="bg-white rounded-xl shadow-xs border border-[#dadce0] overflow-hidden">
          {/* Mobile phone swipe hint */}
          <div className="sm:hidden px-4 py-2 bg-[#f1f3f4] border-b border-[#dadce0] text-[11px] text-[#5f6368] flex items-center justify-between">
            <span>↔ Swipe horizontally for full spreadsheet</span>
            <span className="text-[10px] font-semibold text-[#1a73e8]">Class Name frozen</span>
          </div>

          <div className="overflow-x-auto relative">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-[#f8f9fa] text-[#5f6368] uppercase text-[11px] tracking-wider border-b border-[#dadce0] font-semibold sticky top-0 z-10 shadow-2xs">
                <tr>
                  <th
                    onClick={() => handleSort("name")}
                    className="px-5 py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition sticky left-0 bg-[#f8f9fa] z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] min-w-[180px]"
                  >
                    <div className="flex items-center justify-between">
                      <span>Class Name</span>
                      {renderSortIndicator("name")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("semester")}
                    className="px-5 py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition min-w-[120px]"
                  >
                    <div className="flex items-center justify-between">
                      <span>Semester</span>
                      {renderSortIndicator("semester")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("section")}
                    className="px-5 py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition min-w-[100px]"
                  >
                    <div className="flex items-center justify-between">
                      <span>Section</span>
                      {renderSortIndicator("section")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("join_code")}
                    className="px-5 py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition min-w-[120px]"
                  >
                    <div className="flex items-center justify-between">
                      <span>Join Code</span>
                      {renderSortIndicator("join_code")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("status")}
                    className="px-5 py-3 border-r border-[#dadce0]/70 cursor-pointer select-none hover:bg-[#e8eaed] transition min-w-[100px]"
                  >
                    <div className="flex items-center justify-between">
                      <span>Status</span>
                      {renderSortIndicator("status")}
                    </div>
                  </th>
                  <th className="px-5 py-3 text-right min-w-[140px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8eaed] bg-white">
                {visibleClasses.map((cls) => (
                  <tr
                    key={cls.id}
                    onClick={cls.is_archived ? undefined : () => onSelectClass && onSelectClass(cls)}
                    className={`group transition-colors ${
                      cls.is_archived
                        ? "opacity-75"
                        : "hover:bg-[#f8f9fa] cursor-pointer"
                    }`}
                  >
                    {/* Sticky frozen Class Name column */}
                    <td className="px-5 py-3.5 font-semibold text-[#202124] group-hover:text-[#1a73e8] border-r border-[#e8eaed] sticky left-0 bg-white group-hover:bg-[#f8f9fa] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                      {cls.name}
                    </td>
                    <td className="px-5 py-3.5 text-[#5f6368] border-r border-[#e8eaed]">
                      {cls.semester}
                    </td>
                    <td className="px-5 py-3.5 text-[#5f6368] border-r border-[#e8eaed]">
                      {cls.section}
                    </td>
                    <td className="px-5 py-3.5 border-r border-[#e8eaed]">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={copiedId === cls.id}
                          onClick={(e) => handleCopyJoinCode(e, cls.join_code, cls.id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#f1f3f4] hover:bg-[#e8f0fe] hover:text-[#1a73e8] border border-[#dadce0] text-[#202124] font-mono font-bold rounded-lg text-xs transition cursor-pointer disabled:cursor-default"
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
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPresentingClass(cls);
                          }}
                          className="p-1.5 rounded-lg text-[#5f6368] hover:text-[#1a73e8] hover:bg-[#e8f0fe] border border-transparent hover:border-[#dadce0] transition cursor-pointer"
                          title="Present / Enlarge code"
                          aria-label="Present code"
                        >
                          <IconExpand className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 border-r border-[#e8eaed]">
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
                          className="px-3 py-1 bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#202124] rounded-lg text-xs font-semibold transition cursor-pointer"
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
                            className="px-2.5 py-1 text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124] rounded-md text-xs font-medium transition cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchive(cls);
                            }}
                            className="px-2.5 py-1 text-[#c5221f] hover:bg-[#fce8e6] rounded-md text-xs font-medium transition cursor-pointer"
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
              className="px-4 py-2 text-xs font-semibold text-[#5f6368] hover:bg-[#f1f3f4] rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!hasEditChanges}
              className="px-5 py-2 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white font-semibold rounded-lg text-xs shadow-xs transition cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Classroom Code Projector Modal */}
      <Modal
        isOpen={Boolean(presentingClass)}
        onClose={() => setPresentingClass(null)}
        title="Class Join Code"
        subtitle={
          presentingClass
            ? `${presentingClass.name} • Section ${presentingClass.section}`
            : ""
        }
        maxWidth="max-w-lg"
      >
        {presentingClass && (
          <div className="text-center py-4 space-y-5">
            <p className="text-xs text-[#5f6368] font-semibold uppercase tracking-wider">
              Display to Students in Class
            </p>

            <div className="bg-[#f8f9fa] border-2 border-dashed border-[#dadce0] rounded-2xl py-6 px-4">
              <span className="font-mono text-4xl sm:text-6xl font-black tracking-widest text-[#1a73e8] select-all block break-all">
                {presentingClass.join_code}
              </span>
            </div>

            <p className="text-xs text-[#5f6368] max-w-sm mx-auto leading-relaxed">
              Instruct your students to open their student dashboard, click <strong>&quot;Join Class&quot;</strong>, and enter this code to join your roster.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={copiedId === presentingClass.id}
                onClick={(e) =>
                  handleCopyJoinCode(e, presentingClass.join_code, presentingClass.id)
                }
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer disabled:cursor-default min-h-[40px]"
              >
                {copiedId === presentingClass.id ? (
                  <>
                    <IconCheck className="w-4 h-4 text-white" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <IconCopy className="w-4 h-4 text-white" />
                    <span>Copy Join Code</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setPresentingClass(null)}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#202124] rounded-xl text-xs font-semibold transition cursor-pointer min-h-[40px]"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
