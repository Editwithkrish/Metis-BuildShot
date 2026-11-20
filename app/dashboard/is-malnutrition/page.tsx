"use client";

import { type ChangeEvent, useRef, useState } from "react";
import { Camera, ImagePlus, LoaderCircle, ScanEye, X } from "lucide-react";
import { PhotoCamera } from "@/components/dashboard/photo-camera";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { preparePhoto } from "@/lib/malnutrition-photo";
import { type PhotoReview } from "@/lib/malnutrition-result";

const resultTitles = {
  visible_concerns: "Visible concerns",
  no_clear_signs: "No clear signs in this photo",
  unable_to_assess: "Unable to assess this photo",
};

export default function IsMalnutritionPage() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [review, setReview] = useState<PhotoReview | null>(null);
  const [error, setError] = useState("");
  const galleryRef = useRef<HTMLInputElement>(null);
  const nativeCameraRef = useRef<HTMLInputElement>(null);
  const busy = preparing || analyzing;

  function selectPhoto(photo: string | null) {
    setPhoto(photo);
    setReview(null);
    setError("");
  }

  async function selectFile(file: File) {
    setPreparing(true);
    selectPhoto(null);
    try {
      selectPhoto(await preparePhoto(file));
    } catch (error) {
      setError(error instanceof Error ? error.message : "The photo could not be opened.");
    } finally {
      setPreparing(false);
    }
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (file && !busy) void selectFile(file);
  }

  async function analyze() {
    if (!photo || busy) return;
    setAnalyzing(true);
    setError("");
    setReview(null);
    try {
      const response = await fetch("/api/malnutrition-detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: photo }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data) throw new Error(data?.error ?? "Analysis is unavailable. Try again.");
      setReview(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "The photo could not be analyzed.");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl animate-in fade-in duration-300">
      <header className="mb-6 flex items-center gap-3 sm:gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-300/10 text-emerald-300 sm:size-12">
          <ScanEye className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-display text-2xl leading-tight text-white sm:text-3xl">Malnutrition photo screening</h2>
          <p className="mt-1 text-sm text-muted-foreground">Upload a photo or take one with your camera.</p>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-6" aria-labelledby="photo-heading">
          <h3 id="photo-heading" className="font-display text-lg text-white">Photo</h3>
          <div
            className={`relative grid aspect-[4/3] min-h-40 max-h-80 place-items-center overflow-hidden rounded-xl border ${dragging ? "border-emerald-300/60 bg-emerald-300/10" : photo ? "border-white/10 bg-black/40" : "border-dashed border-white/20 bg-black/15"}`}
            onDragOver={(event) => {
              event.preventDefault();
              if (!busy) setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              const file = event.dataTransfer.files[0];
              if (file && !busy) void selectFile(file);
            }}
          >
            {photo ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo} alt="Photo selected for screening" className="absolute inset-0 h-full w-full object-contain" />
                <button type="button" disabled={busy} onClick={() => selectPhoto(null)} aria-label="Remove photo" className="absolute right-2 top-2 grid size-10 place-items-center rounded-full bg-black/70 text-white hover:bg-black disabled:opacity-40">
                  <X className="size-4" />
                </button>
              </>
            ) : (
              <div className="pointer-events-none grid justify-items-center gap-3 px-4 text-center text-sm text-muted-foreground">
                {preparing ? <LoaderCircle className="size-6 animate-spin text-emerald-300" /> : <ImagePlus className="size-7 text-emerald-300/70" />}
                <p>{preparing ? "Preparing photo…" : "Drop an image here"}</p>
              </div>
            )}
          </div>

          <input ref={galleryRef} type="file" accept="image/*" aria-label="Gallery image" className="hidden" onChange={onFileChange} />
          <input ref={nativeCameraRef} type="file" accept="image/*" capture="environment" aria-label="Camera image" className="hidden" onChange={onFileChange} />
          <div className="grid grid-cols-2 gap-2">
            <button type="button" disabled={busy} onClick={() => galleryRef.current?.click()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 px-2 text-sm font-medium text-white hover:bg-white/5 disabled:opacity-40">
              <ImagePlus className="size-4 shrink-0 text-emerald-300" aria-hidden="true" />
              Upload image
            </button>
            <Dialog open={cameraOpen} onOpenChange={setCameraOpen}>
              <DialogTrigger asChild>
                <button type="button" disabled={busy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 px-2 text-sm font-medium text-white hover:bg-white/5 disabled:opacity-40">
                  <Camera className="size-4 shrink-0 text-emerald-300" aria-hidden="true" />
                  Open camera
                </button>
              </DialogTrigger>
              {cameraOpen && (
                <PhotoCamera
                  onCapture={(image) => {
                    selectPhoto(image);
                    setCameraOpen(false);
                  }}
                  onGallery={() => {
                    setCameraOpen(false);
                    galleryRef.current?.click();
                  }}
                  onNativeCapture={() => {
                    setCameraOpen(false);
                    nativeCameraRef.current?.click();
                  }}
                />
              )}
            </Dialog>
          </div>

          {error && <p role="alert" className="rounded-lg border border-rose-400/25 bg-rose-400/5 p-3 text-sm text-rose-200">{error}</p>}
          <button type="button" disabled={!photo || busy} onClick={analyze} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 text-sm font-semibold text-black hover:bg-emerald-200 disabled:opacity-45">
            {analyzing ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <ScanEye className="size-4" aria-hidden="true" />}
            {analyzing ? "Analyzing photo…" : "Analyze photo"}
          </button>
        </section>

        <section className="flex min-h-72 flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-6" aria-labelledby="review-heading">
          <h3 id="review-heading" className="font-display text-lg text-white">Screening result</h3>
          <div aria-live="polite" className="flex flex-1 flex-col justify-center">
            {review ? (
              <div className="space-y-4">
                <h4 className={`font-display text-2xl leading-tight sm:text-3xl ${review.status === "visible_concerns" ? "text-amber-200" : "text-white"}`}>
                  {resultTitles[review.status]}
                </h4>
                <p className="text-sm leading-relaxed text-white/75">{review.summary}</p>
                {review.observations.length > 0 && (
                  <ul className="space-y-2">
                    {review.observations.map((observation, index) => (
                      <li key={index} className="rounded-lg border border-white/10 bg-black/15 px-3 py-2 text-sm text-white/75">{observation}</li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div className="grid justify-items-center gap-3 py-5 text-center text-sm text-muted-foreground">
                {analyzing ? <LoaderCircle className="size-6 animate-spin text-emerald-300" /> : <ScanEye className="size-6 text-white/30" />}
                <p>{analyzing ? "Reviewing the selected photo." : "Results appear after you analyze a photo."}</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
