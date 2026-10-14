import { ToastProvider } from "./context/ToastContextProvider";
import { ConfirmProvider } from "./context/ConfirmContextProvider";
import { AuthProvider } from "./context/AuthContextProvider";
import { useAuth } from "./context/useAuth";
import { AuthView } from "./components/auth/AuthView";
import { AppLayout } from "./components/layout/AppLayout";
import { AppLogo } from "./components/ui/AppLogo";
import { GoogleProgressBar, MaterialSpinner } from "./components/ui/ProgressBar";

function RootContent() {
  const { currentUser, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8f9fa] font-sans relative overflow-hidden select-none">
        {/* Pinned Google Indeterminate Progress Bar */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <GoogleProgressBar height="h-1" />
        </div>

        {/* Ambient subtle backdrop */}
        <div className="absolute inset-0 bg-radial from-white via-[#f8f9fa] to-[#f1f3f4] pointer-events-none" />

        {/* Centered Brand Presentation */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 animate-in fade-in duration-200">
          <div className="flex flex-col items-center text-center max-w-sm">
            {/* Brand Logo */}
            <div className="mb-5">
              <AppLogo className="w-12 h-12" />
            </div>

            {/* Google Material Circular Spinner */}
            <div className="mb-4">
              <MaterialSpinner size="md" />
            </div>

            {/* Clean Google Sans Typography */}
            <h1 className="text-base sm:text-lg font-bold text-[#202124] tracking-tight">
              Attendance Live
            </h1>
            <p className="text-xs text-[#5f6368] mt-1 font-medium">
              Loading your workspace...
            </p>

            {/* Subtle Brand Tagline */}
            <div className="mt-8 flex items-center gap-1.5 text-[11px] font-semibold text-[#80868b] tracking-wider uppercase">
              <span>Powered by</span>
              <span className="text-[#1a73e8]">liveness.cloud</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthView />;
  }

  return <AppLayout />;
}

export default function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <AuthProvider>
          <RootContent />
        </AuthProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}
