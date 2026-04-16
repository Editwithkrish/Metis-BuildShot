"use client";

import React, { useState } from "react";
import { Mic, Square, Play, Trash2, Brain, Activity, Info } from "lucide-react";

export default function CryDecoderPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [recordingTime, setRecordingTime] = useState(0);

  React.useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (!hasRecorded) setRecordingTime(0);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording, hasRecorded]);

  const startRecording = () => {
    setIsRecording(true);
    setHasRecorded(false);
    setRecordingTime(0);
    setResult(null);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setHasRecorded(true);
  };

  const deleteRecording = () => {
    setHasRecorded(false);
    setRecordingTime(0);
    setResult(null);
  };

  const analyzeCry = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setResult({
        reason: "Hungry",
        confidence: "92%",
        details: "Rhythmic 'neh' sound detected, primary hunger reflex.",
        suggestions: [
          "Feeding check required.",
          "Monitor rooting cues.",
          "Check last meal time."
        ]
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="max-w-[1100px] mx-auto min-h-[calc(100vh-10rem)] flex items-center justify-center animate-in fade-in duration-500">
      <div className="grid lg:grid-cols-12 gap-8 w-full items-stretch">
        {/* RECORDER UNIT */}
        <div className="lg:col-span-5">
          <div className="border border-foreground/10 bg-foreground/[0.02] p-8 h-full min-h-[440px] flex flex-col">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-10 h-10 bg-[#86efac]/10 flex items-center justify-center">
                <Mic className="w-5 h-5 text-[#86efac]" />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="font-display text-base uppercase leading-tight tracking-tight">Cry Analysis</h3>
                <p className="text-[10px] text-muted-foreground font-mono leading-none mt-1">AI-Powered Detection</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center py-10">
              {!hasRecorded && !isRecording && (
                <div className="flex flex-col items-center gap-8 text-center">
                  <button 
                    onClick={startRecording}
                    className="px-10 py-3 border border-[#86efac]/30 text-[#86efac] text-[11px] font-mono uppercase tracking-widest hover:bg-[#86efac]/5 transition-all active:scale-[0.98]"
                  >
                    Start Capture
                  </button>
                  <p className="text-[10px] text-muted-foreground font-mono max-w-[200px] mx-auto leading-relaxed">
                    A 5-second capture is recommended for precise acoustic analysis.
                  </p>
                </div>
              )}

              {isRecording && (
                <div className="flex flex-col items-center gap-6">
                  <div className="text-4xl font-display text-white tabular-nums">
                    00:{recordingTime.toString().padStart(2, '0')}
                  </div>
                  <button 
                    onClick={stopRecording}
                    className="w-16 h-16 rounded-full border border-destructive/20 bg-destructive/5 flex items-center justify-center hover:bg-destructive/10 transition-all active:scale-95"
                  >
                    <Square className="w-6 h-6 text-destructive fill-current" />
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-destructive rounded-full animate-pulse" />
                    <span className="text-[10px] font-mono text-destructive uppercase tracking-widest font-bold">Recording...</span>
                  </div>
                </div>
              )}

              {hasRecorded && !isAnalyzing && (
                <div className="w-full flex flex-col items-center gap-6 max-w-[260px]">
                  <div className="w-full border border-foreground/10 bg-black/20 px-4 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#86efac]" />
                        <span className="text-[10px] font-mono text-muted-foreground font-bold tracking-tight">{recordingTime}s Recorded</span>
                    </div>
                    <button onClick={deleteRecording} className="text-muted-foreground hover:text-white transition-all">
                        <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <button 
                    onClick={analyzeCry}
                    className="w-full py-3.5 bg-[#86efac] text-black font-bold text-[11px] font-mono uppercase tracking-widest active:scale-[0.98] transition-all"
                  >
                    Run Inference
                  </button>
                </div>
              )}

              {isAnalyzing && (
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="w-10 h-10 border-2 border-[#86efac]/10 border-t-[#86efac] rounded-full animate-spin" />
                  <p className="text-[10px] font-mono text-[#86efac] uppercase tracking-widest font-bold">Analysing Frequency</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ANALYSIS REPORT */}
        <div className="lg:col-span-7 h-full">
          <div className="border border-foreground/10 bg-foreground/[0.02] h-full min-h-[440px] flex flex-col items-center justify-center p-12 text-center">
            {!result && !isAnalyzing && (
              <div className="opacity-20 flex flex-col items-center gap-6">
                <p className="text-[11px] font-mono uppercase tracking-[0.3em]">Result will appear here</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="w-full space-y-6 flex flex-col items-center">
                   <div className="w-48 h-0.5 bg-foreground/10 relative overflow-hidden">
                        <div className="absolute inset-y-0 w-1/3 bg-[#86efac] animate-scan" />
                   </div>
                   <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Decoding Spectrogram</p>
              </div>
            )}

            {result && !isAnalyzing && (
              <div className="flex flex-col items-center gap-10 animate-in fade-in zoom-in-95 duration-700">
                 <div className="space-y-4">
                    <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-[0.2em] border-b border-foreground/10 pb-2 inline-block">Detected Primary</p>
                    <div className="flex flex-col items-center">
                        <h2 className="text-5xl font-display text-white mb-2">{result.reason}</h2>
                        <span className="text-xs font-mono text-[#86efac] px-3 py-1 bg-[#86efac]/5 border border-[#86efac]/20 uppercase tracking-widest">
                            {result.confidence} Confidence
                        </span>
                    </div>
                 </div>
                 
                 <p className="text-[11px] text-foreground/50 max-w-[320px] leading-relaxed font-mono tracking-tight">
                    TRACE: {result.details}
                 </p>

                 <button 
                  onClick={() => {
                    setResult(null);
                    setHasRecorded(false);
                    setRecordingTime(0);
                  }}
                  className="mt-8 text-[10px] font-mono text-muted-foreground hover:text-white uppercase tracking-widest transition-colors border-b border-transparent hover:border-white/20 pb-1"
                 >
                    Record Again
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
      `}</style>
    </div>
  );
}
