// apps/web/src/components/ui/UserAvatar.jsx
import { useState } from "react";

const AVATAR_COLORS = [
  "bg-[#1a73e8]", // Google Blue
  "bg-[#0d652d]", // Dark Emerald
  "bg-[#e37400]", // Warm Amber
  "bg-[#7b1fa2]", // Royal Purple
  "bg-[#007b83]", // Teal
  "bg-[#188038]", // Green
  "bg-[#b31412]", // Ruby
  "bg-[#3f51b5]", // Indigo
  "bg-[#d81b60]", // Rose
];

function getAvatarColor(seed = "") {
  if (!seed) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function UserAvatar({
  user,
  className = "w-8 h-8",
  textClassName = "text-xs font-bold",
}) {
  const [imgFailed, setImgFailed] = useState(false);

  const email = user?.email?.toLowerCase() || "";
  const cachedAvatar =
    typeof window !== "undefined" && email
      ? localStorage.getItem(`user_avatar_${email}`)
      : null;

  // 1. Direct avatar from database record, Google auth payload, or cached device storage
  let avatarSrc =
    user?.avatar_url ||
    user?.avatar ||
    user?.picture ||
    user?.photo_url ||
    cachedAvatar;

  // 2. Fallback unavatar query for non-empty emails if no direct avatar is available
  if (!avatarSrc && email && !imgFailed) {
    if (email.endsWith("@gmail.com")) {
      avatarSrc = `https://unavatar.io/google/${encodeURIComponent(email)}?fallback=false`;
    } else {
      avatarSrc = `https://unavatar.io/${encodeURIComponent(email)}?fallback=false`;
    }
  }

  const initial = user?.full_name ? user.full_name[0].toUpperCase() : "U";
  const bgColorClass = getAvatarColor(email || user?.full_name || "user");

  if (avatarSrc && !imgFailed) {
    return (
      <img
        src={avatarSrc}
        alt={user?.full_name || "User Avatar"}
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
        className={`${className} rounded-full object-cover shrink-0 border border-black/10 shadow-2xs`}
      />
    );
  }

  return (
    <div
      className={`${className} rounded-full ${bgColorClass} text-white flex items-center justify-center shrink-0 shadow-2xs ${textClassName}`}
      title={user?.full_name || email || "User"}
    >
      {initial}
    </div>
  );
}
