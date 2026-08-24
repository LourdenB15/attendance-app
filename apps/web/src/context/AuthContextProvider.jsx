// apps/web/src/context/AuthContextProvider.jsx
import { useState, useEffect } from "react";
import { authApi } from "../api";
import { useToast } from "./useToast";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    let ignore = false;
    async function checkSession() {
      try {
        const user = await authApi.getMe();
        if (!ignore) setCurrentUser(user);
      } catch {
        if (!ignore) setCurrentUser(null);
      } finally {
        if (!ignore) setAuthLoading(false);
      }
    }
    checkSession();
    return () => {
      ignore = true;
    };
  }, []);

  const login = async ({ email, password }) => {
    try {
      const user = await authApi.login({ email, password });
      setCurrentUser(user);
      showToast("success", `Welcome back, ${user.full_name}!`);
      return user;
    } catch (err) {
      showToast("error", err.message);
      throw err;
    }
  };

  const loginWithGoogle = async (credential) => {
    try {
      const user = await authApi.loginWithGoogle(credential);
      setCurrentUser(user);
      showToast("success", `Signed in with Google! Welcome, ${user.full_name}.`);
      return user;
    } catch (err) {
      showToast("error", err.message);
      throw err;
    }
  };

  const register = async ({ fullName, email, password }) => {
    try {
      const result = await authApi.register({ fullName, email, password });
      showToast("info", result.message || "Please check your email to verify your account.");
      return result;
    } catch (err) {
      showToast("error", err.message);
      throw err;
    }
  };

  const verifyEmail = async (token) => {
    try {
      const result = await authApi.verifyEmail(token);
      if (result.user) {
        setCurrentUser(result.user);
      }
      showToast("success", result.message || "Email verified successfully!");
      return result;
    } catch (err) {
      showToast("error", err.message);
      throw err;
    }
  };

  const resendVerification = async (email) => {
    try {
      const result = await authApi.resendVerification(email);
      showToast("info", result.message || "Verification email resent.");
      return result;
    } catch (err) {
      showToast("error", err.message);
      throw err;
    }
  };

  const changePassword = async ({ currentPassword, newPassword }) => {
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      showToast("success", "Password updated successfully!");
      setCurrentUser((prev) => (prev ? { ...prev, must_change_password: false } : null));
    } catch (err) {
      showToast("error", err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      setCurrentUser(null);
      showToast("info", "Logged out successfully.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        authLoading,
        login,
        loginWithGoogle,
        register,
        verifyEmail,
        resendVerification,
        changePassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
