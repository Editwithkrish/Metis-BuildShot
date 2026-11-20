"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, LoaderCircle } from "lucide-react";
import { DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { photoDataUrl } from "@/lib/malnutrition-photo";

type CameraState = { status: "starting" | "ready" } | { status: "unavailable"; message: string };

function cameraError(error: unknown) {
  switch (error instanceof DOMException ? error.name : "") {
    case "NotAllowedError":
      return "Camera access was blocked. Allow it in your browser settings or choose an image.";
    case "NotFoundError":
      return "No camera was found. Connect a camera or choose an image.";
    case "NotReadableError":
      return "The camera may already be in use. Close other camera apps and try again.";
    default:
      return "The camera couldn’t open. Try again or choose an image.";
  }
}

type PhotoCameraProps = {
  onCapture: (photo: string) => void;
  onNativeCapture: () => void;
  onGallery: () => void;
};

export function PhotoCamera(props: PhotoCameraProps) {
  return (
    <DialogContent className="max-h-[calc(100dvh-1.5rem)] gap-0 overflow-y-auto border-white/15 bg-[#101613] p-0 text-white shadow-2xl sm:max-w-[640px]">
      <CameraView {...props} />
    </DialogContent>
  );
}

function CameraView({ onCapture, onNativeCapture, onGallery }: PhotoCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [camera, setCamera] = useState<CameraState>({ status: "starting" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let canceled = false;
    let stream: MediaStream | undefined;
    const video = videoRef.current;

    async function openCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("unavailable");
        }
        const liveStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
        });
        if (canceled || !video) {
          liveStream.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = liveStream;
        video.srcObject = stream;
        await video.play();
      } catch (error) {
        stream?.getTracks().forEach((track) => track.stop());
        if (!canceled) setCamera({ status: "unavailable", message: cameraError(error) });
      }
    }

    void openCamera();
    return () => {
      canceled = true;
      stream?.getTracks().forEach((track) => track.stop());
      if (video) video.srcObject = null;
    };
  }, [attempt]);

  function takePhoto() {
    const video = videoRef.current;
    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
    try {
      onCapture(photoDataUrl(video, video.videoWidth, video.videoHeight));
    } catch {
      setCamera({ status: "unavailable", message: "The photo couldn’t be captured. Try again or choose an image." });
    }
  }

  function retryCamera() {
    setCamera({ status: "starting" });
    setAttempt((value) => value + 1);
  }

  return (
    <>
      <header className="flex items-center gap-3 px-4 py-4 pr-11 sm:px-6 sm:pr-12">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-300/10 text-emerald-300">
          <Camera className="size-5" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <DialogTitle>Take a photo</DialogTitle>
          <DialogDescription className="text-white/60">Frame the photo, then press the shutter.</DialogDescription>
        </div>
      </header>

      <div className="relative mx-4 grid aspect-[4/3] max-h-[52dvh] place-items-center overflow-hidden rounded-xl bg-black sm:mx-6 sm:aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          aria-label="Camera preview"
          onPlaying={() => setCamera({ status: "ready" })}
          className={`absolute inset-0 h-full w-full object-contain ${camera.status === "ready" ? "opacity-100" : "opacity-0"}`}
        />
        {camera.status === "ready" && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-[14%] rounded-xl border border-white/30" />
        )}
        {camera.status === "starting" && (
          <div role="status" className="flex items-center gap-3 px-5 text-sm text-white/75">
            <LoaderCircle className="size-5 animate-spin text-emerald-300" />
            Open and allow camera access in your browser.
          </div>
        )}
        {camera.status === "unavailable" && (
          <div role="alert" className="max-w-xs px-4 text-center text-sm leading-relaxed text-white/75">
            {camera.message}
          </div>
        )}
      </div>

      <footer className="grid grid-cols-2 items-center gap-3 px-4 py-4 sm:px-6">
        <button type="button" onClick={onGallery} className="inline-flex min-h-11 items-center justify-self-start gap-2 rounded-lg px-2 text-left text-sm font-medium text-white/75 hover:bg-white/5 hover:text-white">
          <ImagePlus className="size-4 shrink-0" aria-hidden="true" />
          Choose image
        </button>
        {camera.status === "unavailable" ? (
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={retryCamera} className="min-h-10 rounded-lg px-2 text-sm text-white/75 hover:bg-white/5">Retry</button>
            <button type="button" onClick={onNativeCapture} className="min-h-10 rounded-lg bg-emerald-300 px-3 text-sm font-semibold text-black hover:bg-emerald-200">Device camera</button>
          </div>
        ) : (
          <button
            type="button"
            onClick={takePhoto}
            disabled={camera.status !== "ready"}
            className="inline-flex min-h-11 items-center justify-self-end gap-2 rounded-full bg-emerald-300 px-4 text-sm font-semibold text-black hover:bg-emerald-200 disabled:opacity-40"
          >
            <Camera className="size-4" aria-hidden="true" />
            Capture photo
          </button>
        )}
      </footer>
    </>
  );
}
