"use client";

import React, { useState, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Upload,
    X,
    FileText,
    CheckCircle2,
    Loader2,
    ShieldCheck,
    CloudUpload,
    File,
    Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState<"idle" | "uploading" | "success">("idle");
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [documentName, setDocumentName] = useState("");
    const [category, setCategory] = useState("medical");
    const [issuer, setIssuer] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);

    const categories = [
        { id: "medical", label: "Medical" },
        { id: "identity", label: "Identity" },
        { id: "vaccine", label: "Vaccine" },
        { id: "other", label: "Other" }
    ];

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (file: File) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Please upload a PDF, JPG, PNG, or WEBP file.");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File size must be less than 10MB.");
            return;
        }
        setSelectedFile(file);
        if (!documentName) {
            setDocumentName(file.name.replace(/\.[^/.]+$/, ""));
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const uploadToCloudinary = async (file: File): Promise<{ url: string, publicId: string }> => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET!);
        formData.append("folder", "metis_vault");

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
            { method: "POST", body: formData }
        );

        if (!response.ok) {
            throw new Error("Cloudinary upload failed");
        }

        const data = await response.json();
        return { url: data.secure_url, publicId: data.public_id };
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error("Please select a file to upload.");
            return;
        }
        if (!documentName.trim()) {
            toast.error("Please enter a document name.");
            return;
        }

        try {
            setStep("uploading");
            setUploadProgress(10);

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error("You must be logged in to upload documents.");
            }

            setUploadProgress(30);

            // Upload to Cloudinary
            const { url, publicId } = await uploadToCloudinary(selectedFile);

            setUploadProgress(70);

            // Save document metadata to Supabase
            const { error } = await supabase.from('vault_documents').insert({
                profile_id: user.id,
                name: documentName.trim(),
                category: category,
                file_url: url,
                cloudinary_public_id: publicId,
                file_type: selectedFile.type,
                file_size_bytes: selectedFile.size,
                issuer: issuer.trim() || null
            });

            if (error) throw error;

            setUploadProgress(100);
            setStep("success");
            toast.success("Document uploaded successfully!");

        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error(error.message || "Failed to upload document.");
            setStep("idle");
        }
    };

    const resetModal = () => {
        setStep("idle");
        setSelectedFile(null);
        setDocumentName("");
        setCategory("medical");
        setIssuer("");
        setUploadProgress(0);
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    const getFileIcon = (size: number = 24) => {
        if (!selectedFile) return <CloudUpload size={size} />;
        if (selectedFile.type.startsWith("image/")) return <ImageIcon size={size} />;
        return <FileText size={size} />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-full md:max-w-[500px] w-[calc(100%-2rem)] p-0 overflow-hidden border-none bg-white shadow-2xl rounded-[32px] font-secondary">
                <div className="relative p-6 md:p-8">
                    <DialogHeader className="text-center mb-6">
                        <DialogTitle className="text-2xl font-normal text-slate-900 font-primary">Upload Document</DialogTitle>
                        <DialogDescription className="text-slate-500 text-xs font-medium mt-1">
                            Add a document to Leo's secure vault
                        </DialogDescription>
                    </DialogHeader>

                    <AnimatePresence mode="wait">
                        {step === "idle" && (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-5"
                            >
                                {/* Drop Zone */}
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative group border-2 border-dashed rounded-[20px] p-6 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${dragActive
                                        ? "border-primary bg-primary/5 scale-[1.01]"
                                        : selectedFile
                                            ? "border-emerald-300 bg-emerald-50/50"
                                            : "border-slate-200 hover:border-primary/50 hover:bg-slate-50/50"
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${selectedFile ? "bg-emerald-100 text-emerald-600" : "bg-primary/10 text-primary"
                                        }`}>
                                        {getFileIcon(24)}
                                    </div>
                                    {selectedFile ? (
                                        <div className="space-y-0.5">
                                            <p className="font-bold text-sm text-slate-900 truncate max-w-[250px]">{selectedFile.name}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{formatFileSize(selectedFile.size)}</p>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                                                className="text-[10px] text-red-500 font-bold hover:underline mt-1"
                                            >
                                                Remove file
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-bold text-slate-900">Drop your file here</p>
                                            <p className="text-[10px] text-slate-500 font-medium tracking-tight">PDF, JPG, or PNG up to 10MB</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileInputChange}
                                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                                        className="hidden"
                                    />
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="doc-name" className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                                Document Name *
                                            </Label>
                                            <Input
                                                id="doc-name"
                                                placeholder="File Name"
                                                value={documentName}
                                                onChange={(e) => setDocumentName(e.target.value)}
                                                className="h-11 rounded-lg bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 text-sm"
                                            />
                                        </div>

                                        <div className="grid gap-1.5">
                                            <Label htmlFor="issuer" className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                                Issuer (Optional)
                                            </Label>
                                            <Input
                                                id="issuer"
                                                placeholder="Hospital / Doctor"
                                                value={issuer}
                                                onChange={(e) => setIssuer(e.target.value)}
                                                className="h-11 rounded-lg bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                            Category
                                        </Label>
                                        <div className="flex flex-wrap gap-2">
                                            {categories.map(cat => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setCategory(cat.id)}
                                                    className={`px-3.5 py-1.5 rounded-full text-[9px] font-bold transition-all ${category === cat.id
                                                        ? "bg-slate-900 text-white shadow-md scale-[1.03]"
                                                        : "bg-slate-100 hover:bg-slate-200 text-slate-500"
                                                        }`}
                                                >
                                                    {cat.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button
                                        onClick={handleUpload}
                                        disabled={!selectedFile}
                                        className="w-full h-12 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-slate-100 transition-all hover:translate-y-[-1px] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Start Upload
                                    </Button>

                                    <div className="flex items-center justify-center gap-2 mt-4 text-emerald-600 opacity-60">
                                        <ShieldCheck size={12} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Secure AES-256 Encryption</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === "uploading" && (
                            <motion.div
                                key="uploading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-12 flex flex-col items-center justify-center space-y-8"
                            >
                                <div className="relative w-24 h-24">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r="44"
                                            fill="none"
                                            stroke="#e2e8f0"
                                            strokeWidth="8"
                                        />
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r="44"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            strokeDasharray={276}
                                            strokeDashoffset={276 - (276 * uploadProgress) / 100}
                                            className="text-primary transition-all duration-300"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-lg font-bold text-slate-900">{uploadProgress}%</span>
                                    </div>
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-lg font-bold text-slate-900">Uploading Document...</p>
                                    <p className="text-xs text-slate-500 font-medium">Encrypting and securing Leo's data</p>
                                </div>
                            </motion.div>
                        )}

                        {step === "success" && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-12 flex flex-col items-center justify-center space-y-8"
                            >
                                <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-lg shadow-emerald-100/50">
                                    <CheckCircle2 size={48} />
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-2xl font-bold text-slate-900 font-primary">Upload Complete!</p>
                                    <p className="text-sm text-slate-500 font-medium max-w-[250px]">
                                        Your document has been safely stored in the vault.
                                    </p>
                                </div>
                                <Button
                                    onClick={handleClose}
                                    className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-slate-100 transition-all hover:translate-y-[-1px] active:scale-95"
                                >
                                    Back to Vault
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
}
