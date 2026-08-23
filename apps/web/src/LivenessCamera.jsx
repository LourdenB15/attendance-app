// apps/web/src/LivenessCamera.jsx
import { useEffect, useRef, useState } from "react";
import { LivenessSDK } from "@liveness/sdk";

export function LivenessCamera({ onComplete, onCancel, title = "Liveness Face Scan" }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const sdkRef = useRef(null);

  const [statusText, setStatusText] = useState("Loading AI models...");
  const [instruction, setInstruction] = useState("Please look directly at the camera");
  const [distanceInfo, setDistanceInfo] = useState(null);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const sdk = new LivenessSDK({ basePath: "" });
    sdkRef.current = sdk;
    const videoEl = videoRef.current;

    async function initCamera() {
      try {
        setStatusText("Loading models...");
        await sdk.load();

        if (!isMounted) return;

        sdk.on("ready", () => {
          if (!isMounted) return;
          setStatusText("Camera ready! Follow the instructions on screen.");
          setIsInitializing(false);
        });

        sdk.on("challenge", (payload) => {
          if (!isMounted) return;
          setInstruction(payload.instruction || `Perform: ${payload.type}`);
          setDistanceInfo(payload.distance);
        });

        sdk.on("progress", (payload) => {
          if (!isMounted) return;
          setProgress(Math.round((payload.progress || 0) * 100));
        });

        sdk.on("success", (result) => {
          if (!isMounted) return;
          setStatusText("Liveness check succeeded! Processing...");
          sdk.stop(videoEl);
          onComplete(result);
        });

        sdk.on("failure", (err) => {
          if (!isMounted) return;
          setErrorMsg(err.message || "Liveness check failed");
        });

        sdk.on("error", (err) => {
          if (!isMounted) return;
          setErrorMsg(err.message || "An unexpected camera/model error occurred");
        });

        if (videoRef.current && canvasRef.current) {
          await sdk.start(videoRef.current, canvasRef.current);
        }
      } catch (err) {
        if (!isMounted) return;
        setErrorMsg(err.message || "Failed to initialize liveness detector");
        setIsInitializing(false);
      }
    }

    initCamera();

    return () => {
      isMounted = false;
      if (sdkRef.current) {
        try {
          sdkRef.current.stop(videoEl);
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [onComplete]);

  const handleRetry = async () => {
    setErrorMsg(null);
    setProgress(0);
    setStatusText("Restarting camera...");
    setInstruction("Please look directly at the camera");
    if (sdkRef.current && videoRef.current && canvasRef.current) {
      try {
        sdkRef.current.stop(videoRef.current);
        await sdkRef.current.start(videoRef.current, canvasRef.current);
      } catch (err) {
        setErrorMsg(err.message || "Could not restart camera");
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-xl mx-auto my-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
          {title}
        </h3>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
          {statusText}
        </span>
      </div>

      {errorMsg ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 text-center my-4">
          <div className="text-rose-600 font-semibold text-base mb-1">Scan Failed</div>
          <p className="text-rose-700 text-sm mb-4">{errorMsg}</p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={handleRetry}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium shadow-sm transition"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active instruction banner */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3.5 text-center">
            <div className="text-xs uppercase tracking-wider text-indigo-500 font-semibold mb-0.5">Instruction</div>
            <div className="text-base font-bold text-indigo-900">{instruction}</div>
            {distanceInfo && (
              <div
                className={`text-xs font-semibold mt-1 ${
                  distanceInfo === "CLOSER" ? "text-amber-600" : "text-sky-600"
                }`}
              >
                ⚠️ Please move {distanceInfo.toLowerCase()} to the camera
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
              <span>Challenge Completion</span>
              <span className="font-bold text-indigo-600">{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Video & Canvas Frame */}
          <div className="relative w-[480px] h-[360px] max-w-full mx-auto bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-800">
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
            />
            <canvas
              ref={canvasRef}
              width={480}
              height={360}
              className="absolute inset-0 w-full h-full pointer-events-none scale-x-[-1]"
            />

            {/* Oval Face Alignment Guide Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-56 h-72 rounded-[50%] border-2 border-dashed border-white/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]"></div>
            </div>
          </div>

          {/* Cancel button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isInitializing}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium hover:bg-slate-100 rounded-lg transition"
            >
              Cancel Scan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
