// apps/web/src/components/auth/AuthView.jsx
import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { VerifyEmailView } from "./VerifyEmailView";
import { IconGraduationCap } from "../ui/Icons";

export function AuthView() {
  const [authTab, setAuthTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("verify_token")) return "verify";
    if (params.get("token")) return "reset";
    return "login";
  });
  const [pendingEmail, setPendingEmail] = useState("");

  const isMainTab = authTab === "login" || authTab === "register";

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#dadce0] overflow-hidden">
        {/* Google Classroom Header Banner */}
        <div className="p-6 text-center border-b border-[#f1f3f4]">
          <div className="w-12 h-12 rounded-2xl bg-[#137333] text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
            <IconGraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-[#202124] tracking-tight">
            Google Classroom
          </h1>
          <p className="text-xs text-[#5f6368] mt-1 font-medium">
            Attendance Tracker & Biometric Verification
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {/* Main Top Navigation: Tabs for Login vs Student Sign Up */}
          {isMainTab && (
            <div className="flex bg-[#f1f3f4] p-1 rounded-xl mb-6 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAuthTab("login")}
                className={`flex-1 py-2 rounded-lg transition-all text-center ${
                  authTab === "login"
                    ? "bg-white text-[#1a73e8] shadow-xs font-bold"
                    : "text-[#5f6368] hover:text-[#202124]"
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setAuthTab("register")}
                className={`flex-1 py-2 rounded-lg transition-all text-center ${
                  authTab === "register"
                    ? "bg-white text-[#1a73e8] shadow-xs font-bold"
                    : "text-[#5f6368] hover:text-[#202124]"
                }`}
              >
                Student Sign Up
              </button>
            </div>
          )}

          {/* Tab Content */}
          {authTab === "login" && (
            <LoginForm
              onForgotPassword={() => setAuthTab("forgot")}
              onNeedsVerification={(email) => {
                setPendingEmail(email);
                setAuthTab("verify");
              }}
            />
          )}

          {authTab === "register" && (
            <RegisterForm
              onRegistered={(email) => {
                setPendingEmail(email);
                setAuthTab("verify");
              }}
            />
          )}

          {authTab === "verify" && (
            <VerifyEmailView
              initialEmail={pendingEmail}
              onSuccess={() => setAuthTab("login")}
              onBackToLogin={() => setAuthTab("login")}
            />
          )}

          {authTab === "forgot" && (
            <ForgotPasswordForm onBackToLogin={() => setAuthTab("login")} />
          )}

          {authTab === "reset" && (
            <ResetPasswordForm
              onBackToLogin={() => setAuthTab("login")}
              onRequestNewLink={() => setAuthTab("forgot")}
            />
          )}
        </div>
      </div>

      <p className="text-xs text-[#70757a] text-center mt-6">
        Protected with AI Face Liveness & Active Anti-Spoofing
      </p>
    </div>
  );
}
