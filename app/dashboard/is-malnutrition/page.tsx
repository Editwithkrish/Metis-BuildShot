"use client";

import React, { useState, useRef, useCallback } from "react";
import { ScanEye, Upload, Trash2, X, ImagePlus } from "lucide-react";

type DetectionResult = {
  status: "Detected" | "Not Detected" | "Borderline";
  confidence: string;
  indicators: string[];
  details: string;
  urgency: "High" | "Medium" | "Low";
};

export default function IsMalnutritionPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, []);

  const clearImage = () => {
    setUploadedImage(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const analyze = async () => {
    if (!uploadedImage) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/malnutrition-detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: uploadedImage }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? `Server error ${res.status}`);
      } else {
        setResult(data as DetectionResult);
      }
    } catch (err: any) {
      setError(err.message ?? "Network error — please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const urgencyColor: Record<string, string> = {
    High: "#f87171",
    Medium: "#fbbf24",
    Low: "#86efac",
  };

  return (
    <div className="max-w-[1100px] mx-auto min-h-[calc(100vh-10rem)] flex items-center justify-center animate-in fade-in duration-500">
      <div className="grid lg:grid-cols-12 gap-8 w-full items-stretch">

        {/* ── UPLOAD UNIT ── */}
        <div className="lg:col-span-5">
          <div className="border border-foreground/10 bg-foreground/[0.02] p-8 h-full min-h-[440px] flex flex-col">

            {/* Header */}
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 bg-[#86efac]/10 flex items-center justify-center">
                <ScanEye className="w-5 h-5 text-[#86efac]" />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="font-display text-base uppercase leading-tight tracking-tight">
                  Visual Scan
                </h3>
                <p className="text-[10px] text-muted-foreground font-mono leading-none mt-1">
                  AI-Powered Detection
                </p>
              </div>
            </div>

            {/* Upload Zone */}
            <div className="flex-1 flex flex-col">
              {!uploadedImage ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex-1 border border-dashed flex flex-col items-center justify-center gap-5 cursor-pointer transition-all ${
                    isDragging
                      ? "border-[#86efac]/60 bg-[#86efac]/5"
                      : "border-foreground/15 hover:border-foreground/30 hover:bg-foreground/[0.02]"
                  }`}
                >
                  <div className="flex flex-col items-center gap-4 text-center px-6">
                    <div
                      className={`w-12 h-12 border flex items-center justify-center transition-colors ${
                        isDragging
                          ? "border-[#86efac]/40 bg-[#86efac]/10"
                          : "border-foreground/10"
                      }`}
                    >
                      <ImagePlus
                        className={`w-5 h-5 transition-colors ${
                          isDragging ? "text-[#86efac]" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-[11px] font-mono text-foreground/60 uppercase tracking-widest leading-none">
                        Drop image here
                      </p>
                      <p className="text-[10px] font-mono text-muted-foreground mt-2 leading-relaxed">
                        or click to browse · PNG, JPG, WEBP
                      </p>
                    </div>
                    <button
                      type="button"
                      className="px-8 py-2.5 border border-[#86efac]/30 text-[#86efac] text-[10px] font-mono uppercase tracking-widest hover:bg-[#86efac]/5 transition-all active:scale-[0.98]"
                    >
                      Select Image
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileInput}
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-4">
                  {/* Image Preview */}
                  <div className="relative flex-1 border border-foreground/10 overflow-hidden bg-black/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={uploadedImage}
                      alt="Uploaded for analysis"
                      className="w-full h-full object-cover"
                      style={{ maxHeight: "260px" }}
                    />
                    <button
                      onClick={clearImage}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                    {isAnalyzing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-2 border-[#86efac]/20 border-t-[#86efac] rounded-full animate-spin" />
                          <p className="text-[9px] font-mono text-[#86efac] uppercase tracking-widest">
                            Scanning…
                          </p>
                        </div>
                      </div>
                    )}
                    {/* Scan line animation when analyzing */}
                    {isAnalyzing && (
                      <div className="absolute inset-x-0 h-px bg-[#86efac]/50 animate-scanline" />
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={clearImage}
                      className="w-10 h-10 border border-foreground/10 flex items-center justify-center text-muted-foreground hover:text-white hover:border-foreground/20 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={analyze}
                      disabled={isAnalyzing}
                      className="flex-1 h-10 bg-[#86efac] text-black font-bold text-[10px] font-mono uppercase tracking-widest active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                          Analysing…
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          Run Inference
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Hint */}
            <p className="text-[10px] text-muted-foreground font-mono mt-5 leading-relaxed">
              Upload a clear photo of the patient. The AI will assess visible
              indicators of acute malnutrition.
            </p>
          </div>
        </div>

        {/* ── ANALYSIS REPORT ── */}
        <div className="lg:col-span-7 h-full">
          <div className="border border-foreground/10 bg-foreground/[0.02] h-full min-h-[440px] flex flex-col items-center justify-center p-10 text-center">

            {/* Empty state */}
            {!result && !isAnalyzing && !error && (
              <div className="opacity-20 flex flex-col items-center gap-6">
                <p className="text-[11px] font-mono uppercase tracking-[0.3em]">
                  Result will appear here
                </p>
              </div>
            )}

            {/* Error state */}
            {error && !isAnalyzing && (
              <div className="flex flex-col items-center gap-5 animate-in fade-in duration-500">
                <div className="w-10 h-10 border border-destructive/30 bg-destructive/5 flex items-center justify-center">
                  <span className="text-destructive text-lg font-display">!</span>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-[11px] font-mono text-destructive uppercase tracking-widest">Analysis Failed</p>
                  <p className="text-[10px] font-mono text-muted-foreground max-w-[240px] leading-relaxed">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-[10px] font-mono text-muted-foreground hover:text-white uppercase tracking-widest transition-colors border-b border-transparent hover:border-white/20 pb-1"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Loading state */}
            {isAnalyzing && (
              <div className="w-full space-y-6 flex flex-col items-center">
                <div className="w-48 h-0.5 bg-foreground/10 relative overflow-hidden">
                  <div className="absolute inset-y-0 w-1/3 bg-[#86efac] animate-scan" />
                </div>
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                  Evaluating Visual Markers
                </p>
              </div>
            )}

            {/* Result state */}
            {result && !isAnalyzing && (
              <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-700 w-full max-w-sm">

                {/* Status */}
                <div className="space-y-4">
                  <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-[0.2em] border-b border-foreground/10 pb-2 inline-block">
                    Detection Status
                  </p>
                  <div className="flex flex-col items-center">
                    <h2
                      className="text-5xl font-display mb-2"
                      style={{
                        color:
                          result.status === "Detected"
                            ? "#f87171"
                            : result.status === "Borderline"
                            ? "#fbbf24"
                            : "#86efac",
                      }}
                    >
                      {result.status}
                    </h2>
                    <span
                      className="text-xs font-mono px-3 py-1 border uppercase tracking-widest"
                      style={{
                        color: urgencyColor[result.urgency],
                        borderColor: `${urgencyColor[result.urgency]}33`,
                        backgroundColor: `${urgencyColor[result.urgency]}0d`,
                      }}
                    >
                      {result.confidence} Confidence · {result.urgency} Priority
                    </span>
                  </div>
                </div>

                {/* Indicators */}
                <div className="w-full text-left space-y-2">
                  {result.indicators.map((ind, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 border border-foreground/10 px-3 py-2.5 bg-foreground/[0.02]"
                    >
                      <span className="w-1 h-1 rounded-full bg-[#f87171] mt-1.5 shrink-0" />
                      <p className="text-[10px] font-mono text-foreground/60 leading-snug">
                        {ind}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Details */}
                <p className="text-[11px] text-foreground/40 leading-relaxed font-mono tracking-tight text-left w-full">
                  TRACE: {result.details}
                </p>

                {/* Reset */}
                <button
                  onClick={() => {
                    setResult(null);
                    clearImage();
                  }}
                  className="text-[10px] font-mono text-muted-foreground hover:text-white uppercase tracking-widest transition-colors border-b border-transparent hover:border-white/20 pb-1"
                >
                  Scan Another
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { left: -30%; }
          100% { left: 100%; }
        }
        .animate-scan {
          animation: scan 1s ease-in-out infinite;
        }
        @keyframes scanline {
          0%   { top: 0%; }
          100% { top: 100%; }
        }
        .animate-scanline {
          animation: scanline 1.8s linear infinite;
        }
      `}</style>
    </div>
  );
}
