// apps/web/src/components/auth/AuthView.jsx
import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { ResetPasswordForm } from "./ResetPasswordForm";

export function AuthView() {
  const [authTab, setAuthTab] = useState("login"); // "login" | "register" | "forgot" | "reset"

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white text-center">
          <h1 className="text-2xl font-black tracking-tight">Attendance Tracker</h1>
          <p className="text-xs text-indigo-100 mt-1">Active Liveness & Face Identity Verification</p>
        </div>

        <div className="p-6">
          {/* Navigation Pills */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setAuthTab("login")}
              className={`flex-1 py-2 rounded-lg transition text-center ${
                authTab === "login"
                  ? "bg-white text-indigo-600 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setAuthTab("register")}
              className={`flex-1 py-2 rounded-lg transition text-center ${
                authTab === "register"
                  ? "bg-white text-indigo-600 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Student Sign Up
            </button>
            <button
              type="button"
              onClick={() => setAuthTab("forgot")}
              className={`flex-1 py-2 rounded-lg transition text-center ${
                authTab === "forgot"
                  ? "bg-white text-indigo-600 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Forgot
            </button>
            <button
              type="button"
              onClick={() => setAuthTab("reset")}
              className={`flex-1 py-2 rounded-lg transition text-center ${
                authTab === "reset"
                  ? "bg-white text-indigo-600 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Reset
            </button>
          </div>

          {/* Tab Content */}
          {authTab === "login" && <LoginForm />}
          {authTab === "register" && <RegisterForm />}
          {authTab === "forgot" && <ForgotPasswordForm />}
          {authTab === "reset" && <ResetPasswordForm onSuccess={() => setAuthTab("login")} />}
        </div>
      </div>
    </div>
  );
}
