// apps/web/src/components/auth/GoogleLoginButton.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "../../context/useAuth";

export function GoogleLoginButton() {
  const { loginWithGoogle } = useAuth();
  const buttonRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const initializedRef = useRef(false);

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
    if (!clientId || !buttonRef.current || initializedRef.current) return;

    let timeout;
    function renderGoogleButton() {
      if (window.google?.accounts?.id && buttonRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: "outline",
            size: "large",
            width: "380",
            shape: "pill",
            text: "signin_with",
          });

          initializedRef.current = true;
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
    };
  }, [clientId, handleCredentialResponse]);

  if (!clientId) {
    return (
      <div className="text-center p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
        <p className="text-xs text-slate-500">
          Google Sign-In is ready. Add{" "}
          <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono text-[11px]">
            VITE_GOOGLE_CLIENT_ID
          </code>{" "}
          to your{" "}
          <code className="font-mono text-[11px]">apps/web/.env</code> to
          activate 1-click Google login.
        </p>
      </div>
    );
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
