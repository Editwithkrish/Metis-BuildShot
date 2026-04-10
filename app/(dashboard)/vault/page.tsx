"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Search,
    Plus,
    FileText,
    ShieldCheck,
    MoreVertical,
    Download,
    Trash2,
    Share2,
    Filter,
    FolderPlus,
    FileCode,
    FileImage,
    Loader2,
    Eye,
    Image as ImageIcon
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { UploadModal } from "@/components/dashboard/vault/upload-modal";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface VaultDocument {
    id: string;
    name: string;
    category: string;
    file_url: string;
    cloudinary_public_id?: string;
    file_type?: string;
    file_size_bytes?: number;
    issuer?: string;
    is_verified: boolean;
    created_at: string;
}

const documentCategories = [
    { id: "all", label: "All Docs", icon: <FileText size={18} /> },
    { id: "medical", label: "Medical", icon: <ShieldCheck size={18} /> },
    { id: "identity", label: "Identity", icon: <FileCode size={18} /> },
    { id: "vaccine", label: "Vaccines", icon: <FileImage size={18} /> },
    { id: "other", label: "Other", icon: <FolderPlus size={18} /> },
];

export default function VaultPage() {
    const supabase = createClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [documents, setDocuments] = useState<VaultDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDocuments = useCallback(async () => {
        try {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('vault_documents')
                .select('*')
                .eq('profile_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDocuments(data || []);
        } catch (error) {
            console.error("Error fetching documents:", error);
            toast.error("Failed to load documents");
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const handleDelete = async (docId: string) => {
        if (!confirm("Are you sure you want to delete this document? This action cannot be undone.")) {
            return;
        }

        try {
            const { error } = await supabase
                .from('vault_documents')
                .delete()
                .eq('id', docId);

            if (error) throw error;

            setDocuments(prev => prev.filter(d => d.id !== docId));
            toast.success("Document deleted successfully");
        } catch (error) {
            console.error("Error deleting document:", error);
            toast.error("Failed to delete document");
        }
    };

    const handleDownload = async (doc: VaultDocument) => {
        try {
            const response = await fetch(doc.file_url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.name + (doc.file_type?.includes('pdf') ? '.pdf' : doc.file_type?.includes('image') ? '.jpg' : '');
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download error:", error);
            toast.error("Failed to download document");
        }
    };

    const handleView = (doc: VaultDocument) => {
        window.open(doc.file_url, '_blank');
    };

    // Filter documents
    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (doc.issuer?.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Calculate category counts
    const getCategoryCount = (categoryId: string) => {
        if (categoryId === "all") return documents.length;
        return documents.filter(doc => doc.category === categoryId).length;
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return "—";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getFileIcon = (fileType?: string) => {
        if (fileType?.startsWith('image/')) {
            return <ImageIcon size={28} className="text-blue-500" />;
        }
        return <FileText size={28} className="text-primary" />;
    };

    return (
        <div className="flex flex-col gap-8">
            <DashboardHeader
                title="Medical Vault"
                subtitle="Secure storage for Leo's vital documents"
            />

            <div className="flex flex-col md:flex-row gap-6 items-center justify-between z-20">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                        placeholder="Search for certificates, reports..."
                        className="pl-12 h-12 bg-white/60 backdrop-blur-xl border-white/60 rounded-2xl shadow-sm focus:ring-primary/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="h-12 px-8 rounded-2xl bg-slate-900 text-white font-bold text-xs uppercase tracking-widest shadow-xl shadow-slate-200 gap-2 flex-1 md:flex-none cursor-pointer hover:bg-slate-800 transition-all active:scale-95"
                    >
                        <Plus size={18} /> Upload New
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-secondary">
                {/* Left Side: Categories */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex flex-col gap-2">
                        {documentCategories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`flex items-center justify-between p-4 rounded-[20px] transition-all cursor-pointer ${selectedCategory === cat.id
                                    ? "bg-slate-900 text-white shadow-xl scale-[1.02]"
                                    : "bg-white/40 hover:bg-white/60 text-slate-600"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {cat.icon}
                                    <span className="font-bold text-sm tracking-tight">{cat.label}</span>
                                </div>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${selectedCategory === cat.id ? "bg-white/20" : "bg-slate-100"
                                    }`}>
                                    {getCategoryCount(cat.id)}
                                </span>
                            </button>
                        ))}
                    </div>

                    <Card className="glass border-none shadow-xl overflow-hidden group">
                        <CardContent className="p-6 text-center space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto group-hover:scale-110 transition-transform">
                                <ShieldCheck size={24} />
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold text-sm text-slate-900">E2E Encrypted</p>
                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                    Your data is secured with AES-256 military grade encryption.
                                </p>
                            </div>
                            <Button variant="link" className="text-emerald-600 text-[10px] font-black uppercase tracking-widest p-0">
                                View Security Audit
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Side: Document List */}
                <div className="lg:col-span-9">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="animate-spin text-primary mb-4" size={32} />
                            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">Loading documents...</p>
                        </div>
                    ) : filteredDocuments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                                <FileText size={32} className="text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2 font-primary">No documents found</h3>
                            <p className="text-slate-500 text-sm mb-6 max-w-[300px]">
                                {searchQuery
                                    ? `No documents match "${searchQuery}"`
                                    : "Upload your first document to get started!"}
                            </p>
                            <Button
                                onClick={() => setIsUploadModalOpen(true)}
                                className="h-12 px-8 rounded-2xl bg-primary text-white font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary/20 gap-2"
                            >
                                <Plus size={18} /> Upload Document
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredDocuments.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="glass hover:bg-white/60 transition-all p-5 rounded-[24px] border-none shadow-md group cursor-pointer flex items-center gap-5"
                                >
                                    <div
                                        onClick={() => handleView(doc)}
                                        className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0 overflow-hidden"
                                    >
                                        {doc.file_type?.startsWith('image/') ? (
                                            <img
                                                src={doc.file_url}
                                                alt={doc.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            getFileIcon(doc.file_type)
                                        )}
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0" onClick={() => handleView(doc)}>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-slate-900 text-base truncate group-hover:text-primary transition-colors">
                                                {doc.name}
                                            </h4>
                                            {doc.is_verified && (
                                                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100/50">
                                                    <ShieldCheck size={10} className="fill-emerald-600/10" />
                                                    <span className="text-[9px] font-black uppercase tracking-tighter">Verified</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none font-bold text-[9px] uppercase tracking-wider px-2 capitalize">
                                                {doc.category}
                                            </Badge>
                                            <span className="text-[11px] font-medium text-slate-400">
                                                {doc.issuer ? `${doc.issuer} • ` : ""}{formatDate(doc.created_at)} • {formatFileSize(doc.file_size_bytes)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleDownload(doc)}
                                            className="p-2.5 rounded-xl hover:bg-white text-slate-400 hover:text-slate-900 transition-all cursor-pointer"
                                        >
                                            <Download size={18} />
                                        </button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="p-2.5 rounded-xl hover:bg-white text-slate-400 hover:text-slate-900 transition-all cursor-pointer">
                                                    <MoreVertical size={18} />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-2xl p-2 border-white/60 bg-white/90 backdrop-blur-xl">
                                                <DropdownMenuItem
                                                    onClick={() => handleView(doc)}
                                                    className="rounded-xl gap-3 font-bold text-xs text-slate-600 py-2.5 cursor-pointer focus:bg-primary/5 focus:text-primary"
                                                >
                                                    <Eye size={16} /> View Document
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDownload(doc)}
                                                    className="rounded-xl gap-3 font-bold text-xs text-slate-600 py-2.5 cursor-pointer focus:bg-primary/5 focus:text-primary"
                                                >
                                                    <Download size={16} /> Download
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(doc.id)}
                                                    className="rounded-xl gap-3 font-bold text-xs text-red-500 py-2.5 cursor-pointer focus:bg-red-50"
                                                >
                                                    <Trash2 size={16} /> Delete Forever
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => {
                    setIsUploadModalOpen(false);
                    fetchDocuments();
                }}
            />
        </div>
    );
}
