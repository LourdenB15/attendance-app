// apps/web/src/utils/classFormatting.js

/**
 * Formats class title and section into uniform "COURSE - SECTION" display.
 * Automatically avoids duplicate suffixes if the class name already ends with the section.
 */
export function formatClassDisplayName(name = "", section = "") {
  const trimmedName = (name || "").trim();
  const trimmedSection = (section || "").trim().toUpperCase();
  if (!trimmedSection) return trimmedName;
  if (!trimmedName) return trimmedSection;

  const lowerName = trimmedName.toLowerCase();
  const lowerSection = trimmedSection.toLowerCase();

  if (
    lowerName.endsWith(`- ${lowerSection}`) ||
    lowerName.endsWith(`-${lowerSection}`) ||
    lowerName.endsWith(`– ${lowerSection}`) ||
    lowerName.endsWith(`— ${lowerSection}`)
  ) {
    return trimmedName;
  }

  return `${trimmedName} - ${trimmedSection}`;
}
