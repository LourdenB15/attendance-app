// apps/web/src/components/auth/RegisterForm.jsx
import { useState, useMemo } from "react";
import { useAuth } from "../../context/useAuth";
import { PasswordInput } from "../ui/PasswordInput";
import {
  IconUser,
  IconMail,
  IconLock,
  IconCheck,
  IconArrowRight,
  IconCheckCircle,
} from "../ui/Icons";

export function RegisterForm({ onRegistered, onSwitchToLogin }) {
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState(null);

  const passwordCriteria = useMemo(() => {
    return {
      hasMinLength: password.length >= 6,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    };
  }, [password]);

  const isPasswordValid =
    passwordCriteria.hasMinLength &&
    passwordCriteria.hasUpper &&
    passwordCriteria.hasLower &&
    passwordCriteria.hasNumber;

  const isReady = Boolean(fullName.trim() && email.trim() && isPasswordValid);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isReady || loading) return;

    setHasError(false);
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    setLoading(true);
    try {
      await register({ fullName: trimmedName, email: trimmedEmail, password });
      setRegisteredEmail(trimmedEmail);
      if (onRegistered) onRegistered(trimmedEmail);
    } catch {
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  if (registeredEmail) {
    return (
      <div className="text-center py-6 space-y-3">
        <div className="w-12 h-12 rounded-xl bg-[#e6f4ea] text-[#137333] flex items-center justify-center mx-auto">
          <IconCheckCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#202124]">Check your inbox</h3>
        <p className="text-xs text-[#5f6368] max-w-xs mx-auto">
          We sent a 6-digit verification code to <strong className="font-mono text-[#202124]">{registeredEmail}</strong>.
        </p>
        <button
          type="button"
          onClick={() => {
            setRegisteredEmail(null);
            setFullName("");
            setEmail("");
            setPassword("");
            setHasError(false);
          }}
          className="text-xs text-[#1a73e8] hover:text-[#1557b0] font-medium hover:underline cursor-pointer pt-2"
        >
          ← Edit details
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Concise Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#202124] tracking-tight">
          Create an account
        </h2>
        <p className="text-xs text-[#5f6368] mt-1">
          Sign up as a student to join classes.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="register-fullname"
            className="block text-xs font-semibold text-[#3c4043] mb-1.5"
          >
            Full Name
          </label>
          <div className="relative flex items-center">
            <div
              className={`absolute left-3.5 pointer-events-none transition-colors ${
                hasError ? "text-[#d93025]" : "text-[#5f6368]"
              }`}
            >
              <IconUser className="w-4 h-4" />
            </div>
            <input
              id="register-fullname"
              name="name"
              type="text"
              autoComplete="name"
              required
              disabled={loading}
              placeholder="e.g. Marie Curie"
              value={fullName}
              aria-invalid={hasError ? "true" : undefined}
              onChange={(e) => {
                setFullName(e.target.value);
                if (hasError) setHasError(false);
              }}
              className={`w-full pl-10 pr-3.5 py-2.5 bg-white rounded-xl text-sm text-[#202124] placeholder-[#80868b] transition-all disabled:bg-[#f1f3f4] disabled:opacity-60 ${
                hasError
                  ? "border border-[#d93025] ring-3 ring-[#d93025]/20 shadow-[0_0_12px_rgba(217,48,37,0.18)] focus:border-[#d93025] focus:outline-none focus:ring-3 focus:ring-[#d93025]/30"
                  : "border border-[#dadce0] focus:border-[#1a73e8] focus:outline-none focus:ring-3 focus:ring-[#e8f0fe]"
              }`}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="register-email"
            className="block text-xs font-semibold text-[#3c4043] mb-1.5"
          >
            Email Address
          </label>
          <div className="relative flex items-center">
            <div
              className={`absolute left-3.5 pointer-events-none transition-colors ${
                hasError ? "text-[#d93025]" : "text-[#5f6368]"
              }`}
            >
              <IconMail className="w-4 h-4" />
            </div>
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={loading}
              placeholder="student@school.edu"
              value={email}
              aria-invalid={hasError ? "true" : undefined}
              onChange={(e) => {
                setEmail(e.target.value);
                if (hasError) setHasError(false);
              }}
              className={`w-full pl-10 pr-3.5 py-2.5 bg-white rounded-xl text-sm text-[#202124] placeholder-[#80868b] transition-all disabled:bg-[#f1f3f4] disabled:opacity-60 ${
                hasError
                  ? "border border-[#d93025] ring-3 ring-[#d93025]/20 shadow-[0_0_12px_rgba(217,48,37,0.18)] focus:border-[#d93025] focus:outline-none focus:ring-3 focus:ring-[#d93025]/30"
                  : "border border-[#dadce0] focus:border-[#1a73e8] focus:outline-none focus:ring-3 focus:ring-[#e8f0fe]"
              }`}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="register-password"
            className="block text-xs font-semibold text-[#3c4043] mb-1.5"
          >
            Password
          </label>
          <PasswordInput
            id="register-password"
            name="password"
            autoComplete="new-password"
            required
            disabled={loading}
            placeholder="••••••••"
            value={password}
            hasError={hasError}
            onChange={(e) => {
              setPassword(e.target.value);
              if (hasError) setHasError(false);
            }}
            leadingIcon={<IconLock className="w-4 h-4" />}
          />

          {/* Compact criteria indicator */}
          <div className="mt-2 grid grid-cols-2 gap-1 text-[11px]">
            <div
              className={`flex items-center gap-1 ${
                passwordCriteria.hasMinLength ? "text-[#137333] font-medium" : "text-[#80868b]"
              }`}
            >
              <IconCheck className="w-3 h-3" />
              <span>6+ characters</span>
            </div>
            <div
              className={`flex items-center gap-1 ${
                passwordCriteria.hasUpper ? "text-[#137333] font-medium" : "text-[#80868b]"
              }`}
            >
              <IconCheck className="w-3 h-3" />
              <span>1 uppercase</span>
            </div>
            <div
              className={`flex items-center gap-1 ${
                passwordCriteria.hasLower ? "text-[#137333] font-medium" : "text-[#80868b]"
              }`}
            >
              <IconCheck className="w-3 h-3" />
              <span>1 lowercase</span>
            </div>
            <div
              className={`flex items-center gap-1 ${
                passwordCriteria.hasNumber ? "text-[#137333] font-medium" : "text-[#80868b]"
              }`}
            >
              <IconCheck className="w-3 h-3" />
              <span>1 number</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!isReady || loading}
          className="w-full py-2.5 px-4 bg-[#1a73e8] hover:bg-[#1557b0] active:bg-[#174ea6] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-3 focus-visible:ring-[#1a73e8]/30 min-h-[42px]"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Create account</span>
              <IconArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      {onSwitchToLogin && (
        <div className="pt-2 text-center">
          <p className="text-xs text-[#5f6368]">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-[#1a73e8] hover:text-[#1557b0] font-semibold transition hover:underline cursor-pointer"
            >
              Sign in
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
