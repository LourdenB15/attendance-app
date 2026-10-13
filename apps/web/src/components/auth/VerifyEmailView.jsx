// apps/web/src/components/auth/VerifyEmailView.jsx
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../../context/useAuth";
import {
  IconCheck,
  IconChevronLeft,
  IconRefresh,
  IconCheckCircle,
} from "../ui/Icons";

export function VerifyEmailView({ onSuccess, onBackToLogin, initialEmail = "" }) {
  const { verifyEmail, resendVerification } = useAuth();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState(() => {
    if (initialEmail) return initialEmail;
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      return p.get("email") || "";
    }
    return "";
  });
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const submitCode = useCallback(
    async (codeToVerify) => {
      if (codeToVerify.length !== 6) return;
      setLoading(true);
      setHasError(false);
      try {
        await verifyEmail({ email: email.trim(), code: codeToVerify });
        setVerifiedSuccess(true);
        if (onSuccess) {
          setTimeout(() => onSuccess(), 1000);
        }
      } catch {
        setHasError(true);
      } finally {
        setLoading(false);
      }
    },
    [email, verifyEmail, onSuccess],
  );

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleDigitChange = (index, value) => {
    if (hasError) setHasError(false);
    const cleanVal = value.replace(/\D/g, "");

    if (!cleanVal) {
      const newDigits = [...digits];
      newDigits[index] = "";
      setDigits(newDigits);
      return;
    }

    // If user types over an existing single digit, take the newly entered digit
    if (cleanVal.length === 2 && digits[index]) {
      const char = cleanVal.charAt(cleanVal.length - 1);
      const newDigits = [...digits];
      newDigits[index] = char;
      setDigits(newDigits);
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
      const fullCode = newDigits.join("");
      if (fullCode.length === 6) {
        submitCode(fullCode);
      }
      return;
    }

    if (cleanVal.length > 1) {
      const pasteDigits = cleanVal.slice(0, 6).split("");
      const newDigits = [...digits];
      pasteDigits.forEach((d, i) => {
        if (index + i < 6) newDigits[index + i] = d;
      });
      setDigits(newDigits);
      const nextFocus = Math.min(index + pasteDigits.length, 5);
      inputRefs.current[nextFocus]?.focus();

      const fullCode = newDigits.join("");
      if (fullCode.length === 6) {
        submitCode(fullCode);
      }
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleanVal;
    setDigits(newDigits);

    if (index < 5 && cleanVal) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = newDigits.join("");
    if (fullCode.length === 6) {
      submitCode(fullCode);
    }
  };

  const handleKeyDown = (index, e) => {
    if (hasError) setHasError(false);

    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index]) {
        // Populated: clear current input and keep focus here
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
      } else if (index > 0) {
        // Empty: move focus to previous input and clear it so the user can correct it immediately
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }

    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
      return;
    }

    if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
      return;
    }

    if (e.key === "Delete") {
      e.preventDefault();
      if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
      }
      return;
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    if (hasError) setHasError(false);
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasteData) return;

    const pasteDigits = pasteData.slice(0, 6).split("");
    const newDigits = ["", "", "", "", "", ""];
    pasteDigits.forEach((d, i) => {
      newDigits[i] = d;
    });
    setDigits(newDigits);
    inputRefs.current[Math.min(pasteDigits.length, 5)]?.focus();

    if (pasteDigits.length === 6) {
      submitCode(newDigits.join(""));
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const fullCode = digits.join("");
    if (fullCode.length === 6) {
      submitCode(fullCode);
    }
  };

  const handleResend = async () => {
    if (!email.trim() || resendCooldown > 0) return;
    setResending(true);
    setHasError(false);
    try {
      await resendVerification(email.trim());
      setDigits(["", "", "", "", "", ""]);
      setResendCooldown(30);
      inputRefs.current[0]?.focus();
    } catch {
      setHasError(true);
    } finally {
      setResending(false);
    }
  };

  if (verifiedSuccess) {
    return (
      <div className="text-center py-6 space-y-3 animate-in fade-in duration-200">
        <div className="w-12 h-12 rounded-xl bg-[#e6f4ea] text-[#137333] flex items-center justify-center mx-auto">
          <IconCheckCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-[#202124]">Email verified!</h2>
        <p className="text-xs text-[#5f6368]">
          Redirecting to your classes...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header and Back Link */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#202124] tracking-tight">
            Verify email
          </h2>
          <p className="text-xs text-[#5f6368] mt-1">
            Enter the 6-digit code sent to your email.
          </p>
        </div>
        {onBackToLogin && (
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-xs text-[#1a73e8] hover:text-[#1557b0] font-medium flex items-center gap-1 transition cursor-pointer"
          >
            <IconChevronLeft className="w-3.5 h-3.5" />
            <span>Sign in</span>
          </button>
        )}
      </div>

      {/* Destination email info */}
      <div className="p-3 bg-[#f8f9fa] rounded-xl flex items-center justify-between gap-3 text-xs">
        <div className="min-w-0">
          <span className="text-[#5f6368] block text-[10px] uppercase font-semibold">Sent to</span>
          {isEditingEmail ? (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-0.5 px-2 py-0.5 bg-white border border-[#dadce0] rounded text-xs font-mono w-full"
            />
          ) : (
            <span className="font-mono font-bold text-[#202124] truncate block">
              {email || "Registered email"}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsEditingEmail((p) => !p)}
          className="text-[#1a73e8] hover:text-[#1557b0] font-semibold text-xs shrink-0 cursor-pointer"
        >
          {isEditingEmail ? "Save" : "Edit"}
        </button>
      </div>

      {/* 6-digit boxes */}
      <form onSubmit={handleManualSubmit} className="space-y-4">
        <div className="flex justify-between items-center gap-2" onPaste={handlePaste}>
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={2}
              value={digit}
              aria-label={`Digit ${idx + 1} of 6`}
              aria-invalid={hasError ? "true" : undefined}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onFocus={(e) => e.target.select()}
              className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-mono font-bold bg-white rounded-xl text-[#202124] focus:outline-none transition-all ${
                hasError
                  ? "border border-[#d93025] ring-3 ring-[#d93025]/20 shadow-[0_0_12px_rgba(217,48,37,0.18)] focus:border-[#d93025] focus:ring-3 focus:ring-[#d93025]/30"
                  : "border border-[#dadce0] focus:border-[#1a73e8] focus:ring-3 focus:ring-[#e8f0fe]"
              }`}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || digits.join("").length !== 6}
          className="w-full py-2.5 px-4 bg-[#1a73e8] hover:bg-[#1557b0] active:bg-[#174ea6] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-3 focus-visible:ring-[#1a73e8]/30 min-h-[42px]"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <span>Verify code</span>
              <IconCheck className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Resend */}
      <div className="pt-2 text-center">
        <button
          type="button"
          disabled={resending || !email.trim() || resendCooldown > 0}
          onClick={handleResend}
          className="inline-flex items-center gap-1.5 text-xs text-[#1a73e8] hover:text-[#1557b0] disabled:text-[#80868b] transition cursor-pointer"
        >
          {resending ? (
            <>
              <IconRefresh className="w-3.5 h-3.5 animate-spin" />
              <span>Sending...</span>
            </>
          ) : resendCooldown > 0 ? (
            <span>Resend code in {resendCooldown}s</span>
          ) : (
            <>
              <IconRefresh className="w-3.5 h-3.5" />
              <span>Resend code</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
