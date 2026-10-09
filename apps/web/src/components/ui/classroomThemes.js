// apps/web/src/components/ui/classroomThemes.js

export const CLASSROOM_THEMES = [
  {
    id: "blue",
    name: "Sapphire Blue",
    bannerBg: "bg-linear-to-r from-[#1967d2] to-[#1a73e8]",
    bannerText: "text-white",
    subText: "text-[#d2e3fc]",
    chipBg: "bg-white/20 text-white",
    badgeVariant: "primary",
    accentHex: "#1a73e8",
  },
  {
    id: "green",
    name: "Classroom Green",
    bannerBg: "bg-linear-to-r from-[#137333] to-[#1e8e3e]",
    bannerText: "text-white",
    subText: "text-[#ceead6]",
    chipBg: "bg-white/20 text-white",
    badgeVariant: "success",
    accentHex: "#137333",
  },
  {
    id: "purple",
    name: "Mulberry Purple",
    bannerBg: "bg-linear-to-r from-[#7627bb] to-[#8430ce]",
    bannerText: "text-white",
    subText: "text-[#e9d2fd]",
    chipBg: "bg-white/20 text-white",
    badgeVariant: "purple",
    accentHex: "#7627bb",
  },
  {
    id: "teal",
    name: "Ocean Teal",
    bannerBg: "bg-linear-to-r from-[#007b83] to-[#0097a7]",
    bannerText: "text-white",
    subText: "text-[#b2ebf2]",
    chipBg: "bg-white/20 text-white",
    badgeVariant: "sky",
    accentHex: "#007b83",
  },
  {
    id: "amber",
    name: "Warm Ochre",
    bannerBg: "bg-linear-to-r from-[#b06000] to-[#e37400]",
    bannerText: "text-white",
    subText: "text-[#feefc3]",
    chipBg: "bg-white/20 text-white",
    badgeVariant: "warning",
    accentHex: "#b06000",
  },
  {
    id: "coral",
    name: "Coral Rose",
    bannerBg: "bg-linear-to-r from-[#b3261e] to-[#c5221f]",
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
