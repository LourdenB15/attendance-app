// apps/web/src/context/AuthContextProvider.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { authApi, setAccountDeactivatedHandler, setRoleChangedHandler } from "../api";
import { useToast } from "./useToast";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { showToast } = useToast();

  // Sign out as soon as any request says this account was deactivated or role changed by an admin.
  // The ref makes sure several failing requests only produce one sign-out and one toast.
  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    setAccountDeactivatedHandler((message) => {
      if (!currentUserRef.current) return;
      currentUserRef.current = null;
      setCurrentUser(null);
      showToast("error", `${message}. Please contact your administrator.`);
    });
    return () => setAccountDeactivatedHandler(null);
  }, [showToast]);

  useEffect(() => {
    setRoleChangedHandler((message) => {
      if (!currentUserRef.current) return;
      currentUserRef.current = null;
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", window.location.pathname);
        try {
          Object.keys(sessionStorage).forEach((key) => {
            if (key.startsWith("attend_nav_") || key.startsWith("layout_")) {
              sessionStorage.removeItem(key);
            }
          });
        } catch {
          // ignore
        }
      }
      setCurrentUser(null);
      showToast("info", message || "Your account role has changed. Please sign in again.");
    });
    return () => setRoleChangedHandler(null);
  }, [showToast]);

  useEffect(() => {
    let ignore = false;
    async function checkSession() {
      try {
        const user = await authApi.getMe();
        if (!ignore && user) {
          const cachedAvatar = localStorage.getItem(`user_avatar_${user.email?.toLowerCase()}`);
          if (cachedAvatar && !user.avatar_url && !user.avatar) {
            user.avatar_url = cachedAvatar;
          }
          setCurrentUser(user);
        }
      } catch (err) {
        if (!ignore) {
          setCurrentUser(null);
          if (err?.code === "ROLE_CHANGED") {
            showToast("info", err.message || "Your account role has changed. Please sign in again.");
          }
        }
      } finally {
        if (!ignore) setAuthLoading(false);
      }
    }
    checkSession();
    return () => {
      ignore = true;
    };
  }, [showToast]);

  // Proactively check session when switching tabs or window focuses
  useEffect(() => {
    if (!currentUser) return;

    let checking = false;
    const revalidate = async () => {
      if (checking || document.visibilityState !== "visible") return;
      checking = true;
      try {
        await authApi.getMe();
      } catch {
        // Handled by roleChangedHandler or accountDeactivatedHandler
      } finally {
        checking = false;
      }
    };

    window.addEventListener("focus", revalidate);
    document.addEventListener("visibilitychange", revalidate);
    const interval = setInterval(revalidate, 30000);

    return () => {
      window.removeEventListener("focus", revalidate);
      document.removeEventListener("visibilitychange", revalidate);
      clearInterval(interval);
    };
  }, [currentUser]);

  const login = async ({ email, password }) => {
    try {
      const user = await authApi.login({ email, password });
      const cachedAvatar = localStorage.getItem(`user_avatar_${user.email?.toLowerCase()}`);
      if (cachedAvatar && !user.avatar_url && !user.avatar) {
        user.avatar_url = cachedAvatar;
      }
      setCurrentUser(user);
      showToast("success", `Welcome back, ${user.full_name}!`);
      return user;
    } catch (err) {
      // Unverified students are sent to the code screen instead (see LoginForm), so no error toast
      if (err.code !== "EMAIL_NOT_VERIFIED") showToast("error", err.message);
      throw err;
    }
  };

  const loginWithGoogle = async (credential) => {
    try {
      try {
        const payload = JSON.parse(atob(credential.split(".")[1]));
        if (payload?.picture && payload?.email) {
          localStorage.setItem(`user_avatar_${payload.email.toLowerCase()}`, payload.picture);
        }
      } catch {
        // ignore
      }
      const user = await authApi.loginWithGoogle(credential);
      const cachedAvatar = localStorage.getItem(`user_avatar_${user.email?.toLowerCase()}`);
      if (cachedAvatar && !user.avatar_url && !user.avatar) {
        user.avatar_url = cachedAvatar;
      }
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

  const resetPassword = async ({ token, newPassword }) => {
    try {
      const result = await authApi.resetPassword({ token, newPassword });
      if (result.user) {
        setCurrentUser(result.user);
      }
      showToast("success", result.message || "Password reset successfully!");
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
      setCurrentUser((prev) =>
        prev ? { ...prev, must_change_password: false, has_password: true } : null,
      );
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
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", window.location.pathname);
        try {
          Object.keys(sessionStorage).forEach((key) => {
            if (key.startsWith("attend_nav_")) {
              sessionStorage.removeItem(key);
            }
          });
        } catch {
          // ignore
        }
      }
      setCurrentUser(null);
      showToast("info", "Logged out successfully.");
    }
  };

  const refreshUser = async () => {
    try {
      const user = await authApi.getMe();
      setCurrentUser(user);
      return user;
    } catch {
      return null;
    }
  };

  const updateProfile = async ({ fullName }) => {
    try {
      const res = await authApi.updateProfile({ fullName });
      const updatedUser = res.user || res;
      setCurrentUser((prev) => ({
        ...prev,
        ...updatedUser,
      }));
      showToast("success", "Profile name updated successfully!");
      return updatedUser;
    } catch (err) {
      showToast("error", err.message);
      throw err;
    }
  };

  // Stable identity + no-op when unchanged: consumers list this in effect deps,
  // so a new function or user object on every call would re-run their fetches in a loop
  const setBiometricEnrolled = useCallback((enrolled = true) => {
    setCurrentUser((prev) =>
      prev && prev.has_biometric_enrolled !== enrolled
        ? { ...prev, has_biometric_enrolled: enrolled }
        : prev,
    );
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        authLoading,
        login,
        loginWithGoogle,
        register,
        verifyEmail,
        resetPassword,
        resendVerification,
        changePassword,
        updateProfile,
        logout,
        refreshUser,
        setBiometricEnrolled,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
