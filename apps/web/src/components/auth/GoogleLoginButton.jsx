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
      setLoading(true);
      try {
        await loginWithGoogle(response.credential);
      } catch {
        // error toast handled in auth context
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

    // Google renders a fixed-width iframe (200–400px), so match the container
    // width and redraw only when it actually changes
    function drawButton() {
      if (!buttonRef.current) return;
      const width = Math.min(400, Math.max(200, buttonRef.current.offsetWidth));
      if (width === lastWidthRef.current) return;
      lastWidthRef.current = width;
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width,
        shape: "pill",
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
          // Redraw on window resize / phone rotation
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
    <div className="flex flex-col items-center">
      <div
        ref={buttonRef}
        className="w-full flex justify-center min-h-[44px]"
      ></div>
      {loading && (
        <span className="text-xs text-indigo-600 mt-2 font-medium animate-pulse">
          Authenticating with Google...
        </span>
      )}
    </div>
  );
}
