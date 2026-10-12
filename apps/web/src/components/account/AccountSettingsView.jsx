import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/useToast";
import { UserAvatar } from "../ui/UserAvatar";
import { Badge } from "../ui/Badge";
import { PasswordInput } from "../ui/PasswordInput";
import { LivenessCamera } from "../liveness/LivenessCamera";
import { livenessApi } from "../../api";
import {
  IconChevronLeft,
  IconPencil,
  IconCheck,
  IconLock,
  IconShieldCheck,
  IconCamera,
  IconGoogle,
} from "../ui/Icons";

export function AccountSettingsView({ onBack }) {
  const {
    currentUser,
    updateProfile,
    changePassword,
    setBiometricEnrolled,
  } = useAuth();
  const { showToast } = useToast();

  // Name Editing State
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(currentUser?.full_name || "");
  const [savingName, setSavingName] = useState(false);

  // Password Changing State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Biometric Enrollment State (Students)
  const isStudent = currentUser?.role?.toUpperCase() === "STUDENT";
  const isFaceEnrolled = Boolean(currentUser?.has_biometric_enrolled);
  const [showFaceScanner, setShowFaceScanner] = useState(false);
  const [savingFace, setSavingFace] = useState(false);

  // Account metadata
  const hasPassword = currentUser?.has_password !== false;
  const isGoogleUser = Boolean(currentUser?.google_id);

  const roleBadgeVariant =
    currentUser?.role === "ADMIN"
      ? "purple"
      : currentUser?.role === "PROFESSOR"
      ? "blue"
      : "success";

  const handleSaveName = async (e) => {
    e.preventDefault();
    const trimmed = nameValue.trim();
    if (!trimmed || trimmed.length < 2) {
      showToast("error", "Name must be at least 2 characters long.");
      return;
    }
    if (trimmed === currentUser?.full_name) {
      setIsEditingName(false);
      return;
    }

    setSavingName(true);
    try {
      await updateProfile({ fullName: trimmed });
      setIsEditingName(false);
    } catch {
      // toast shown in context
    } finally {
      setSavingName(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast("error", "New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("error", "New passwords do not match. Please verify.");
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword({
        currentPassword: hasPassword ? currentPassword : undefined,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      // toast shown in context
    } finally {
      setSavingPassword(false);
    }
  };

  const handleFaceEnrollSuccess = async (livenessResult) => {
    setShowFaceScanner(false);
    setSavingFace(true);
    try {
      await livenessApi.enrollBiometric(livenessResult);
      setBiometricEnrolled(true);
      showToast("success", "Biometric face profile successfully updated!");
    } catch (err) {
      showToast("error", err.message || "Failed to register face profile");
    } finally {
      setSavingFace(false);
    }
  };

  const formattedDate = currentUser?.created_at
    ? new Date(currentUser.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Member";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header & Breadcrumb Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#dadce0]">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5f6368] hover:text-[#1a73e8] transition-colors mb-2 cursor-pointer"
          >
            <IconChevronLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <h2 className="text-2xl font-bold text-[#202124] tracking-tight">
            Account Settings
          </h2>
          <p className="text-xs text-[#5f6368] mt-0.5">
            Manage your personal profile, account credentials, and security identity.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant={roleBadgeVariant} size="sm">
            {currentUser?.role || "USER"}
          </Badge>
          <span className="text-xs text-[#80868b] font-medium">
            Joined {formattedDate}
          </span>
        </div>
      </div>

      {/* CARD 1: Personal Profile */}
      <div className="bg-white rounded-2xl border border-[#dadce0] shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[#e8eaed] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-[#202124]">
              Personal Profile
            </h3>
            <p className="text-xs text-[#5f6368] mt-0.5">
              Your name and identity displayed across class rosters, attendance records, and sessions.
            </p>
          </div>
          {!isEditingName && (
            <button
              type="button"
              onClick={() => {
                setNameValue(currentUser?.full_name || "");
                setIsEditingName(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#dadce0] hover:bg-[#f8f9fa] text-xs font-semibold text-[#202124] transition-colors cursor-pointer"
            >
              <IconPencil className="w-3.5 h-3.5 text-[#5f6368]" />
              <span>Edit Name</span>
            </button>
          )}
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <UserAvatar
              user={currentUser}
              className="w-16 h-16 shrink-0 ring-4 ring-[#e8f0fe]"
              textClassName="text-2xl font-bold"
            />
            <div className="min-w-0 flex-1">
              {!isEditingName ? (
                <div>
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-lg font-bold text-[#202124] truncate">
                      {currentUser?.full_name}
                    </h4>
                  </div>
                  <p className="text-xs text-[#5f6368] mt-0.5 font-mono">
                    {currentUser?.email}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSaveName} className="space-y-3 max-w-md">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-1">
                      Display Full Name
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      maxLength={70}
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      placeholder="e.g. Juan Dela Cruz"
                      className="w-full px-3.5 py-2 bg-white border border-[#dadce0] rounded-lg text-sm text-[#202124] focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#e8f0fe] transition-all"
                    />
                    <div className="flex items-center justify-between text-[11px] text-[#5f6368] mt-1">
                      <span>Matches official academic attendance records.</span>
                      <span>{nameValue.length}/70</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={savingName || !nameValue.trim() || nameValue.trim().length < 2}
                      className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
                    >
                      {savingName ? "Saving..." : "Save Name"}
                    </button>
                    <button
                      type="button"
                      disabled={savingName}
                      onClick={() => {
                        setNameValue(currentUser?.full_name || "");
                        setIsEditingName(false);
                      }}
                      className="px-3.5 py-2 text-xs font-semibold text-[#5f6368] hover:bg-[#f1f3f4] rounded-lg transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#f1f3f4]">
            <div className="bg-[#f8f9fa] rounded-xl p-3.5 border border-[#e8eaed]">
              <span className="block text-[11px] font-semibold text-[#5f6368] uppercase tracking-wider mb-1">
                Primary Email
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-semibold text-[#202124] font-mono truncate">
                  {currentUser?.email}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#137333] bg-[#e6f4ea] px-2 py-0.5 rounded-full shrink-0">
                  <IconCheck className="w-3 h-3 text-[#137333]" />
                  <span>Verified</span>
                </span>
              </div>
            </div>

            <div className="bg-[#f8f9fa] rounded-xl p-3.5 border border-[#e8eaed]">
              <span className="block text-[11px] font-semibold text-[#5f6368] uppercase tracking-wider mb-1">
                Account Sign-In Type
              </span>
              <div className="flex items-center gap-2">
                {isGoogleUser ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#202124]">
                    <IconGoogle className="w-4 h-4" />
                    <span>Google Workspace Linked</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#202124]">
                    <IconLock className="w-4 h-4 text-[#5f6368]" />
                    <span>Email & Password Credentials</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 2: Biometric Face Profile (For Students) */}
      {isStudent && (
        <div className="bg-white rounded-2xl border border-[#dadce0] shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-[#e8eaed] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
                <IconCamera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#202124]">
                  Biometric Face Profile
                </h3>
                <p className="text-xs text-[#5f6368] mt-0.5">
                  Your registered facial biometric embedding used for contactless AI attendance check-in.
                </p>
              </div>
            </div>

            <div className="shrink-0">
              {isFaceEnrolled ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#e6f4ea] text-[#137333] border border-[#ceead6]">
                  <span className="w-2 h-2 rounded-full bg-[#1e8e3e] animate-pulse" />
                  <span>Face Profile Active</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fef7e0] text-[#b06000] border border-[#feefc3]">
                  <span>Not Enrolled</span>
                </span>
              )}
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            <div className="bg-[#f8f9fa] rounded-xl p-4 border border-[#e8eaed] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-[#202124]">
                  {isFaceEnrolled
                    ? "Your facial template is securely registered and active."
                    : "No biometric face template registered yet."}
                </p>
                <p className="text-xs text-[#5f6368] mt-0.5">
                  {isFaceEnrolled
                    ? "If your appearance has changed or you experience lighting recognition issues, you can recalibrate your face profile anytime."
                    : "Register your face profile with our automated anti-spoof liveness check to start checking in to classes."}
                </p>
              </div>

              <button
                type="button"
                disabled={savingFace}
                onClick={() => setShowFaceScanner(true)}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white shadow-xs transition cursor-pointer shrink-0 ${
                  isFaceEnrolled
                    ? "bg-[#1a73e8] hover:bg-[#1557b0]"
                    : "bg-[#137333] hover:bg-[#0d652d]"
                }`}
              >
                <IconCamera className="w-4 h-4" />
                <span>
                  {isFaceEnrolled ? "Recalibrate Face Profile" : "Register Face Now"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CARD 3: Login Security & Password */}
      <div className="bg-white rounded-2xl border border-[#dadce0] shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[#e8eaed] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f1f3f4] text-[#5f6368] flex items-center justify-center shrink-0">
            <IconShieldCheck className="w-5 h-5 text-[#1a73e8]" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#202124]">
              {hasPassword ? "Change Password" : "Set Account Password"}
            </h3>
            <p className="text-xs text-[#5f6368] mt-0.5">
              Keep your account secure with strong credentials.
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {!hasPassword && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#e8f0fe] border border-[#d2e3fc] text-xs text-[#1967d2] leading-relaxed">
              You registered with Google Single Sign-On. You can optionally set a password here to allow signing in with both Google and your email/password.
            </div>
          )}

          <form onSubmit={handleSavePassword} className="space-y-4 max-w-lg">
            {hasPassword && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-1.5">
                  Current Password
                </label>
                <PasswordInput
                  required
                  autoComplete="current-password"
                  placeholder="Enter current password..."
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-1.5">
                New Password
              </label>
              <PasswordInput
                required
                autoComplete="new-password"
                placeholder="Enter new secure password..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <p className="text-[11px] text-[#5f6368] mt-1">
                Must be at least 6 characters with uppercase, lowercase, and a number.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-1.5">
                Confirm New Password
              </label>
              <PasswordInput
                required
                autoComplete="new-password"
                placeholder="Re-type new password..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingPassword || !newPassword || !confirmPassword || (hasPassword && !currentPassword)}
                className="px-5 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
              >
                {savingPassword
                  ? "Updating..."
                  : hasPassword
                  ? "Update Password"
                  : "Set Password"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Embedded Biometric Camera Modal */}
      {showFaceScanner && (
        <LivenessCamera
          mode="enrollment"
          title="Recalibrate Biometric Face Profile"
          onComplete={handleFaceEnrollSuccess}
          onCancel={() => setShowFaceScanner(false)}
        />
      )}
    </div>
  );
}
