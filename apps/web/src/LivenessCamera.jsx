// apps/web/src/LivenessCamera.jsx
import { useEffect, useRef, useState } from "react";
import { LivenessSDK } from "@liveness/sdk";
import { ProgressBar } from "./components/liveness/ProgressBar";

const UI_STATE = {
  LOADING_MODELS: "LOADING_MODELS",
  READY_TO_START: "READY_TO_START",
  CHECKING: "CHECKING",
  SUCCESS: "SUCCESS",
  FAILURE: "FAILURE",
  CAMERA_ERROR: "CAMERA_ERROR",
};

export function LivenessCamera({
  onComplete,
  onCancel,
  title = "Liveness Face Scan",
}) {
  const [uiState, setUiState] = useState(UI_STATE.LOADING_MODELS);
  const [instruction, setInstruction] = useState("Loading AI models, please wait...");
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [distanceHint, setDistanceHint] = useState(null);
  const [progress, setProgress] = useState(0);
  const [selectedChallenges, setSelectedChallenges] = useState([
    "WAITING",
    "BLINK",
    "TURN_LEFT",
    "TURN_RIGHT",
  ]);
  const [resultData, setResultData] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const sdkRef = useRef(null);

  const toggleChallenge = (type) => {
    setSelectedChallenges((prev) => {
      if (prev.includes(type)) {
        if (prev.length === 1) return prev;
        return prev.filter((c) => c !== type);
      } else {
        const order = ["WAITING", "BLINK", "TURN_LEFT", "TURN_RIGHT"];
        const next = [...prev, type];
        return order.filter((c) => next.includes(c));
      }
    });
  };

  useEffect(() => {
    let isMounted = true;

    const sdk = new LivenessSDK({
      basePath: "",
      headTurnThreshold: 0.4,
      challengeTimeout: 10000,
    });
    sdkRef.current = sdk;

    sdk.on("ready", () => {
      if (!isMounted) return;
      setUiState(UI_STATE.READY_TO_START);
      setInstruction('Click "Start Session" to begin biometric scan.');
    });

    sdk.on("challenge", ({ type, instruction: challengeInstruction, distance }) => {
      if (!isMounted) return;
      setCurrentChallenge(type);
      setInstruction(challengeInstruction || `Perform: ${type}`);
      setDistanceHint(distance);
      setProgress(0);
    });

    sdk.on("progress", ({ progress: p }) => {
      if (!isMounted) return;
      setProgress(p || 0);
    });

    sdk.on("success", (livenessResult) => {
      if (!isMounted) return;
      setCurrentChallenge(null);
      setResultData(livenessResult);
      setUiState(UI_STATE.SUCCESS);
      setInstruction("Liveness Verification Passed!");
      try {
        sdk.stop(videoRef.current);
      } catch {
        // ignore
      }
    });

    sdk.on("failure", (err) => {
      if (!isMounted) return;
      setCurrentChallenge(null);
      setUiState(UI_STATE.FAILURE);
      setInstruction(err.message || "Liveness verification failed.");
    });

    sdk.on("error", (err) => {
      if (!isMounted) return;
      setUiState(UI_STATE.CAMERA_ERROR);
      setInstruction(err.message || "System error initializing camera/models.");
    });

    sdk.load().catch((err) => {
      if (!isMounted) return;
      console.error("SDK load error:", err);
      setUiState(UI_STATE.FAILURE);
      setInstruction("Failed to load AI models.");
    });

    const currentVideo = videoRef.current;
    return () => {
      isMounted = false;
      if (sdkRef.current) {
        try {
          sdkRef.current.stop(currentVideo);
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleStartClick = async () => {
    if (!videoRef.current || !canvasRef.current || !sdkRef.current) return;
    setProgress(0);
    setCurrentChallenge(null);
    setUiState(UI_STATE.CHECKING);
    setInstruction("Starting camera...");

    const sessionToken = `sess_${Math.random().toString(36).substring(2, 15)}`;
    sdkRef.current.updateConfig({
      sessionToken,
      challenges: selectedChallenges,
    });

    try {
      await sdkRef.current.start(videoRef.current, canvasRef.current);
    } catch (err) {
      console.error("Camera start error:", err);
      setUiState(UI_STATE.CAMERA_ERROR);
      setInstruction(err.message || "Could not start camera.");
    }
  };

  const handleDone = () => {
    if (resultData && onComplete) {
      onComplete(resultData);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center p-4 bg-white rounded-3xl shadow-xl border border-slate-100 my-4">
      {/* Top Header */}
      <div className="mb-4 flex w-full items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white shadow-sm">
            L
          </div>
          <span className="text-sm font-bold tracking-tight text-slate-800">
            {title}
          </span>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          ✕ Close
        </button>
      </div>

      {/* Challenge Checklist Selection (When Ready or Idle) */}
      {(uiState === UI_STATE.READY_TO_START || uiState === UI_STATE.LOADING_MODELS) && (
        <div className="mb-4 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
          <h4 className="mb-2 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            Active Challenges Sequence
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "WAITING", label: "Center Face" },
              { id: "BLINK", label: "Eye Blink" },
              { id: "TURN_LEFT", label: "Turn Left" },
              { id: "TURN_RIGHT", label: "Turn Right" },
            ].map((ch) => (
              <label
                key={ch.id}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-2.5 text-xs font-bold transition-all ${
                  selectedChallenges.includes(ch.id)
                    ? "border-blue-300 bg-blue-50 text-blue-700 shadow-xs"
                    : "border-slate-200 bg-white text-slate-400 hover:bg-slate-50"
                }`}
              >
                <span>{ch.label}</span>
                <input
                  type="checkbox"
                  disabled={uiState !== UI_STATE.READY_TO_START}
                  checked={selectedChallenges.includes(ch.id)}
                  onChange={() => toggleChallenge(ch.id)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Video Viewport with Dark Aesthetic & Floating Glassmorphic Overlays */}
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-slate-900/10">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="absolute inset-0 h-full w-full scale-x-[-1] transform object-cover"
        />
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />

        {/* Top Floating Status Pill */}
        <div className="absolute top-4 right-0 left-0 z-10 flex justify-center px-4 pointer-events-none">
          <div className="rounded-full border border-white/10 bg-black/60 px-5 py-2 text-center text-xs font-semibold text-white shadow-lg backdrop-blur-md">
            {uiState === UI_STATE.LOADING_MODELS
              ? "⏳ Loading AI Models..."
              : instruction}
          </div>
        </div>

        {/* Floating Distance Warning Pill */}
        {currentChallenge === "WAITING" && distanceHint && (
          <div className="absolute top-1/2 right-0 left-0 z-10 flex justify-center pointer-events-none">
            <div className="rounded-full border border-white/10 bg-red-500/85 px-5 py-2 text-xs font-bold text-white shadow-lg backdrop-blur-md animate-bounce">
              {`⚠️ Move ${distanceHint.toLowerCase()} to camera`}
            </div>
          </div>
        )}

        {/* Turn Left / Turn Right Directional Progress Bar */}
        {(currentChallenge === "TURN_LEFT" || currentChallenge === "TURN_RIGHT") && (
          <div className="absolute right-0 bottom-0 left-0 z-10 p-5">
            <ProgressBar
              progress={progress}
              direction={currentChallenge === "TURN_LEFT" ? "left" : "right"}
            />
          </div>
        )}

        {/* Center Start / Retry Action Screen */}
        {(uiState === UI_STATE.READY_TO_START ||
          uiState === UI_STATE.FAILURE ||
          uiState === UI_STATE.CAMERA_ERROR) && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/45 backdrop-blur-xs p-6 text-center">
            {uiState === UI_STATE.FAILURE || uiState === UI_STATE.CAMERA_ERROR ? (
              <div className="mb-4 text-rose-300 text-xs font-medium bg-rose-950/80 border border-rose-800 px-4 py-2 rounded-xl max-w-sm">
                {instruction}
              </div>
            ) : null}
            <button
              type="button"
              onClick={handleStartClick}
              className="flex transform items-center gap-2 rounded-full px-8 py-3.5 font-bold shadow-xl transition-all bg-blue-600 text-white hover:scale-105 hover:bg-blue-500 active:scale-95 text-sm"
            >
              {uiState === UI_STATE.READY_TO_START
                ? "▶ Start Session"
                : "🔄 Retry Check"}
            </button>
          </div>
        )}

        {/* Full-Frame Success Screen */}
        {uiState === UI_STATE.SUCCESS && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center text-white backdrop-blur-md bg-emerald-600/90 p-6">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white text-emerald-600 shadow-xl text-3xl font-black">
              ✓
            </div>
            <h3 className="px-4 text-center text-xl leading-tight font-extrabold">
              {instruction}
            </h3>
            {resultData?.antiSpoofing && (
              <p className="mt-2 font-mono text-xs text-emerald-100 bg-emerald-800/40 px-3 py-1 rounded-full border border-emerald-400/30">
                Anti-Spoofing Passed
              </p>
            )}
            <button
              type="button"
              onClick={handleDone}
              className="mt-6 rounded-full bg-white px-8 py-2.5 text-xs font-bold text-slate-900 shadow-md hover:bg-slate-100 transition"
            >
              Proceed with Result
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
