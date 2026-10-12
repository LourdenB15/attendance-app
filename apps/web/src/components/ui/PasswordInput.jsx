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
  disabled = false,
  leadingIcon,
  ariaDescribedBy,
  ariaInvalid,
  hasError = false,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative flex items-center">
      {leadingIcon && (
        <div
          className={`absolute left-3.5 flex items-center pointer-events-none transition-colors ${
            hasError ? "text-[#d93025]" : "text-[#5f6368]"
          }`}
        >
          {leadingIcon}
        </div>
      )}
      <input
        type={showPassword ? "text" : "password"}
        id={id}
        name={name}
        required={required}
        minLength={minLength}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid || (hasError ? "true" : undefined)}
        className={`w-full ${
          leadingIcon ? "pl-10" : "pl-3.5"
        } pr-11 py-2.5 bg-white rounded-xl text-sm text-[#202124] placeholder-[#80868b] transition-all disabled:bg-[#f1f3f4] disabled:opacity-60 ${
          hasError
            ? "border border-[#d93025] ring-3 ring-[#d93025]/20 shadow-[0_0_12px_rgba(217,48,37,0.18)] focus:border-[#d93025] focus:outline-none focus:ring-3 focus:ring-[#d93025]/30"
            : "border border-[#dadce0] focus:border-[#1a73e8] focus:outline-none focus:ring-3 focus:ring-[#e8f0fe]"
        } ${className}`}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute right-2 p-1.5 rounded-lg text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8] transition cursor-pointer"
        title={showPassword ? "Hide password" : "Show password"}
        aria-label={showPassword ? "Hide password" : "Show password"}
        aria-pressed={showPassword}
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
