// apps/web/src/components/auth/AuthView.jsx
import { useState, useEffect } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { VerifyEmailView } from "./VerifyEmailView";
import { AuthBrandPanel } from "./AuthBrandPanel";
import { AppLogo } from "../ui/AppLogo";
import { IconShieldCheck } from "../ui/Icons";

export function AuthView() {
  const [authTab, setAuthTab] = useState(() => {
    if (typeof window === "undefined") return "login";
    const params = new URLSearchParams(window.location.search);
    if (params.get("verify_token")) return "verify";
    if (params.get("token")) return "reset";
    return "login";
  });

  const [pendingEmail, setPendingEmail] = useState(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    return params.get("email") || "";
  });

  useEffect(() => {
    const handlePop = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get("verify_token")) setAuthTab("verify");
      else if (params.get("token")) setAuthTab("reset");
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  return (
     <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-3 sm:p-6 lg:p-8 font-sans antialiased selection:bg-[#e8f0fe] selection:text-[#1a73e8]">
        {/* Unified Card Container: smallest possible radius (rounded-xs), no border whatsoever on mobile, subtle border on desktop */}
        <div className="w-full max-w-5xl bg-white rounded-xs border-0 lg:border border-[#dadce0]/50 shadow-none lg:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04),0_1px_2px_0_rgba(0,0,0,0.02)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-155">
           {/* Left Column: Brand & Classroom Showcase (Desktop only) */}
           <div className="hidden lg:block lg:col-span-6 xl:col-span-7 bg-[#f8fafd] border-r border-[#dadce0]/50">
              <AuthBrandPanel />
           </div>

           {/* Right Column: Authentication Form Panel */}
           <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-white">
              {/* Mobile-only Header */}
              <div className="block lg:hidden mb-6 text-center">
                 <div className="flex justify-center mb-2.5">
                    <AppLogo className="w-12 h-12 rounded-xl shadow-xs" />
                 </div>
                 <h1 className="text-xl font-bold text-[#202124] tracking-tight">
                    Attendance Live
                 </h1>
                 <p className="text-xs text-[#5f6368] mt-0.5">
                    Smart Classroom Attendance
                 </p>
                 <hr className="my-4 border-t border-[#dadce0]/60" />
              </div>

              {/* Form Content Area */}
              <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
                 {authTab === "login" && (
                    <LoginForm
                       onForgotPassword={() => setAuthTab("forgot")}
                       onNeedsVerification={(email) => {
                          setPendingEmail(email);
                          setAuthTab("verify");
                       }}
                       onSwitchToRegister={() => setAuthTab("register")}
                    />
                 )}

                 {authTab === "register" && (
                    <RegisterForm
                       onRegistered={(email) => {
                          setPendingEmail(email);
                          setAuthTab("verify");
                       }}
                       onSwitchToLogin={() => setAuthTab("login")}
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
                    <ForgotPasswordForm
                       onBackToLogin={() => setAuthTab("login")}
                    />
                 )}

                 {authTab === "reset" && (
                    <ResetPasswordForm
                       onBackToLogin={() => setAuthTab("login")}
                       onRequestNewLink={() => setAuthTab("forgot")}
                    />
                 )}
              </div>

              {/* Minimalist Partnership & Capstone Footer */}
              <div className="pt-6 mt-6 border-t border-[#f1f3f4] text-center">
                 <div className="inline-flex items-center gap-1.5 text-[11px] text-[#70757a]">
                    <IconShieldCheck className="w-3.5 h-3.5 text-[#137333]" />
                    <span>
                       Powered by{" "}
                       <strong className="font-semibold text-[#202124]">
                          liveness.cloud
                       </strong>{" "}
                    </span>
                 </div>
              </div>
           </div>
        </div>
     </div>
  );
}
