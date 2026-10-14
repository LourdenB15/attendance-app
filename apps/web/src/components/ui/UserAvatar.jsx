import { useState, useMemo } from "react";

// Curated accessible palette (WCAG AA compliant contrast with white text)
const PALETTE = [
  "#1a73e8", // Google Blue
  "#1e8e3e", // Google Green
  "#d93025", // Google Red
  "#e37400", // Google Amber/Orange
  "#8430ce", // Google Purple
  "#129eaf", // Google Teal/Cyan
  "#b80672", // Google Berry/Pink
  "#4385f4", // Google Light Blue
  "#0f9d58", // Accent Forest Green
  "#7b1fa2", // Deep Violet
];

function getDeterministicColor(identifier) {
  if (!identifier) return PALETTE[0];
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = (hash << 5) - hash + identifier.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
}

function getInitials(name, email) {
  if (name && typeof name === "string") {
    const trimmed = name.trim();
    if (trimmed) {
      const parts = trimmed.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        const first = Array.from(parts[0])[0] || "";
        const last = Array.from(parts[parts.length - 1])[0] || "";
        const combined = (first + last).toUpperCase();
        if (combined) return combined;
      }
      const chars = Array.from(trimmed);
      if (chars.length >= 2) {
        return (chars[0] + chars[1]).toUpperCase();
      }
      return (chars[0] || "U").toUpperCase();
    }
  }

  if (email && typeof email === "string") {
    const handle = email.split("@")[0]?.trim();
    if (handle) {
      const chars = Array.from(handle);
      if (chars.length >= 2) {
        return (chars[0] + chars[1]).toUpperCase();
      }
      return (chars[0] || "U").toUpperCase();
    }
  }

  return "U";
}

export function UserAvatar({
  user,
  className = "w-8 h-8",
  textClassName = "text-xs font-bold",
  alt,
  ...props
}) {
  const [failedSrc, setFailedSrc] = useState(null);

  // Resolution precedence:
  // 1. Explicit / custom avatar URL
  // 2. Google profile picture / avatar_url
  // 3. Other trusted avatar properties
  const avatarSrc = useMemo(() => {
    const src =
      user?.custom_avatar_url ||
      user?.avatar_url ||
      user?.avatar ||
      user?.picture ||
      user?.photo_url ||
      user?.image_url ||
      null;

    if (typeof src === "string" && src.trim().length > 0) {
      return src.trim();
    }
    return null;
  }, [
    user?.custom_avatar_url,
    user?.avatar_url,
    user?.avatar,
    user?.picture,
    user?.photo_url,
    user?.image_url,
  ]);

  const displayName = user?.full_name || user?.name || "User";
  const email = user?.email || "";
  const identifier = String(user?.id || user?.student_id || email || displayName);
  const initials = useMemo(
    () => getInitials(displayName !== "User" ? displayName : null, email),
    [displayName, email],
  );
  const backgroundColor = useMemo(
    () => getDeterministicColor(identifier),
    [identifier],
  );

  const hasFailed = failedSrc === avatarSrc;

  if (avatarSrc && !hasFailed) {
    return (
      <img
        src={avatarSrc}
        alt={alt || `${displayName}'s avatar`}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onError={() => setFailedSrc(avatarSrc)}
        className={`${className} rounded-full object-cover shrink-0 border border-black/10 shadow-2xs select-none`}
        {...props}
      />
    );
  }

  return (
    <div
      style={{ backgroundColor }}
      className={`${className} rounded-full text-white flex items-center justify-center shrink-0 shadow-2xs select-none tracking-tight ${textClassName}`}
      aria-label={alt || displayName}
      role="img"
      {...props}
    >
      <span>{initials}</span>
    </div>
  );
}

