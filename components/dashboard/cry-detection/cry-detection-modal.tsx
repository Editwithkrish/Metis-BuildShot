"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BarVisualizer } from "@/components/ui/bar-visualizer";
import { Matrix } from "@/components/ui/matrix";
import { Baby, Zap, Play, Check, Loader2, AlertTriangle, Volume2, MicOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { audioBufferToWav } from "@/lib/audio-utils";

interface CryDetectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type DetectionStep = "idle" | "listening" | "classifying" | "analyzing" | "result" | "not_baby" | "error";

interface ClassificationResult {
    classification: "baby" | "adult" | "noise";
    confidence: number;
    description: string;
}

interface PredictionResult {
    label: string;
    confidence: number;
    reason: string;
    probabilities: Record<string, number>;
}

// Advice mapping for different cry reasons
const cryAdvice: Record<string, string> = {
    hungry: "Leo's cry pattern matches the 'Neh' sound, typically associated with the hunger reflex. It's likely time for a feeding session.",
    belly_pain: "The cry pattern suggests colic or digestive discomfort. Try gentle tummy massage, bicycle legs, or holding Leo in an upright position.",
    burping: "Leo likely needs to be burped. Hold him upright against your shoulder and gently pat his back until he burps.",
    discomfort: "The cry indicates physical discomfort. Check for wet diaper, tight clothing, uncomfortable temperature, or any irritation.",
    tired: "Leo's cry suggests overtiredness. Create a calm, dark environment and try gentle rocking or white noise to help him settle to sleep.",
};

// SpeechRecognition browser API type (cross-browser compatible)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionType = any;

export function CryDetectionModal({ isOpen, onClose }: CryDetectionModalProps) {
    const [step, setStep] = useState<DetectionStep>("idle");
    const [countdown, setCountdown] = useState(7);
    const [result, setResult] = useState<{ reason: string; confidence: number; advice: string } | null>(null);
    const [classificationResult, setClassificationResult] = useState<ClassificationResult | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>("");

    // Audio recording refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const recognitionRef = useRef<SpeechRecognitionType | null>(null);
    const transcriptRef = useRef<string>("");
    const hasSoundRef = useRef<boolean>(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);

    // Cleanup function
    const cleanupRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        audioChunksRef.current = [];
        transcriptRef.current = "";
        hasSoundRef.current = false;
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        analyserRef.current = null;
    }, []);

    // Start audio recording with speech recognition and sound detection
    const startRecording = async (): Promise<{ audioBlob: Blob | null; transcript: string; hasSoundDetected: boolean }> => {
        try {
            // Start media stream for audio recording
            // IMPORTANT: Disable echoCancellation and noiseSuppression to capture all audio
            // including baby cries played from speakers
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    channelCount: 1,
                    sampleRate: 22050,
                }
            });
            streamRef.current = stream;
            console.log("[CryDecoder] Audio stream started");

            // Initialize MediaRecorder for audio capture
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm';

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            // Set up audio level detection using Web Audio API
            // Force 22050Hz sample rate to match the model training
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
                sampleRate: 22050,
            });
            audioContextRef.current = audioContext;
            const analyser = audioContext.createAnalyser();
            analyserRef.current = analyser;
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 256;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            // RMS (Root Mean Square) gives a better measure of perceived volume
            let maxLevel = 0;
            // Extremely low threshold to catch any sound at all
            const SOUND_THRESHOLD = 2;

            // Check for sound periodically
            const soundCheckInterval = setInterval(() => {
                if (analyserRef.current) {
                    // Use time domain data (waveform) for amplitude detection
                    analyserRef.current.getByteTimeDomainData(dataArray);

                    let sum = 0;
                    for (let i = 0; i < bufferLength; i++) {
                        // 128 is silence in 8-bit time domain data
                        const amplitude = dataArray[i] - 128;
                        sum += amplitude * amplitude;
                    }
                    const rms = Math.sqrt(sum / bufferLength);

                    maxLevel = Math.max(maxLevel, rms);

                    console.log(`[CryDecoder] Audio Level: ${rms}`);

                    // If ANY sound detected above electronic noise floor
                    if (rms > SOUND_THRESHOLD) {
                        hasSoundRef.current = true;
                    }
                }
            }, 100);

            // Initialize Speech Recognition for transcription
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognitionAPI) {
                const recognition = new SpeechRecognitionAPI();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'en-US';

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                recognition.onresult = (event: any) => {
                    let transcript = "";
                    for (let i = 0; i < event.results.length; i++) {
                        transcript += event.results[i][0].transcript + " ";
                    }
                    transcriptRef.current = transcript.trim();
                };

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                recognition.onerror = (event: any) => {
                    console.log("Speech recognition error:", event.error);
                    // Continue even if speech recognition has issues
                };

                recognitionRef.current = recognition;
                recognition.start();
            }

            // Start recording
            mediaRecorder.start(100);

            return new Promise((resolve) => {
                mediaRecorder.onstop = async () => {
                    clearInterval(soundCheckInterval);
                    const webmBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

                    let finalBlob = webmBlob;

                    // Convert WebM to true 16-bit PCM WAV for the API
                    try {
                        const arrayBuffer = await webmBlob.arrayBuffer();
                        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                        finalBlob = audioBufferToWav(audioBuffer);
                        console.log("[CryDecoder] Successfully converted recording to true 16-bit PCM WAV");
                    } catch (e) {
                        console.error("[CryDecoder] WAV conversion failed, using original format:", e);
                    }

                    console.log("[CryDecoder] Recording stopped");
                    console.log("[CryDecoder] Max audio level:", maxLevel);
                    console.log("[CryDecoder] Sound detected:", hasSoundRef.current);
                    console.log("[CryDecoder] Transcript:", transcriptRef.current || "(empty)");

                    resolve({
                        audioBlob: finalBlob,
                        transcript: transcriptRef.current,
                        hasSoundDetected: hasSoundRef.current
                    });
                };
            });
        } catch (error) {
            console.error("Failed to start recording:", error);
            return { audioBlob: null, transcript: "", hasSoundDetected: false };
        }
    };

    // Stop recording
    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    };

    // Classify audio using FastRouter with Gemini 3 Flash
    const classifyAudio = async (transcript: string, hasSoundDetected: boolean): Promise<ClassificationResult | null> => {
        try {
            const response = await fetch("/api/cry-detection/classify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    transcription: transcript || undefined,
                    hasSoundDetected,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Classification failed");
            }

            return await response.json();
        } catch (error) {
            console.error("Classification error:", error);
            return null;
        }
    };

    // Get cry prediction from external API
    const predictCryReason = async (audioBlob: Blob): Promise<PredictionResult | null> => {
        try {
            const formData = new FormData();
            formData.append("audio", audioBlob, "cry.wav");

            const response = await fetch("/api/cry-detection/predict", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Prediction failed");
            }

            return await response.json();
        } catch (error) {
            console.error("Prediction error:", error);
            return null;
        }
    };

    const startDetection = async () => {
        setStep("listening");
        setCountdown(7);
        setErrorMessage("");
        transcriptRef.current = "";

        // Start recording with speech recognition
        const recordingPromise = startRecording();

        // Countdown timer
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Wait for 7 seconds then process
        await new Promise(resolve => setTimeout(resolve, 7000));
        clearInterval(timer);

        // Stop recording and get the audio blob + transcript + sound detection
        stopRecording();
        const { audioBlob, transcript, hasSoundDetected } = await recordingPromise;

        if (!audioBlob) {
            setErrorMessage("Failed to record audio. Please check microphone permissions.");
            setStep("error");
            return;
        }

        // Layer 1: Classify the audio using FastRouter with Gemini 3 Flash
        setStep("classifying");
        const classification = await classifyAudio(transcript, hasSoundDetected);

        if (!classification) {
            setErrorMessage("Failed to analyze the audio. Please try again.");
            setStep("error");
            return;
        }

        setClassificationResult(classification);

        // Check if it's a baby cry
        if (classification.classification !== "baby") {
            setStep("not_baby");
            return;
        }

        // Layer 2: Get cry reason prediction
        setStep("analyzing");
        const prediction = await predictCryReason(audioBlob);

        if (!prediction) {
            setErrorMessage("Failed to determine the cry reason. Please try again.");
            setStep("error");
            return;
        }

        // Format the result
        const labelCapitalized = prediction.label.charAt(0).toUpperCase() + prediction.label.slice(1).replace("_", " ");
        setResult({
            reason: labelCapitalized,
            confidence: Math.round(prediction.confidence * 100),
            advice: prediction.reason || cryAdvice[prediction.label] || "Monitor your baby and try different soothing techniques.",
        });
        setStep("result");
    };

    const reset = () => {
        cleanupRecording();
        setStep("idle");
        setCountdown(7);
        setResult(null);
        setClassificationResult(null);
        setErrorMessage("");
    };

    useEffect(() => {
        if (isOpen) reset();
        return () => cleanupRecording();
    }, [isOpen, cleanupRecording]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="max-w-full md:max-w-[500px] w-[calc(100%-2rem)] p-0 overflow-hidden border-none bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] rounded-[40px] font-secondary z-[100]"
            >
                <div className="relative flex flex-col items-center p-8 md:p-12 min-h-[520px]">
                    {/* Brand Header */}
                    <div className="w-full text-center mb-8">
                        <DialogHeader>
                            <DialogTitle className="text-4xl font-normal text-slate-900 tracking-tight font-primary italic">Cry Decoder</DialogTitle>
                            <DialogDescription className="text-slate-500 text-sm font-medium mt-1">AI & ML powered neonatal analysis</DialogDescription>
                        </DialogHeader>
                    </div>

                    {/* Dynamic Content Area */}
                    <div className="flex-1 flex flex-col items-center justify-center w-full">
                        <AnimatePresence mode="wait">
                            {step === "idle" && (
                                <motion.div
                                    key="idle"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="text-center space-y-8 w-full flex flex-col items-center"
                                >
                                    <div className="w-28 h-28 rounded-full bg-primary/5 flex items-center justify-center relative">
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                                            transition={{ repeat: Infinity, duration: 3 }}
                                            className="absolute inset-0 bg-primary/20 rounded-full"
                                        />
                                        <Baby size={48} className="text-primary relative z-10" />
                                    </div>
                                    <div className="space-y-6 w-full flex flex-col items-center">
                                        <p className="text-slate-600 text-[15px] font-medium max-w-[320px] leading-relaxed">
                                            Keep your phone near Leo. Hestia will capture a 7-second audio sample to decode his needs.
                                        </p>
                                        <Button
                                            onClick={startDetection}
                                            className="h-14 px-12 rounded-[22px] bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs uppercase tracking-[0.25em] shadow-2xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-98 flex items-center gap-3 cursor-pointer"
                                        >
                                            <Play size={16} fill="white" /> Start Decoder
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {step === "listening" && (
                                <motion.div
                                    key="listening"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center space-y-12 w-full"
                                >
                                    <div className="w-full flex items-center justify-center py-6 bg-slate-50/50 rounded-3xl border border-slate-100/50 px-8">
                                        <BarVisualizer className="w-full" barCount={18} state="listening" />
                                    </div>
                                    <div className="text-center space-y-3">
                                        <div className="flex items-center justify-center gap-2 mb-1">
                                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                            <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-primary">
                                                Recording Audio ({countdown}s)
                                            </p>
                                        </div>
                                        <p className="text-slate-400 text-xs font-medium italic">
                                            Capturing audio from microphone...
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {step === "classifying" && (
                                <motion.div
                                    key="classifying"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center space-y-10 w-full"
                                >
                                    <div className="w-24 h-24 rounded-full bg-amber-50 flex items-center justify-center relative">
                                        <motion.div
                                            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                            className="absolute inset-0 bg-amber-200 rounded-full"
                                        />
                                        <Volume2 size={40} className="text-amber-600 relative z-10" />
                                    </div>
                                    <div className="text-center space-y-3">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="animate-spin text-amber-600" size={16} />
                                            <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-amber-600">
                                                Analyzing Audio...
                                            </p>
                                        </div>
                                        <p className="text-slate-400 text-xs font-medium italic">
                                            Detecting voice type with Gemini 3 Flash
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {step === "analyzing" && (
                                <motion.div
                                    key="analyzing"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center space-y-10 w-full"
                                >
                                    <Matrix rows={7} cols={10} color="#5C7CFA" />
                                    <div className="text-center space-y-3">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="animate-spin text-primary" size={16} />
                                            <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-primary">
                                                ML Processing...
                                            </p>
                                        </div>
                                        <p className="text-slate-400 text-xs font-medium italic">
                                            Matching patterns against 10k+ recordings
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {step === "not_baby" && classificationResult && (
                                <motion.div
                                    key="not_baby"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="w-full space-y-8"
                                >
                                    <div className="bg-amber-50 rounded-[32px] p-10 border border-amber-200 flex flex-col items-center text-center relative overflow-hidden shadow-sm">
                                        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-6">
                                            <MicOff size={36} className="text-amber-600" />
                                        </div>

                                        <h4 className="text-2xl font-semibold text-slate-900 mb-4">
                                            Adult Voice Detected
                                        </h4>

                                        <p className="text-slate-600 text-[15px] leading-relaxed max-w-[300px]">
                                            {classificationResult.description ||
                                                "We detected an adult speaking. Please try again when you hear your baby crying."
                                            }
                                        </p>

                                        <div className="mt-4 px-4 py-2 bg-amber-100 rounded-full">
                                            <span className="text-xs font-medium text-amber-700">
                                                Confidence: {Math.round(classificationResult.confidence * 100)}%
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <Button
                                            onClick={reset}
                                            className="flex-1 h-12 rounded-2xl bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-200 cursor-pointer"
                                        >
                                            <Play size={16} className="mr-2" /> Try Again
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {step === "error" && (
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="w-full space-y-8"
                                >
                                    <div className="bg-red-50 rounded-[32px] p-10 border border-red-200 flex flex-col items-center text-center relative overflow-hidden shadow-sm">
                                        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
                                            <AlertTriangle size={36} className="text-red-600" />
                                        </div>

                                        <h4 className="text-2xl font-semibold text-slate-900 mb-4">
                                            Something went wrong
                                        </h4>

                                        <p className="text-slate-600 text-[15px] leading-relaxed max-w-[300px]">
                                            {errorMessage || "An unexpected error occurred. Please try again."}
                                        </p>
                                    </div>

                                    <div className="flex gap-4">
                                        <Button
                                            onClick={reset}
                                            className="flex-1 h-12 rounded-2xl bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-200 cursor-pointer"
                                        >
                                            <Play size={16} className="mr-2" /> Try Again
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {step === "result" && result && (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="w-full space-y-8"
                                >
                                    <div className="bg-slate-50 rounded-[32px] p-10 border border-slate-100 flex flex-col items-center text-center relative overflow-hidden shadow-sm">
                                        <div className="absolute top-0 right-0 p-4">
                                            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                                                <Zap size={12} className="text-primary fill-primary" />
                                                <span className="text-[10px] font-black uppercase tracking-wider text-primary">{result.confidence}% Match</span>
                                            </div>
                                        </div>

                                        <h4 className="text-5xl font-normal text-slate-900 font-primary mb-6 italic pt-4">
                                            {result.reason}
                                        </h4>

                                        <p className="text-slate-700 text-[15px] leading-relaxed font-secondary mt-2 border-l-4 border-primary/30 pl-6 py-2 bg-white/40 rounded-r-xl text-left italic">
                                            "{result.advice}"
                                        </p>
                                    </div>

                                    <div className="flex gap-4">
                                        <Button
                                            variant="outline"
                                            onClick={reset}
                                            className="flex-1 h-12 rounded-2xl border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-widest hover:bg-slate-50 cursor-pointer"
                                        >
                                            Retake
                                        </Button>
                                        <Button
                                            onClick={onClose}
                                            className="flex-1 h-12 rounded-2xl bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-200 cursor-pointer"
                                        >
                                            <Check size={16} className="mr-2" /> Finish
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
