"use client";

import React, { createContext, useContext, useCallback, useState } from "react";
import { CheckCircle2, X, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextValue {
    toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback((message: string, type: ToastType = "success") => {
        const id = Math.random().toString(36).slice(2);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 2800);
    }, []);

    const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={cn(
                            "pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl",
                            "animate-in slide-in-from-bottom-4 fade-in duration-300",
                            t.type === "success" && "bg-zinc-900/95 dark:bg-zinc-800/95 border-emerald-500/30 text-white",
                            t.type === "error" && "bg-zinc-900/95 dark:bg-zinc-800/95 border-rose-500/30 text-white",
                            t.type === "info" && "bg-zinc-900/95 dark:bg-zinc-800/95 border-indigo-500/30 text-white",
                        )}
                    >
                        {t.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                        {t.type === "error" && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                        {t.type === "info" && <Info className="w-4 h-4 text-indigo-400 shrink-0" />}
                        <span className="text-sm font-semibold">{t.message}</span>
                        <button
                            onClick={() => remove(t.id)}
                            className="ml-2 p-0.5 rounded-lg text-zinc-400 hover:text-white transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx;
}
