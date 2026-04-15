"use client";

import { useState, useRef, useCallback, useId } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import {
    Upload,
    X,
    Download,
    RefreshCw,
    ImageIcon,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ShieldCheck,
    Layers,
    Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type TargetFormat = "jpeg" | "png" | "webp";
type FileStatus = "pending" | "converting" | "done" | "error";

interface ConvertFile {
    id: string;
    file: File;
    previewUrl: string;
    status: FileStatus;
    resultUrl?: string;
    resultSize?: number;
    error?: string;
}

const FORMAT_LABELS: Record<TargetFormat, string> = {
    jpeg: "JPG / JPEG",
    png: "PNG",
    webp: "WebP",
};

const FORMAT_EXT: Record<TargetFormat, string> = {
    jpeg: "jpg",
    png: "png",
    webp: "webp",
};

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/bmp,image/svg+xml";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function baseName(name: string) {
    return name.replace(/\.[^/.]+$/, "");
}

async function convertImage(
    file: File,
    format: TargetFormat,
    quality: number
): Promise<{ url: string; size: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            const ctx = canvas.getContext("2d");
            if (!ctx) return reject(new Error("Canvas 지원 안 됨"));

            // JPEG 변환 시 투명 → 흰 배경
            if (format === "jpeg") {
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(objectUrl);

            const mimeType = `image/${format}`;
            const q = format === "png" ? undefined : quality / 100;

            canvas.toBlob(
                (blob) => {
                    if (!blob) return reject(new Error("변환 실패"));
                    const url = URL.createObjectURL(blob);
                    resolve({ url, size: blob.size });
                },
                mimeType,
                q
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("이미지 로드 실패"));
        };

        img.src = objectUrl;
    });
}

// ─── Components ───────────────────────────────────────────────────────────────

function FormatBtn({
    fmt,
    active,
    onClick,
}: {
    fmt: TargetFormat;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border",
                active
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20"
                    : "bg-white dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700/60 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400"
            )}
        >
            {FORMAT_LABELS[fmt]}
        </button>
    );
}

function FileCard({
    item,
    format,
    onRemove,
}: {
    item: ConvertFile;
    format: TargetFormat;
    onRemove: (id: string) => void;
}) {
    const savings =
        item.resultSize !== undefined && item.file.size > 0
            ? Math.round(((item.file.size - item.resultSize) / item.file.size) * 100)
            : null;

    return (
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 group">
            {/* Thumbnail */}
            <div className="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate">
                    {item.file.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        {formatBytes(item.file.size)}
                    </span>
                    {item.status === "done" && item.resultSize !== undefined && (
                        <>
                            <span className="text-zinc-300 dark:text-zinc-600 text-xs">→</span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                {formatBytes(item.resultSize)}
                            </span>
                            {savings !== null && (
                                <span
                                    className={cn(
                                        "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                                        savings > 0
                                            ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10"
                                            : savings < 0
                                            ? "text-rose-500 bg-rose-50 dark:bg-rose-500/10"
                                            : "text-zinc-500 bg-zinc-100 dark:bg-zinc-700"
                                    )}
                                >
                                    {savings > 0 ? `▼ ${savings}%` : savings < 0 ? `▲ ${Math.abs(savings)}%` : "±0%"}
                                </span>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Status / Action */}
            <div className="flex items-center gap-2 flex-shrink-0">
                {item.status === "pending" && (
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        대기
                    </span>
                )}
                {item.status === "converting" && (
                    <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                )}
                {item.status === "error" && (
                    <div className="flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden sm:inline">{item.error}</span>
                    </div>
                )}
                {item.status === "done" && item.resultUrl && (
                    <a
                        href={item.resultUrl}
                        download={`${baseName(item.file.name)}.${FORMAT_EXT[format]}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-sm"
                    >
                        <Download className="w-3.5 h-3.5" />
                        저장
                    </a>
                )}
                {item.status === "done" && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                )}

                {/* Remove */}
                <button
                    onClick={() => onRemove(item.id)}
                    className="p-1.5 rounded-lg text-zinc-300 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all opacity-0 group-hover:opacity-100"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ImageConverterPage() {
    const [files, setFiles] = useState<ConvertFile[]>([]);
    const [format, setFormat] = useState<TargetFormat>("webp");
    const [quality, setQuality] = useState(90);
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const uid = useId();

    const addFiles = useCallback((newFiles: FileList | File[]) => {
        const arr = Array.from(newFiles).filter((f) => f.type.startsWith("image/"));
        if (!arr.length) return;

        const items: ConvertFile[] = arr.map((file, i) => ({
            id: `${uid}-${Date.now()}-${i}`,
            file,
            previewUrl: URL.createObjectURL(file),
            status: "pending",
        }));

        setFiles((prev) => [...prev, ...items]);
    }, [uid]);

    const removeFile = (id: string) => {
        setFiles((prev) => {
            const item = prev.find((f) => f.id === id);
            if (item) {
                URL.revokeObjectURL(item.previewUrl);
                if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
            }
            return prev.filter((f) => f.id !== id);
        });
    };

    const clearAll = () => {
        files.forEach((f) => {
            URL.revokeObjectURL(f.previewUrl);
            if (f.resultUrl) URL.revokeObjectURL(f.resultUrl);
        });
        setFiles([]);
    };

    const handleConvert = async () => {
        const pending = files.filter((f) => f.status === "pending" || f.status === "error");
        if (!pending.length) return;

        for (const item of pending) {
            setFiles((prev) =>
                prev.map((f) => (f.id === item.id ? { ...f, status: "converting" } : f))
            );

            try {
                const { url, size } = await convertImage(item.file, format, quality);
                setFiles((prev) =>
                    prev.map((f) =>
                        f.id === item.id
                            ? { ...f, status: "done", resultUrl: url, resultSize: size }
                            : f
                    )
                );
            } catch (err) {
                setFiles((prev) =>
                    prev.map((f) =>
                        f.id === item.id
                            ? { ...f, status: "error", error: err instanceof Error ? err.message : "실패" }
                            : f
                    )
                );
            }
        }
    };

    const downloadAll = () => {
        files
            .filter((f) => f.status === "done" && f.resultUrl)
            .forEach((f) => {
                const a = document.createElement("a");
                a.href = f.resultUrl!;
                a.download = `${baseName(f.file.name)}.${FORMAT_EXT[format]}`;
                a.click();
            });
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const onDragLeave = () => setIsDragging(false);
    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        addFiles(e.dataTransfer.files);
    };

    const doneCount = files.filter((f) => f.status === "done").length;
    const pendingCount = files.filter((f) => f.status === "pending" || f.status === "error").length;
    const isConverting = files.some((f) => f.status === "converting");

    return (
        <>
            <PageHeader
                title="이미지 포맷 변환기"
                description="JPG · PNG · WebP — 브라우저에서 바로 변환, 서버 업로드 없이 완전 로컬 처리"
            />

            <div className="flex flex-col gap-5">
                {/* ── Info badges ── */}
                <div className="flex flex-wrap gap-2">
                    {[
                        { icon: ShieldCheck, text: "서버 업로드 없음 · 완전 로컬 처리" },
                        { icon: Layers, text: "다중 파일 일괄 변환" },
                        { icon: Zap, text: "JPG · PNG · WebP 지원" },
                    ].map(({ icon: Icon, text }) => (
                        <div
                            key={text}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs font-semibold text-zinc-500 dark:text-zinc-400"
                        >
                            <Icon className="w-3.5 h-3.5 text-indigo-500" />
                            {text}
                        </div>
                    ))}
                </div>

                {/* ── Settings ── */}
                <div className="glass-card p-5 flex flex-col sm:flex-row gap-5">
                    {/* Format */}
                    <div className="flex flex-col gap-2 flex-1">
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                            변환 포맷
                        </span>
                        <div className="flex gap-2">
                            {(["jpeg", "png", "webp"] as TargetFormat[]).map((f) => (
                                <FormatBtn
                                    key={f}
                                    fmt={f}
                                    active={format === f}
                                    onClick={() => setFormat(f)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Quality */}
                    <div className="flex flex-col gap-2 sm:w-56">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                                품질
                            </span>
                            <div className="flex items-center gap-1">
                                <span className="font-mono text-sm font-bold text-zinc-700 dark:text-zinc-200">
                                    {quality}
                                </span>
                                <span className="text-xs text-zinc-400">/ 100</span>
                                {format === "png" && (
                                    <span className="ml-1 text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded-full font-bold">
                                        무손실
                                    </span>
                                )}
                            </div>
                        </div>
                        <input
                            type="range"
                            min={1}
                            max={100}
                            value={quality}
                            disabled={format === "png"}
                            onChange={(e) => setQuality(Number(e.target.value))}
                            className={cn(
                                "w-full h-2 rounded-full appearance-none cursor-pointer",
                                "bg-zinc-200 dark:bg-zinc-700",
                                "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:shadow-md",
                                format === "png" && "opacity-40 cursor-not-allowed"
                            )}
                        />
                        <div className="flex justify-between text-[10px] text-zinc-400">
                            <span>저용량</span>
                            <span>고품질</span>
                        </div>
                    </div>
                </div>

                {/* ── Upload Zone ── */}
                <div
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => inputRef.current?.click()}
                    className={cn(
                        "glass-card flex flex-col items-center justify-center gap-3 py-12 px-6 cursor-pointer transition-all duration-200 border-2",
                        isDragging
                            ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-500/10 scale-[1.01]"
                            : "border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5"
                    )}
                >
                    <div
                        className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
                            isDragging
                                ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500"
                        )}
                    >
                        <Upload className="w-7 h-7" />
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-zinc-700 dark:text-zinc-200">
                            {isDragging ? "여기에 놓으세요!" : "이미지를 드래그하거나 클릭하여 업로드"}
                        </p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                            JPG, PNG, WebP, GIF, BMP, SVG · 여러 파일 동시 선택 가능
                        </p>
                    </div>
                    <input
                        ref={inputRef}
                        type="file"
                        accept={ACCEPT}
                        multiple
                        className="hidden"
                        onChange={(e) => e.target.files && addFiles(e.target.files)}
                    />
                </div>

                {/* ── File List ── */}
                {files.length > 0 && (
                    <div className="flex flex-col gap-3">
                        {/* List Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-zinc-400" />
                                <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                                    {files.length}개 파일
                                </span>
                                {doneCount > 0 && (
                                    <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                        {doneCount}개 완료
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={clearAll}
                                className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                전체 초기화
                            </button>
                        </div>

                        {/* Cards */}
                        <div className="flex flex-col gap-2">
                            {files.map((item) => (
                                <FileCard
                                    key={item.id}
                                    item={item}
                                    format={format}
                                    onRemove={removeFile}
                                />
                            ))}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-3 pt-1">
                            {pendingCount > 0 && (
                                <button
                                    onClick={handleConvert}
                                    disabled={isConverting}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all",
                                        isConverting
                                            ? "bg-indigo-400 dark:bg-indigo-600/60 text-white/70 cursor-not-allowed"
                                            : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
                                    )}
                                >
                                    {isConverting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            변환 중...
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-4 h-4" />
                                            {pendingCount}개 변환 시작 → {FORMAT_LABELS[format]}
                                        </>
                                    )}
                                </button>
                            )}

                            {doneCount > 1 && (
                                <button
                                    onClick={downloadAll}
                                    className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/60 transition-all"
                                >
                                    <Download className="w-4 h-4" />
                                    전체 다운로드 ({doneCount})
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Empty state ── */}
                {files.length === 0 && (
                    <div className="glass-card p-6">
                        <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4">
                            사용 방법
                        </p>
                        <ol className="flex flex-col gap-3">
                            {[
                                "변환할 포맷(JPG · PNG · WebP)과 품질을 설정합니다.",
                                "이미지 파일을 드래그하거나 업로드 영역을 클릭해 추가합니다.",
                                "'변환 시작' 버튼을 누르면 브라우저에서 즉시 변환됩니다.",
                                "변환 완료된 파일을 개별 또는 전체 다운로드합니다.",
                            ].map((step, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-xs font-black flex items-center justify-center">
                                        {i + 1}
                                    </span>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                        {step}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}
            </div>
        </>
    );
}
