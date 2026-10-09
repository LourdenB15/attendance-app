// apps/web/src/components/ui/PasswordInput.jsx
import { useState } from "react";
import { IconEye, IconEyeOff } from "./Icons";

export function PasswordInput({
  value,
  onChange,
  placeholder = "••••••••",
  required = false,
  minLength,
  id,
  name,
  className = "",
  autoComplete,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        id={id}
        name={name}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className={`w-full px-3.5 py-2.5 pr-11 bg-white border border-[#dadce0] rounded-lg text-sm text-[#202124] placeholder-[#80868b] focus:border-[#1a73e8] focus:outline-none focus:ring-3 focus:ring-[#e8f0fe] transition-all ${className}`}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#5f6368] hover:text-[#202124] transition-colors"
        title={showPassword ? "Hide password" : "Show password"}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <IconEyeOff className="w-4 h-4" />
        ) : (
          <IconEye className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
