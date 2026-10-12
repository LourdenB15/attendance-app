// apps/web/src/components/auth/MustChangePasswordBanner.jsx
import { useState, useMemo } from "react";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import { PasswordInput } from "../ui/PasswordInput";
import { IconAlert, IconCheck, IconLock } from "../ui/Icons";

export function MustChangePasswordBanner() {
  const { currentUser, changePassword } = useAuth();
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  if (!currentUser?.must_change_password) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!currentPassword) {
      setErrorMessage("Current temporary password is required.");
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage("New password does not meet complexity requirements.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match. Please re-enter.");
      showToast("error", "New passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setErrorMessage(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fef7e0] border border-[#feefc3] rounded-2xl p-6 mb-6 shadow-xs animate-in fade-in duration-200">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-[#fef0cb] text-[#b06000] flex items-center justify-center shrink-0">
          <IconAlert className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-[#b06000]">
            Action Required: Set Your Permanent Password
          </h3>
          <p className="text-xs text-[#824400] mt-1 mb-4 leading-relaxed">
            Your account was initialized with a temporary password by an administrator. Please set a new personal password before you can access the classroom portal.
          </p>

          {errorMessage && (
            <div
              role="alert"
              className="p-3 mb-4 bg-[#fce8e6] border border-[#fad2cf] rounded-xl text-xs text-[#c5221f] font-medium leading-relaxed max-w-md"
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 max-w-md bg-white p-5 rounded-2xl border border-[#feefc3] shadow-2xs">
            <div>
              <label
                htmlFor="temp-current-password"
                className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-1.5"
              >
                Current Temporary Password
              </label>
              <PasswordInput
                id="temp-current-password"
                name="current-password"
                required
                disabled={loading}
                placeholder="Current temp password..."
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                leadingIcon={<IconLock className="w-4 h-4" />}
              />
            </div>

            <div>
              <label
                htmlFor="temp-new-password"
                className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-1.5"
              >
                New Permanent Password
              </label>
              <PasswordInput
                id="temp-new-password"
                name="new-password"
                required
                disabled={loading}
                placeholder="New secure password..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                leadingIcon={<IconLock className="w-4 h-4" />}
              />
            </div>

            <div>
              <label
                htmlFor="temp-confirm-password"
                className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-1.5"
              >
                Confirm New Password
              </label>
              <PasswordInput
                id="temp-confirm-password"
                name="confirm-password"
                required
                disabled={loading}
                placeholder="Confirm new password..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leadingIcon={<IconLock className="w-4 h-4" />}
              />
            </div>

            {/* Checklist */}
            <div className="p-3 rounded-xl bg-[#f8f9fa] border border-[#e8eaed] space-y-1.5">
              <p className="text-[10px] font-semibold text-[#5f6368] uppercase tracking-wider">
                Requirements
              </p>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordCriteria.hasMinLength ? "text-[#137333] font-medium" : "text-[#80868b]"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full flex items-center justify-center shrink-0 ${
                      passwordCriteria.hasMinLength ? "bg-[#e6f4ea] text-[#137333]" : "bg-[#dadce0] text-white"
                    }`}
                  >
                    <IconCheck className="w-2 h-2" />
                  </div>
                  <span>6+ chars</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 ${
                    passwordCriteria.hasUpper ? "text-[#137333] font-medium" : "text-[#80868b]"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full flex items-center justify-center shrink-0 ${
                      passwordCriteria.hasUpper ? "bg-[#e6f4ea] text-[#137333]" : "bg-[#dadce0] text-white"
                    }`}
                  >
                    <IconCheck className="w-2 h-2" />
                  </div>
                  <span>1 uppercase</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 ${
                    passwordCriteria.hasLower ? "text-[#137333] font-medium" : "text-[#80868b]"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full flex items-center justify-center shrink-0 ${
                      passwordCriteria.hasLower ? "bg-[#e6f4ea] text-[#137333]" : "bg-[#dadce0] text-white"
                    }`}
                  >
                    <IconCheck className="w-2 h-2" />
                  </div>
                  <span>1 lowercase</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 ${
                    passwordCriteria.hasNumber ? "text-[#137333] font-medium" : "text-[#80868b]"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full flex items-center justify-center shrink-0 ${
                      passwordCriteria.hasNumber ? "bg-[#e6f4ea] text-[#137333]" : "bg-[#dadce0] text-white"
                    }`}
                  >
                    <IconCheck className="w-2 h-2" />
                  </div>
                  <span>1 number</span>
                </div>
              </div>

              {confirmPassword && (
                <div
                  className={`pt-1 border-t border-[#e8eaed] flex items-center gap-1.5 text-[11px] ${
                    passwordCriteria.passwordsMatch ? "text-[#137333] font-medium" : "text-[#c5221f]"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full flex items-center justify-center shrink-0 ${
                      passwordCriteria.passwordsMatch ? "bg-[#e6f4ea] text-[#137333]" : "bg-[#fce8e6] text-[#c5221f]"
                    }`}
                  >
                    <IconCheck className="w-2 h-2" />
                  </div>
                  <span>
                    {passwordCriteria.passwordsMatch ? "Passwords match" : "Passwords do not match"}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordValid || !passwordCriteria.passwordsMatch}
              className="w-full py-2.5 bg-[#b06000] hover:bg-[#8f4e00] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition mt-2 cursor-pointer"
            >
              {loading ? "Updating password..." : "Update Password & Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
