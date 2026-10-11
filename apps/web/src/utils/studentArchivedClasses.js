// apps/web/src/utils/studentArchivedClasses.js

export function getStudentArchivedIds(studentId) {
  if (!studentId || typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`student_archived_classes_${studentId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStudentArchivedIds(studentId, ids) {
  if (!studentId || typeof window === "undefined") return;
  try {
    localStorage.setItem(`student_archived_classes_${studentId}`, JSON.stringify(ids));
  } catch {
    // ignore
  }
}
