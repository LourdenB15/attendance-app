// apps/web/src/LivenessCamera.jsx
import { useEffect, useRef, useState } from "react";
import { LivenessSDK } from "@liveness/sdk";
import { ProgressBar } from "./components/liveness/ProgressBar";
import {
  IconCamera,
  IconClose,
  IconCheck,
  IconAlert,
  IconShieldCheck,
  IconRefresh,
} from "./components/ui/Icons";

const UI_STATE = {
  LOADING_MODELS: "LOADING_MODELS",
  READY_TO_START: "READY_TO_START",
  CHECKING: "CHECKING",
  SUCCESS: "SUCCESS",
  FAILURE: "FAILURE",
  CAMERA_ERROR: "CAMERA_ERROR",
};

/**
 * Resolves FaceMesh constructor from window global (loaded via index.html script)
 */
async function getFaceMeshConstructor(maxWaitMs = 2000) {
  if (typeof window === "undefined") return null;
  if (window.FaceMesh) return window.FaceMesh;

  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitMs) {
    if (window.FaceMesh) return window.FaceMesh;
    await new Promise((r) => setTimeout(r, 50));
  }

  return window.FaceMesh || null;
}

/**
 * Asynchronously loads and initializes MediaPipe Face Mesh model assets.
 * Ensures the WASM binary, binarypb graph, and solution packed assets
 * are fully pre-fetched, compiled, and ready in browser memory/cache.
 */
async function loadFaceMeshModel(basePath = "") {
  const cleanBasePath = (basePath || "").replace(/\/+$/, "");

  // 1. Pre-fetch binarypb and WASM solution files into browser HTTP cache
  const assets = [
    `${cleanBasePath}/face_mesh/face_mesh.binarypb`,
    `${cleanBasePath}/face_mesh/face_mesh_solution_packed_assets.data`,
    `${cleanBasePath}/face_mesh/face_mesh_solution_simd_wasm_bin.wasm`,
    `${cleanBasePath}/face_mesh/face_mesh_solution_simd_wasm_bin.js`,
    `${cleanBasePath}/face_mesh/face_mesh_solution_packed_assets_loader.js`,
  ];

  const prefetchPromise = Promise.allSettled(
    assets.map(async (url) => {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to load ${url} (status: ${res.status})`);
      }
      return res;
    })
  );

  // 2. Resolve constructor and initialize graph to compile WASM
  const FaceMeshConstructor = await getFaceMeshConstructor();
  if (FaceMeshConstructor) {
    try {
      const meshInstance = new FaceMeshConstructor({
        locateFile: (file) => `${cleanBasePath}/face_mesh/${file}`,
      });
      meshInstance.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      await meshInstance.initialize();
      try {
        await meshInstance.close();
      } catch {
        // ignore close cleanup error
      }
    } catch (err) {
      console.warn("FaceMesh runtime initialization warning, waiting on asset prefetch:", err);
      await prefetchPromise;
    }
  } else {
    const results = await prefetchPromise;
    const failures = results.filter((r) => r.status === "rejected");
    if (failures.length === assets.length) {
      throw new Error("Unable to fetch Face Mesh model assets.");
    }
  }
}

export function LivenessCamera({
  onComplete,
  onCancel,
  title = "Liveness Face Verification",
  mode = "attendance", // "attendance" | "enrollment"
  defaultChallenges,
}) {
  const isAttendance = mode === "attendance";
  const [uiState, setUiState] = useState(UI_STATE.LOADING_MODELS);
  const [instruction, setInstruction] = useState("Initializing Face Mesh & biometric AI models...");
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [distanceHint, setDistanceHint] = useState(null);
  const [progress, setProgress] = useState(0);
  const selectedChallenges = defaultChallenges ?? null;
  const [resultData, setResultData] = useState(null);
  const [useContainFit, setUseContainFit] = useState(false);
  const [isPortraitMode, setIsPortraitMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia?.("(orientation: portrait)").matches ||
      window.innerHeight > window.innerWidth ||
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    );
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const sdkRef = useRef(null);
  const isModelLoadedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const isAttendanceRef = useRef(isAttendance);

  useEffect(() => {
    const updateOrientation = () => {
      const portrait =
        window.matchMedia?.("(orientation: portrait)").matches ||
        window.innerHeight > window.innerWidth ||
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      setIsPortraitMode(portrait);
    };

    window.addEventListener("resize", updateOrientation);
    window.addEventListener("orientationchange", updateOrientation);
    return () => {
      window.removeEventListener("resize", updateOrientation);
      window.removeEventListener("orientationchange", updateOrientation);
    };
  }, []);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    isAttendanceRef.current = isAttendance;
  }, [isAttendance]);

  useEffect(() => {
    let isMounted = true;
    let isSdkReady = false;
    let isMeshReady = false;

    const checkAllReady = () => {
      if (!isMounted) return;
      if (isSdkReady && isMeshReady) {
        isModelLoadedRef.current = true;
        setUiState(UI_STATE.READY_TO_START);
        setInstruction(
          isAttendanceRef.current
            ? 'Look straight at the camera and click "Start Attendance Scan"'
            : 'Click "Begin Biometric Scan" to register your facial profile.'
        );
      }
    };

    const sdk = new LivenessSDK({
      basePath: "",
      headTurnThreshold: 0.4,
      challengeTimeout: 10000,
      minFaceSize: 0.10,
      maxFaceSize: 0.75,
    });
    sdkRef.current = sdk;

    sdk.on("ready", () => {
      if (!isMounted) return;
      isSdkReady = true;
      checkAllReady();
    });

    sdk.on("challenge", ({ type, instruction: challengeInstruction, distance }) => {
      if (!isMounted) return;
      setCurrentChallenge(type);
      setInstruction(
        isAttendanceRef.current && type === "WAITING"
          ? "Position your face inside the oval guide..."
          : challengeInstruction || `Perform: ${type}`
      );
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
      setInstruction(
        isAttendanceRef.current
          ? "Face Captured Successfully!"
          : "Biometric Identity Scan Passed!"
      );

      try {
        sdk.stop(videoRef.current);
      } catch {
        // ignore
      }

      // Hand the result over automatically after brief pause so the success screen is seen
      if (onCompleteRef.current) {
        setTimeout(() => {
          if (isMounted && onCompleteRef.current) {
            onCompleteRef.current(livenessResult);
          }
        }, 700);
      }
    });

    sdk.on("failure", (err) => {
      if (!isMounted) return;
      setCurrentChallenge(null);
      if (err?.code === "MODEL_LOAD_FAILED") {
        isModelLoadedRef.current = false;
        isSdkReady = false;
      }
      setUiState(UI_STATE.FAILURE);
      setInstruction(err.message || "Liveness verification was not completed.");
    });

    sdk.on("error", (err) => {
      if (!isMounted) return;
      if (err?.code === "MODEL_LOAD_FAILED") {
        isModelLoadedRef.current = false;
        isSdkReady = false;
      }
      setUiState(UI_STATE.CAMERA_ERROR);
      setInstruction(err.message || "Unable to access camera or load biometric models.");
    });

    // Concurrently load FaceMesh assets and FaceRecognition models
    Promise.all([
      sdk.load().then(() => {
        isSdkReady = true;
      }),
      loadFaceMeshModel("").then(() => {
        isMeshReady = true;
      }),
    ])
      .then(() => {
        checkAllReady();
      })
      .catch((err) => {
        if (!isMounted) return;
        isModelLoadedRef.current = false;
        console.error("AI model initialization error (FaceMesh / Recognition):", err);
        setUiState(UI_STATE.FAILURE);
        setInstruction(err.message || "Failed to load AI face mesh & biometric models.");
      });

    const currentVideo = videoRef.current;
    return () => {
      isMounted = false;
      if (currentVideo?.srcObject) {
        try {
          currentVideo.srcObject.getTracks().forEach((track) => track.stop());
          currentVideo.srcObject = null;
        } catch {
          // ignore
        }
      }
      if (sdkRef.current) {
        try {
          sdkRef.current.stop(currentVideo);
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleClose = () => {
    if (videoRef.current?.srcObject) {
      try {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      } catch {
        // ignore
      }
    }
    if (sdkRef.current) {
      try {
        sdkRef.current.stop(videoRef.current);
      } catch {
        // ignore
      }
    }
    if (onCancel) onCancel();
  };

  const handleStartClick = async () => {
    if (!videoRef.current || !canvasRef.current || !sdkRef.current) return;

    if (!isModelLoadedRef.current) {
      setUiState(UI_STATE.LOADING_MODELS);
      setInstruction("Loading AI face mesh & biometric models, please wait...");
      try {
        await Promise.all([
          sdkRef.current.load(),
          loadFaceMeshModel(""),
        ]);
        isModelLoadedRef.current = true;
        setUiState(UI_STATE.READY_TO_START);
      } catch (err) {
        console.error("SDK reload error:", err);
        setUiState(UI_STATE.FAILURE);
        setInstruction(err.message || "Failed to load AI face mesh & biometric models.");
        return;
      }
      if (!isModelLoadedRef.current) {
        return;
      }
    }

    // Stop any existing stream before opening a fresh one
    if (videoRef.current.srcObject) {
      try {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      } catch {
        // ignore
      }
    }

    setProgress(0);
    setCurrentChallenge(null);
    setUiState(UI_STATE.CHECKING);
    setInstruction("Initializing camera feed...");

    const sessionToken = `sess_${Math.random().toString(36).substring(2, 15)}`;
    sdkRef.current.updateConfig({
      sessionToken,
      challenges: selectedChallenges,
      minFaceSize: 0.10,
      maxFaceSize: 0.75,
    });

    try {
      // Determine orientation dynamically: phones or portrait viewports get native portrait stream
      const isPortrait =
        typeof window !== "undefined" && (
          window.matchMedia?.("(orientation: portrait)").matches ||
          window.innerHeight > window.innerWidth ||
          /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
        );

      let stream = null;
      if (isPortrait) {
        // Phone/Portrait: Request wide uncropped camera sensor stream matching 4:5 / 3:4 viewport
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "user",
              aspectRatio: { ideal: 4 / 5 },
              width: { ideal: 960, max: 1440 },
              height: { ideal: 1200, max: 1920 },
            },
            audio: false,
          });
        } catch {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: {
                facingMode: "user",
                aspectRatio: { ideal: 3 / 4 },
                width: { ideal: 720, max: 1080 },
                height: { ideal: 960, max: 1440 },
              },
              audio: false,
            });
          } catch {
            try {
              stream = await navigator.mediaDevices.getUserMedia({
                video: {
                  facingMode: "user",
                  width: { ideal: 720 },
                  height: { ideal: 960 },
                  aspectRatio: { ideal: 3 / 4 },
                },
                audio: false,
              });
            } catch {
              // will fallback below
            }
          }
        }
      } else {
        // Desktop/Landscape: Standard landscape webcam constraints
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "user",
              width: { ideal: 1280 },
              height: { ideal: 720 },
              aspectRatio: { ideal: 16 / 9 },
            },
            audio: false,
          });
        } catch {
          // will fallback below
        }
      }

      // Universal fallback if strict resolution constraints were rejected
      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
      }

      // Ensure mobile camera uses widest optical field of view (no digital zoom)
      const [videoTrack] = stream.getVideoTracks();
      if (videoTrack) {
        try {
          const capabilities = videoTrack.getCapabilities?.() || {};
          if (capabilities.zoom) {
            const minZoom = capabilities.zoom.min || 1;
            await videoTrack.applyConstraints({
              advanced: [{ zoom: minZoom }],
            });
          }
        } catch {
          // ignore if zoom constraint is not supported by driver
        }
      }

      const videoEl = videoRef.current;
      videoEl.srcObject = stream;

      // Await video metadata and play so dimensions are initialized before passing to SDK
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Camera initialization timed out.")), 10000);
        if (videoEl.readyState >= 2) {
          clearTimeout(timeout);
          videoEl.play().then(resolve).catch(reject);
        } else {
          videoEl.onloadedmetadata = () => {
            clearTimeout(timeout);
            videoEl.play().then(resolve).catch(reject);
          };
        }
      });

      // If the viewport is in portrait mode, but the camera stream delivered is landscape (width > height),
      // object-cover would zoom in by over 200%, cutting off the face. Using object-contain preserves the full uncropped camera view.
      const vW = videoEl.videoWidth || 1;
      const vH = videoEl.videoHeight || 1;
      if (isPortrait && vW > vH) {
        setUseContainFit(true);
      } else {
        setUseContainFit(false);
      }

      // Start the SDK with our pre-configured portrait/landscape stream
      await sdkRef.current.start(videoRef.current, canvasRef.current);
    } catch (err) {
      console.error("Camera start error:", err);
      setUiState(UI_STATE.CAMERA_ERROR);
      setInstruction(err.message || "Could not start camera. Please verify camera permissions.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#202124]/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="liveness-camera-title"
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#dadce0] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-[#e8eaed] flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
              <IconCamera className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 id="liveness-camera-title" className="text-sm font-bold text-[#202124] leading-tight truncate">
                {title}
              </h3>
              <span className="text-[11px] text-[#5f6368] font-normal leading-tight block truncate">
                Attendance Live • Biometric Verification
              </span>
            </div>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124] transition-colors shrink-0 ml-2"
              aria-label="Close scanner"
            >
              <IconClose className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Video Viewport Container */}
        <div className="p-3 sm:p-4">
          <div
            className={`relative w-full overflow-hidden rounded-xl bg-slate-950 shadow-inner border border-slate-800 transition-all duration-200 ${
              isPortraitMode
                ? "aspect-4/5 max-h-[60vh]"
                : "aspect-4/3 max-h-[68vh]"
            }`}
          >
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={`absolute inset-0 h-full w-full scale-x-[-1] ${
                useContainFit ? "object-contain" : "object-cover"
              }`}
            />
            <canvas
              ref={canvasRef}
              className={`pointer-events-none absolute inset-0 h-full w-full ${
                useContainFit ? "object-contain" : "object-cover"
              }`}
            />

            {/* Oval Face Guide Overlay during active checking */}
            {uiState === UI_STATE.CHECKING && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div
                  className={`rounded-[50%] border-2 border-dashed border-white/70 animate-pulse transition-all shadow-sm ${
                    isPortraitMode ? "w-36 h-50 sm:w-42 sm:h-58" : "w-52 h-68"
                  }`}
                />
              </div>
            )}

          {/* Top Real-time Instruction Banner */}
          <div className="absolute top-4 inset-x-0 z-10 flex justify-center px-4 pointer-events-none">
            <div className="rounded-full border border-white/20 bg-[#202124]/85 px-4 py-2 text-center text-xs font-semibold text-white shadow-md backdrop-blur-md flex items-center gap-2 max-w-sm">
              {uiState === UI_STATE.LOADING_MODELS ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0"></div>
                  <span>{instruction || "Loading AI face mesh & biometric models..."}</span>
                </>
              ) : (
                <span>{instruction}</span>
              )}
            </div>
          </div>

          {/* Floating Distance Warning Hint */}
          {currentChallenge === "WAITING" && distanceHint && (
            <div className="absolute top-1/2 inset-x-0 z-10 flex justify-center pointer-events-none -translate-y-1/2 px-4">
              <div className="rounded-full border border-amber-300/40 bg-[#b06000]/90 px-4 py-2 text-xs font-bold text-white shadow-lg backdrop-blur-md animate-bounce flex items-center gap-1.5">
                <IconAlert className="w-4 h-4 text-amber-200" />
                <span>
                  {distanceHint === "FURTHER"
                    ? "Move farther back from camera"
                    : "Move closer to camera"}
                </span>
              </div>
            </div>
          )}

          {/* Turn Left / Turn Right Directional Progress Bar */}
          {(currentChallenge === "TURN_LEFT" || currentChallenge === "TURN_RIGHT") && (
            <div className="absolute inset-x-0 bottom-4 z-10 px-5">
              <ProgressBar
                progress={progress}
                direction={currentChallenge === "TURN_LEFT" ? "left" : "right"}
              />
            </div>
          )}

          {/* Center Start / Pre-flight / Error Recovery Screen */}
          {(uiState === UI_STATE.READY_TO_START ||
            uiState === UI_STATE.FAILURE ||
            uiState === UI_STATE.CAMERA_ERROR) && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#202124]/75 backdrop-blur-xs p-6 text-center text-white">
              {uiState === UI_STATE.READY_TO_START ? (
                <div className="max-w-xs space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#1a73e8] text-white flex items-center justify-center mx-auto shadow-md">
                    <IconCamera className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold">Face Verification Ready</h4>
                    <p className="text-xs text-white/80 mt-1 leading-relaxed">
                      Ensure good lighting, look straight ahead, and follow any prompts on screen.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleStartClick}
                    className="w-full py-3 px-6 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold rounded-full shadow-lg transition-transform hover:scale-102 active:scale-98 text-sm flex items-center justify-center gap-2"
                  >
                    <span>▶</span>
                    <span>
                      {isAttendance ? "Start Attendance Scan" : "Begin Face Enrollment"}
                    </span>
                  </button>
                </div>
              ) : (
                <div className="max-w-xs space-y-3.5">
                  <div className="w-12 h-12 rounded-full bg-[#c5221f] text-white flex items-center justify-center mx-auto shadow-md">
                    <IconAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-rose-200">
                      Verification Interrupted
                    </h4>
                    <p className="text-xs text-rose-100/90 mt-1 leading-relaxed bg-black/30 p-2.5 rounded-lg border border-white/10">
                      {instruction}
                    </p>
                  </div>
                  <p className="text-[11px] text-white/70">
                    Tips: Ensure adequate lighting, keep face steady, and check camera permissions.
                  </p>
                  <button
                    type="button"
                    onClick={handleStartClick}
                    className="w-full py-2.5 px-6 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold rounded-full shadow-md transition-transform hover:scale-102 active:scale-98 text-xs flex items-center justify-center gap-2"
                  >
                    <IconRefresh className="w-4 h-4" />
                    <span>Try Again</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Success Confirmation Screen */}
          {uiState === UI_STATE.SUCCESS && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center text-white backdrop-blur-md bg-[#137333]/92 p-6 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-white text-[#137333] flex items-center justify-center text-3xl font-black shadow-xl mb-3">
                <IconCheck className="w-8 h-8 text-[#137333]" />
              </div>
              <h4 className="text-xl font-bold leading-tight">
                {instruction}
              </h4>
              <p className="text-xs text-white/90 mt-1">
                Submitting verification to classroom server...
              </p>
              {resultData?.antiSpoofing && (
                <div className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] text-emerald-100 bg-[#0d5324]/60 px-3 py-1 rounded-full border border-emerald-400/40">
                  <IconShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Anti-Spoofing Verified</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Supporting Educational Guidance Note */}
        <div className="mt-3.5 flex items-center justify-between text-xs text-[#5f6368] px-1">
          <div className="flex items-center gap-1.5">
            <IconShieldCheck className="w-4 h-4 text-[#137333]" />
            <span>Biometric privacy: No images are stored on public servers.</span>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={handleClose}
              className="text-[#5f6368] hover:text-[#202124] underline font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}
