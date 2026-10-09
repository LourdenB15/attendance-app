import { ToastProvider } from "./context/ToastContextProvider";
import { ConfirmProvider } from "./context/ConfirmContextProvider";
import { AuthProvider } from "./context/AuthContextProvider";
import { useAuth } from "./context/useAuth";
import { AuthView } from "./components/auth/AuthView";
import { AppLayout } from "./components/layout/AppLayout";
import { IconGraduationCap } from "./components/ui/Icons";

function RootContent() {
  const { currentUser, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] font-sans p-4">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xs border border-[#dadce0] max-w-xs w-full animate-in fade-in duration-200">
          <div className="w-12 h-12 rounded-2xl bg-[#137333] text-white flex items-center justify-center mx-auto mb-4 shadow-xs">
            <IconGraduationCap className="w-7 h-7" />
          </div>
          <div className="relative w-8 h-8 mx-auto mb-3">
            <div className="absolute inset-0 rounded-full border-3 border-[#e8f0fe]" />
            <div className="absolute inset-0 rounded-full border-3 border-[#1a73e8] border-t-transparent animate-spin" />
          </div>
          <h2 className="text-base font-bold text-[#202124]">Google Classroom</h2>
          <p className="text-xs text-[#5f6368] mt-1">Verifying active session...</p>
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
