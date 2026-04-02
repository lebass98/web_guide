"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Globe, RefreshCw, Copy, Shield, MapPin, Building, Wifi, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface IpInfo {
    ip: string;
    city?: string;
    region?: string;
    country_name?: string;
    org?: string;
    postal?: string;
    timezone?: string;
    network?: string;
    version?: string;
}

export default function MyIpPage() {
    const [ipInfo, setIpInfo] = useState<IpInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const fetchIp = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch more detailed info from ipapi.co
            const response = await fetch("https://ipapi.co/json/");
            if (!response.ok) throw new Error("IP 정보를 가져오는데 실패했습니다.");
            const data = await response.json();
            setIpInfo(data);
        } catch (err) {
            console.error(err);
            // Fallback to simple ipify if ipapi fails
            try {
                const fallbackRes = await fetch("https://api.ipify.org?format=json");
                const fallbackData = await fallbackRes.json();
                setIpInfo({ ip: fallbackData.ip });
            } catch (fallbackErr) {
                setError("IP 주소를 불러올 수 없습니다. 네트워크 연결을 확인해주세요.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIp();
    }, []);

    const copyToClipboard = () => {
        if (ipInfo?.ip) {
            navigator.clipboard.writeText(ipInfo.ip);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="space-y-10">
            <PageHeader
                title="내 IP 확인하기"
                description="현재 사용 중인 공인 IP 주소와 간략한 네트워크 정보를 즉시 확인하세요."
            />

            {/* Main IP Card */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200" />
                <div className="relative bg-white dark:bg-zinc-900 rounded-[28px] shadow-sm border border-gray-100 dark:border-zinc-800 p-10 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-400/5 rounded-full blur-3xl" />
                    
                    <div className="flex items-center gap-6 z-10">
                        <div className="w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
                            <Shield className="w-10 h-10" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Your Public IP Address</p>
                            <div className="flex items-center gap-4">
                                {loading ? (
                                    <div className="h-10 w-48 bg-gray-100 dark:bg-zinc-800 animate-pulse rounded-lg" />
                                ) : (
                                    <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
                                        {ipInfo?.ip || "불러오는 중..."}
                                    </h2>
                                )}
                                {!loading && (
                                    <button
                                        onClick={copyToClipboard}
                                        className={cn(
                                            "p-2.5 rounded-xl transition-all active:scale-95",
                                            copied 
                                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" 
                                                : "bg-gray-50 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white border border-gray-100 dark:border-zinc-700"
                                        )}
                                    >
                                        <Copy className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={fetchIp}
                        disabled={loading}
                        className="z-10 flex items-center gap-2 px-6 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-zinc-900/10 dark:shadow-white/10 disabled:opacity-50"
                    >
                        <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
                        주소 새로고침
                    </button>
                </div>
            </div>

            {/* Detailed Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoCard 
                    icon={MapPin} 
                    label="위치 정보" 
                    value={loading ? "..." : `${ipInfo?.city || ""}${ipInfo?.city && ipInfo?.region ? ", " : ""}${ipInfo?.region || ""} (${ipInfo?.country_name || "N/A"})`.trim()}
                    subValue={ipInfo?.postal ? `우편번호: ${ipInfo.postal}` : undefined}
                />
                <InfoCard 
                    icon={Building} 
                    label="인터넷 제공업체 (ISP)" 
                    value={loading ? "..." : ipInfo?.org || "정보 없음"} 
                />
                <InfoCard 
                    icon={Globe} 
                    label="시간대" 
                    value={loading ? "..." : ipInfo?.timezone || "정보 없음"} 
                />
                <InfoCard 
                    icon={Wifi} 
                    label="네트워크 규격" 
                    value={loading ? "..." : ipInfo?.version === "IPv4" ? "IPv4 Protocol" : ipInfo?.version === "IPv6" ? "IPv6 Protocol" : "N/A"} 
                />
                <InfoCard 
                    icon={Globe} 
                    label="국가 코드" 
                    value={loading ? "..." : ipInfo?.country_name || "정보 없음"} 
                />
                <div className="flex flex-col justify-center p-6 bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 rounded-[24px]">
                    <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 mb-2">
                        <Info className="w-5 h-5" />
                        <span className="text-sm font-bold uppercase tracking-wider">알림</span>
                    </div>
                    <p className="text-xs text-blue-600/80 dark:text-blue-400/60 leading-relaxed font-medium">
                        표시되는 정보는 공인 IP 기반의 예상 정보이며, VPN/프록시 사용 시 다를 수 있습니다.
                    </p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-sm font-semibold flex items-center gap-3">
                    <Info className="w-5 h-5 shrink-0" />
                    {error}
                </div>
            )}
        </div>
    );
}

function InfoCard({ icon: Icon, label, value, subValue }: { icon: any, label: string, value: string, subValue?: string }) {
    return (
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-6 rounded-[24px] shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{label}</span>
            </div>
            <div className="space-y-1">
                <p className="text-lg font-bold text-zinc-900 dark:text-white truncate">
                    {value || "정보 없음"}
                </p>
                {subValue && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{subValue}</p>
                )}
            </div>
        </div>
    );
}
