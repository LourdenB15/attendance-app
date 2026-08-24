// apps/web/src/components/auth/MustChangePasswordBanner.jsx
import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import { PasswordInput } from "../ui/PasswordInput";

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
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6 shadow-sm">
      <h3 className="text-base font-bold text-amber-900 flex items-center gap-2">
        <span>⚠️</span> Action Required: Set Permanent Password
      </h3>
      <p className="text-xs text-amber-700 mt-1 mb-4">
        Your account was initialized with a temporary password by an administrator. Please set a new password to proceed.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3 max-w-lg">
        <div>
          <label className="block text-xs font-bold uppercase text-amber-800 mb-1">
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
          <label className="block text-xs font-bold uppercase text-amber-800 mb-1">
            New Password (min 8 chars)
          </label>
          <PasswordInput
            required
            minLength={8}
            placeholder="New permanent password..."
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-amber-800 mb-1">
            Confirm New Password
          </label>
          <PasswordInput
            required
            minLength={8}
            placeholder="Confirm new password..."
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-xs transition mt-2"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
