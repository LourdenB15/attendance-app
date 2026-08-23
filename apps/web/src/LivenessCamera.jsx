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
          setStatusText("Ready! Follow the instructions on screen.");
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
    setStatusText("Restarting...");
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
    <fieldset style={{ border: "2px solid #333", padding: "16px", margin: "16px 0", maxWidth: "680px" }}>
      <legend><strong>{title}</strong></legend>

      {errorMsg ? (
        <div style={{ color: "red", margin: "10px 0" }}>
          <p><strong>Error:</strong> {errorMsg}</p>
          <button type="button" onClick={handleRetry} style={{ marginRight: "8px" }}>Retry</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: "8px" }}>
            <strong>Status:</strong> {statusText}
          </div>

          <div style={{ backgroundColor: "#eee", padding: "8px", margin: "8px 0", fontWeight: "bold" }}>
            👉 Instruction: {instruction}
          </div>

          {distanceInfo && (
            <div style={{ color: distanceInfo === "CLOSER" ? "orange" : "blue", marginBottom: "8px" }}>
              Distance feedback: Move {distanceInfo.toLowerCase()}
            </div>
          )}

          <div style={{ marginBottom: "12px" }}>
            <label htmlFor="liveness-progress"><strong>Challenge Progress:</strong> {progress}%</label>
            <br />
            <progress id="liveness-progress" value={progress} max="100" style={{ width: "100%", height: "20px" }} />
          </div>

          {/* Video and Canvas container */}
          <div style={{ position: "relative", width: "480px", height: "360px", background: "#000", margin: "0 auto" }}>
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "480px",
                height: "360px",
                objectFit: "cover",
              }}
            />
            <canvas
              ref={canvasRef}
              width={480}
              height={360}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "480px",
                height: "360px",
                pointerEvents: "none",
              }}
            />
          </div>

          <div style={{ marginTop: "12px", textAlign: "right" }}>
            <button type="button" onClick={onCancel} disabled={isInitializing}>
              Cancel Scan
            </button>
          </div>
        </div>
      )}
    </fieldset>
  );
}
