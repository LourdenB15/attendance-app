// apps/web/src/components/professor/EnrolledStudentsTable.jsx
import { useState } from "react";
import { Badge } from "../ui/Badge";
import { classesApi } from "../../api";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/useConfirm";
import { EmptyState } from "../ui/EmptyState";
import {
  IconUsers,
  IconSearch,
  IconCopy,
  IconCheck,
} from "../ui/Icons";

export function EnrolledStudentsTable({
  classId,
  joinCode,
  students = [],
  onStudentDropped,
}) {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [listTab, setListTab] = useState("active"); // "active" | "dropped"
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const activeStudents = students.filter((s) => s.status === "ACTIVE");
  const droppedStudents = students.filter((s) => s.status === "DROPPED");
  const pool = listTab === "dropped" ? droppedStudents : activeStudents;

  const visibleStudents = pool.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s.full_name && s.full_name.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q))
    );
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(joinCode);
    setCopied(true);
    showToast("info", `Class join code "${joinCode}" copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDrop = async (student) => {
    const confirmed = await confirm({
      title: "Drop this student?",
      message: `${student.full_name} will be removed from this class roster and won't be able to rejoin with the join code unless restored.`,
      confirmLabel: "Drop Student",
      danger: true,
    });
    if (!confirmed) return;
    try {
      await classesApi.dropStudent(classId, student.student_id);
      showToast("success", "Student dropped from class.");
      if (onStudentDropped) onStudentDropped();
    } catch (err) {
      showToast("error", err.message);
    }
  };

  const handleRestore = async (student) => {
    try {
      await classesApi.restoreStudent(classId, student.student_id);
      showToast("success", `${student.full_name} restored to the class.`);
      if (onStudentDropped) onStudentDropped();
    } catch (err) {
      showToast("error", err.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-[#dadce0] overflow-hidden">
      {/* Top Banner: Invite & Join Code */}
      <div className="p-5 border-b border-[#dadce0] bg-[#f8f9fa] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold text-[#202124]">Class Roster</h4>
          <p className="text-xs text-[#5f6368] mt-0.5">
            Students who join your class section using the unique code will appear here.
          </p>
        </div>

        <div className="flex items-center gap-2.5 bg-white border border-[#dadce0] rounded-xl px-4 py-2 shadow-2xs">
          <span className="text-xs font-semibold text-[#5f6368]">Invite Code:</span>
          <code className="text-sm font-mono font-bold text-[#1a73e8] tracking-wider select-all">
            {joinCode}
          </code>
          <button
            type="button"
            onClick={handleCopyCode}
            className="p-1 rounded-md text-[#5f6368] hover:text-[#1a73e8] transition"
            title="Copy join code"
            aria-label="Copy join code"
          >
            {copied ? (
              <IconCheck className="w-4 h-4 text-[#137333]" />
            ) : (
              <IconCopy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="p-4 border-b border-[#dadce0] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex bg-[#f1f3f4] p-1 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setListTab("active")}
            className={`px-3.5 py-1.5 rounded-md transition-all ${
              listTab === "active"
                ? "bg-white text-[#1a73e8] shadow-xs font-bold"
                : "text-[#5f6368] hover:text-[#202124]"
            }`}
          >
            Active Students ({activeStudents.length})
          </button>
          <button
            type="button"
            onClick={() => setListTab("dropped")}
            className={`px-3.5 py-1.5 rounded-md transition-all ${
              listTab === "dropped"
                ? "bg-white text-[#1a73e8] shadow-xs font-bold"
                : "text-[#5f6368] hover:text-[#202124]"
            }`}
          >
            Dropped ({droppedStudents.length})
          </button>
        </div>

        <div className="relative sm:w-64">
          <IconSearch className="w-4 h-4 text-[#5f6368] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 bg-[#f8f9fa] border border-[#dadce0] rounded-lg text-xs text-[#202124] placeholder-[#80868b] focus:bg-white focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#e8f0fe] transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f8f9fa] text-[#5f6368] uppercase text-[11px] tracking-wider border-b border-[#dadce0] font-semibold">
            <tr>
              <th className="px-5 py-3">Student Name</th>
              <th className="px-5 py-3">Email Address</th>
              <th className="px-5 py-3">Enrolled Via</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Date Joined</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8eaed]">
            {visibleStudents.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center">
                  <EmptyState
                    icon={<IconUsers className="w-6 h-6" />}
                    title={
                      searchQuery
                        ? "No students match your query"
                        : listTab === "dropped"
                        ? "No dropped students"
                        : "No students enrolled yet"
                    }
                    description={
                      searchQuery
                        ? "Try clearing your search term."
                        : listTab === "dropped"
                        ? "Students removed from class will appear here."
                        : `Share the code "${joinCode}" with your students so they can enroll.`
                    }
                    className="border-none p-4"
                  />
                </td>
              </tr>
            ) : (
              visibleStudents.map((s) => (
                <tr key={s.student_id} className="hover:bg-[#f8f9fa] transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-[#202124]">
                    {s.full_name}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[#5f6368] font-mono">
                    {s.email}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[#5f6368]">
                    <span className="px-2 py-0.5 rounded-md bg-[#f1f3f4] text-[#3c4043] font-medium text-[11px]">
                      {s.enrolled_via || "Join Code"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge
                      variant={s.status === "ACTIVE" ? "success" : "default"}
                      size="xs"
                      dot
                    >
                      {s.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[#70757a]">
                    {new Date(s.enrolled_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {s.status === "ACTIVE" ? (
                      <button
                        type="button"
                        onClick={() => handleDrop(s)}
                        className="px-2.5 py-1 text-xs text-[#c5221f] hover:bg-[#fce8e6] rounded-md font-medium transition"
                      >
                        Drop
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRestore(s)}
                        className="px-2.5 py-1 text-xs text-[#1a73e8] hover:bg-[#e8f0fe] rounded-md font-medium transition"
                      >
                        Restore
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
