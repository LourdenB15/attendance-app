// apps/web/src/components/auth/GoogleLoginButton.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "../../context/useAuth";

export function GoogleLoginButton() {
  const { loginWithGoogle } = useAuth();
  const buttonRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const initializedRef = useRef(false);
  const lastWidthRef = useRef(0);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleCredentialResponse = useCallback(
    async (response) => {
      if (!response.credential) return;
      try {
        const payload = JSON.parse(atob(response.credential.split(".")[1]));
        if (payload?.picture && payload?.email) {
          localStorage.setItem(`user_avatar_${payload.email.toLowerCase()}`, payload.picture);
        }
      } catch (err) {
        console.warn("Could not extract Google profile image:", err);
      }
      setLoading(true);
      try {
        await loginWithGoogle(response.credential);
      } catch {
        // Error toast handled in auth context
      } finally {
        setLoading(false);
      }
    },
    [loginWithGoogle],
  );

  useEffect(() => {
    if (!clientId || !buttonRef.current) return;

    let timeout;
    let observer;

    // Google renders an iframe (200–400px), match container width
    function drawButton() {
      if (!buttonRef.current) return;
      const width = Math.min(400, Math.max(200, buttonRef.current.offsetWidth));
      if (width === lastWidthRef.current) return;
      lastWidthRef.current = width;
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width,
        shape: "rectangular",
        text: "signin_with",
      });
    }

    function renderGoogleButton() {
      if (window.google?.accounts?.id && buttonRef.current) {
        try {
          if (!initializedRef.current) {
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: handleCredentialResponse,
              auto_select: false,
              cancel_on_tap_outside: true,
            });
            initializedRef.current = true;
          }

          drawButton();
          observer = new ResizeObserver(drawButton);
          observer.observe(buttonRef.current);
        } catch (e) {
          console.warn("Failed to initialize Google Sign-In button:", e);
        }
      } else {
        timeout = setTimeout(renderGoogleButton, 150);
      }
    }

    renderGoogleButton();

    return () => {
      if (timeout) clearTimeout(timeout);
      if (observer) observer.disconnect();
    };
  }, [clientId, handleCredentialResponse]);

  if (!clientId) {
    return null;
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div
        ref={buttonRef}
        className="w-full flex justify-center min-h-11"
      />
      {loading && (
        <div className="flex items-center gap-2 mt-2.5 text-xs text-[#1a73e8] font-medium animate-pulse">
          <div className="w-3.5 h-3.5 border-2 border-[#1a73e8] border-t-transparent rounded-full animate-spin" />
          <span>Authenticating with Google...</span>
        </div>
      )}
    </div>
  );
}
