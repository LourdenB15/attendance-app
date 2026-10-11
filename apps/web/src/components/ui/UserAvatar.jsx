// apps/web/src/components/ui/UserAvatar.jsx
import { useState } from "react";

export function UserAvatar({
  user,
  className = "w-8 h-8",
  textClassName = "text-xs font-bold",
}) {
  const [imgFailed, setImgFailed] = useState(false);

  const email = user?.email?.toLowerCase() || "";
  const cachedAvatar =
    typeof window !== "undefined"
      ? localStorage.getItem(`user_avatar_${email}`)
      : null;

  // 1. Direct avatar from user payload or cached Google photo
  let avatarSrc =
    user?.avatar ||
    user?.picture ||
    user?.avatar_url ||
    user?.photo_url ||
    cachedAvatar;

  // 2. Auto-fetch avatar for Gmail / Google Workspace users if not already cached
  if (!avatarSrc && email) {
    if (email.endsWith("@gmail.com")) {
      avatarSrc = `https://unavatar.io/google/${encodeURIComponent(email)}?fallback=false`;
    } else {
      avatarSrc = `https://unavatar.io/${encodeURIComponent(email)}?fallback=false`;
    }
  }

  const initial = user?.full_name ? user.full_name[0].toUpperCase() : "U";

  if (avatarSrc && !imgFailed) {
    return (
      <img
        src={avatarSrc}
        alt={user?.full_name || "User Avatar"}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onError={() => setImgFailed(true)}
        className={`${className} rounded-full object-cover shrink-0 border border-black/10 shadow-2xs`}
      />
    );
  }

  return (
    <div
      className={`${className} rounded-full bg-[#1a73e8] text-white flex items-center justify-center shrink-0 shadow-2xs ${textClassName}`}
    >
      {initial}
    </div>
  );
}
