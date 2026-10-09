// apps/web/src/components/auth/VerifyEmailView.jsx
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../../context/useAuth";
import { IconCheck, IconChevronLeft } from "../ui/Icons";

export function VerifyEmailView({ onSuccess, onBackToLogin, initialEmail = "" }) {
  const { verifyEmail, resendVerification } = useAuth();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const inputRefs = useRef([]);

  const submitCode = useCallback(
    async (codeToVerify) => {
      if (codeToVerify.length !== 6) return;
      setLoading(true);
      try {
        await verifyEmail({ email, code: codeToVerify });
        setVerifiedSuccess(true);
        if (onSuccess) onSuccess();
      } catch {
        // toast handled in context
      } finally {
        setLoading(false);
      }
    },
    [email, verifyEmail, onSuccess],
  );

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleDigitChange = (index, value) => {
    // Only allow numbers
    const cleanVal = value.replace(/\D/g, "");
    if (!cleanVal) {
      const newDigits = [...digits];
      newDigits[index] = "";
      setDigits(newDigits);
      return;
    }

    // If pasted multiple digits
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

    // Auto advance to next box
    if (index < 5 && cleanVal) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = newDigits.join("");
    if (fullCode.length === 6) {
      submitCode(fullCode);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
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
    if (!email.trim()) return;
    setResending(true);
    try {
      await resendVerification(email.trim());
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch {
      // toast in context
    } finally {
      setResending(false);
    }
  };

  if (verifiedSuccess) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#e6f4ea] text-[#137333] flex items-center justify-center mx-auto shadow-xs">
          <IconCheck className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#202124]">Email Verified!</h3>
        <p className="text-xs text-[#5f6368]">
          Your account is activated. Redirecting you to your classroom dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#202124]">Enter Verification Code</h3>
        {onBackToLogin && (
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-xs text-[#1a73e8] hover:text-[#1557b0] font-medium flex items-center gap-1"
          >
            <IconChevronLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </button>
        )}
      </div>

      <div className="text-center bg-[#f8f9fa] border border-[#dadce0] rounded-xl p-3.5">
        <p className="text-xs text-[#5f6368]">
          We sent a 6-digit verification code to
        </p>
        <p className="text-xs font-semibold text-[#202124] font-mono mt-0.5">
          {email || "your registered email"}
        </p>
      </div>

      <form onSubmit={handleManualSubmit} className="space-y-5">
        {/* 6-Digit Boxes */}
        <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e.key)}
              className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-mono font-bold bg-white border-2 border-[#dadce0] rounded-xl text-[#202124] focus:border-[#1a73e8] focus:ring-3 focus:ring-[#e8f0fe] focus:outline-none transition-all shadow-xs"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || digits.join("").length !== 6}
          className="w-full py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs text-sm transition"
        >
          {loading ? "Verifying code..." : "Verify Code & Sign In"}
        </button>
      </form>

      {/* Resend Code Section */}
      <div className="border-t border-[#dadce0] pt-4 text-center space-y-2">
        <p className="text-xs text-[#70757a]">
          Didn't receive the code?
        </p>
        <button
          type="button"
          disabled={resending || !email}
          onClick={handleResend}
          className="text-xs font-medium text-[#1a73e8] hover:text-[#1557b0] disabled:opacity-50"
        >
          {resending ? "Sending new code..." : "Resend 6-digit Code"}
        </button>

        {!email && (
          <div className="pt-2">
            <input
              type="email"
              placeholder="Enter email to resend code..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#dadce0] rounded-lg text-xs text-[#202124] focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#e8f0fe]"
            />
          </div>
        )}
      </div>
    </div>
  );
}
