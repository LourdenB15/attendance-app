// apps/web/src/components/auth/ResetPasswordForm.jsx
import { useState, useEffect, useMemo } from "react";
import { authApi } from "../../api";
import { useAuth } from "../../context/useAuth";
import { PasswordInput } from "../ui/PasswordInput";
import {
  IconChevronLeft,
  IconLock,
  IconCheck,
  IconAlert,
  IconArrowRight,
} from "../ui/Icons";

export function ResetPasswordForm({ onBackToLogin, onRequestNewLink }) {
  const { resetPassword } = useAuth();
  const [token] = useState(
    () => new URLSearchParams(window.location.search).get("token") || "",
  );
  const [linkStatus, setLinkStatus] = useState(() => (token ? "checking" : "invalid"));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!token) return;
    let ignore = false;
    authApi
      .validateResetToken(token)
      .then(() => {
        if (!ignore) setLinkStatus("valid");
      })
      .catch(() => {
        if (!ignore) setLinkStatus("invalid");
      });
    return () => {
      ignore = true;
    };
  }, [token]);

  const leaveInvalidLink = (goTo) => {
    window.history.replaceState({}, document.title, window.location.pathname);
    if (goTo) goTo();
  };

  const passwordCriteria = useMemo(() => {
    return {
      hasMinLength: newPassword.length >= 6,
      hasUpper: /[A-Z]/.test(newPassword),
      hasLower: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      passwordsMatch: Boolean(newPassword && newPassword === confirmPassword),
    };
  }, [newPassword, confirmPassword]);

  const isPasswordValid =
    passwordCriteria.hasMinLength &&
    passwordCriteria.hasUpper &&
    passwordCriteria.hasLower &&
    passwordCriteria.hasNumber;

  const isReady = Boolean(token.trim() && isPasswordValid && passwordCriteria.passwordsMatch);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isReady || loading) return;

    setHasError(false);
    setLoading(true);
    try {
      await resetPassword({ token: token.trim(), newPassword });
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch {
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header and Back Link */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#202124] tracking-tight">
            New password
          </h2>
          <p className="text-xs text-[#5f6368] mt-1">
            Choose a new password for your account.
          </p>
        </div>
        {onBackToLogin && (
          <button
            type="button"
            onClick={() => leaveInvalidLink(onBackToLogin)}
            className="text-xs text-[#1a73e8] hover:text-[#1557b0] font-medium flex items-center gap-1 transition cursor-pointer"
          >
            <IconChevronLeft className="w-3.5 h-3.5" />
            <span>Sign in</span>
          </button>
        )}
      </div>

      {/* Checking Token */}
      {linkStatus === "checking" && (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-xs text-[#5f6368]">
          <div className="w-6 h-6 border-2 border-[#1a73e8] border-t-transparent rounded-full animate-spin" />
          <span>Validating link...</span>
        </div>
      )}

      {/* Invalid Token */}
      {linkStatus === "invalid" && (
        <div className="bg-[#fce8e6] border border-[#fad2cf] rounded-2xl p-5 text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#fad2cf] text-[#c5221f] flex items-center justify-center mx-auto">
            <IconAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#c5221f]">
              Link expired or invalid
            </h3>
            <p className="text-xs text-[#70757a] mt-0.5">
              Please request a new password recovery link.
            </p>
          </div>
          <div className="pt-1 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => leaveInvalidLink(onRequestNewLink)}
              className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Request new link
            </button>
          </div>
        </div>
      )}

      {/* Valid Token Form */}
      {linkStatus === "valid" && (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="reset-new-password"
              className="block text-xs font-semibold text-[#3c4043] mb-1.5"
            >
              New Password
            </label>
            <PasswordInput
              id="reset-new-password"
              name="new-password"
              autoComplete="new-password"
              required
              disabled={loading}
              placeholder="••••••••"
              value={newPassword}
              hasError={hasError}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (hasError) setHasError(false);
              }}
              leadingIcon={<IconLock className="w-4 h-4" />}
            />
          </div>

          <div>
            <label
              htmlFor="reset-confirm-password"
              className="block text-xs font-semibold text-[#3c4043] mb-1.5"
            >
              Confirm Password
            </label>
            <PasswordInput
              id="reset-confirm-password"
              name="confirm-password"
              autoComplete="new-password"
              required
              disabled={loading}
              placeholder="••••••••"
              value={confirmPassword}
              hasError={hasError}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (hasError) setHasError(false);
              }}
              leadingIcon={<IconLock className="w-4 h-4" />}
            />
          </div>

          {/* Criteria */}
          <div className="grid grid-cols-2 gap-1 text-[11px]">
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

          <button
            type="submit"
            disabled={!isReady || loading}
            className="w-full py-2.5 px-4 bg-[#1a73e8] hover:bg-[#1557b0] active:bg-[#174ea6] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-3 focus-visible:ring-[#1a73e8]/30 min-h-[42px]"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <span>Update password</span>
                <IconArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
