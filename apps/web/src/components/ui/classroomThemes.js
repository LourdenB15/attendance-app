// apps/web/src/components/ui/classroomThemes.js

export const CLASSROOM_THEMES = [
  {
    id: "blue",
    name: "Sapphire Blue",
    bannerBg: "bg-[#1967d2]",
    headerBg: "bg-[#1967d2]",
    gradient: "linear-gradient(135deg, #1967d2 0%, #1a73e8 100%)",
    bannerText: "text-white",
    subText: "text-[#d2e3fc]",
    chipBg: "bg-white/20 text-white",
    badgeVariant: "primary",
    accentHex: "#1a73e8",
  },
  {
    id: "green",
    name: "Classroom Green",
    bannerBg: "bg-[#137333]",
    headerBg: "bg-[#137333]",
    gradient: "linear-gradient(135deg, #137333 0%, #1e8e3e 100%)",
    bannerText: "text-white",
    subText: "text-[#ceead6]",
    chipBg: "bg-white/20 text-white",
    badgeVariant: "success",
    accentHex: "#137333",
  },
  {
    id: "purple",
    name: "Mulberry Purple",
    bannerBg: "bg-[#7627bb]",
    headerBg: "bg-[#7627bb]",
    gradient: "linear-gradient(135deg, #7627bb 0%, #8430ce 100%)",
    bannerText: "text-white",
    subText: "text-[#e9d2fd]",
    chipBg: "bg-white/20 text-white",
    badgeVariant: "purple",
    accentHex: "#7627bb",
  },
  {
    id: "teal",
    name: "Ocean Teal",
    bannerBg: "bg-[#007b83]",
    headerBg: "bg-[#007b83]",
    gradient: "linear-gradient(135deg, #007b83 0%, #0097a7 100%)",
    bannerText: "text-white",
    subText: "text-[#b2ebf2]",
    chipBg: "bg-white/20 text-white",
    badgeVariant: "sky",
    accentHex: "#007b83",
  },
  {
    id: "amber",
    name: "Warm Ochre",
    bannerBg: "bg-[#b06000]",
    headerBg: "bg-[#b06000]",
    gradient: "linear-gradient(135deg, #b06000 0%, #e37400 100%)",
    bannerText: "text-white",
    subText: "text-[#feefc3]",
    chipBg: "bg-white/20 text-white",
    badgeVariant: "warning",
    accentHex: "#b06000",
  },
  {
    id: "coral",
    name: "Coral Rose",
    bannerBg: "bg-[#b3261e]",
    headerBg: "bg-[#b3261e]",
    gradient: "linear-gradient(135deg, #b3261e 0%, #c5221f 100%)",
    bannerText: "text-white",
    subText: "text-[#fad2cf]",
    chipBg: "bg-white/20 text-white",
    badgeVariant: "danger",
    accentHex: "#c5221f",
  },
];

export function getClassTheme(identifier = "") {
  const str = String(identifier || "");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % CLASSROOM_THEMES.length;
  return CLASSROOM_THEMES[index];
}
