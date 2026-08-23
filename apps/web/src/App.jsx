// apps/web/src/App.jsx
import { ToastProvider } from "./context/ToastContextProvider";
import { AuthProvider } from "./context/AuthContextProvider";
import { useAuth } from "./context/useAuth";
import { AuthView } from "./components/auth/AuthView";
import { AppLayout } from "./components/layout/AppLayout";

function RootContent() {
  const { currentUser, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-lg font-bold text-slate-800">Attendance Tracker</h2>
          <p className="text-sm text-slate-500 mt-1">Verifying active session...</p>
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
      <AuthProvider>
        <RootContent />
      </AuthProvider>
    </ToastProvider>
  );
}
