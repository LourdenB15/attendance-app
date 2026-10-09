// apps/web/src/components/auth/MustChangePasswordBanner.jsx
import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import { PasswordInput } from "../ui/PasswordInput";
import { IconAlert } from "../ui/Icons";

export function MustChangePasswordBanner() {
  const { currentUser, changePassword } = useAuth();
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!currentUser?.must_change_password) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showToast("error", "New passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      // toast in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fef7e0] border border-[#feefc3] rounded-2xl p-6 mb-6 shadow-xs animate-in fade-in duration-200">
      <div className="flex items-start gap-3">
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

          <form onSubmit={handleSubmit} className="space-y-3 max-w-md bg-white p-5 rounded-xl border border-[#feefc3] shadow-2xs">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-1">
                Current Temporary Password
              </label>
              <PasswordInput
                required
                placeholder="Current temp password..."
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-1">
                New Permanent Password
              </label>
              <PasswordInput
                required
                placeholder="New secure password..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-1">
                Confirm New Password
              </label>
              <PasswordInput
                required
                placeholder="Confirm new password..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#b06000] hover:bg-[#8f4e00] disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-xs transition mt-2"
            >
              {loading ? "Updating password..." : "Update Password & Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
