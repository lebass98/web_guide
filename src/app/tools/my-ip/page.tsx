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
    const [ipv4Only, setIpv4Only] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const fetchIp = async () => {
        setLoading(true);
        setError(null);
        setIpv4Only(null);
        
        try {
            // First, get detailed info (could be IPv4 or IPv6)
            const response = await fetch("https://ipapi.co/json/");
            if (!response.ok) throw new Error("IP 정보를 가져오는데 실패했습니다.");
            const data = await response.json();
            setIpInfo(data);

            // If we got an IPv6, try to specifically fetch IPv4 for convenience
            if (data.version === "IPv6") {
                try {
                    const ipv4Res = await fetch("https://api4.ipify.org?format=json");
                    const ipv4Data = await ipv4Res.json();
                    setIpv4Only(ipv4Data.ip);
                } catch (e) {
                    console.log("IPv4 only fetch failed, user might be on IPv6-only network.");
                }
            }
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

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-10 pb-20">
            <PageHeader
                title="내 IP 확인하기"
                description="현재 사용 중인 공인 IP 주소와 간략한 네트워크 정보를 즉시 확인하세요."
            />

            {/* Main IP Card */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200" />
                <div className="relative bg-white dark:bg-zinc-900 rounded-[28px] shadow-sm border border-gray-100 dark:border-zinc-800 p-8 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-400/5 rounded-full blur-3xl opacity-50" />
                    
                    <div className="flex flex-col md:flex-row items-center gap-6 z-10 w-full lg:w-auto text-center md:text-left">
                        <div className="w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner shrink-0 scale-90 md:scale-100">
                            <Shield className="w-10 h-10" />
                        </div>
                        <div className="w-full">
                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1.5">
                                Current Public IP Address ({ipInfo?.version})
                            </p>
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                {loading ? (
                                    <div className="h-12 w-64 bg-gray-100 dark:bg-zinc-800 animate-pulse rounded-lg mx-auto md:mx-0" />
                                ) : (
                                    <h2 className="text-2xl min-[400px]:text-3xl md:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white tracking-tight break-all leading-tight">
                                        {ipInfo?.ip || "불러오는 중..."}
                                    </h2>
                                )}
                                {!loading && (
                                    <button
                                        onClick={() => copyToClipboard(ipInfo?.ip || "")}
                                        className={cn(
                                            "self-center md:self-auto p-2.5 rounded-xl transition-all active:scale-95",
                                            copied 
                                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" 
                                                : "bg-gray-50 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white border border-gray-100 dark:border-zinc-700 shadow-sm"
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
                        className="z-10 flex items-center gap-2 px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-zinc-900/10 dark:shadow-white/10 disabled:opacity-50 shrink-0"
                    >
                        <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
                        주소 새로고침
                    </button>
                </div>
            </div>

            {/* Secondary IPv4 Card (If main is IPv6) */}
            {ipv4Only && !loading && (
                <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-500">
                            <Info className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none mb-1">Legacy IPv4 Detected</p>
                            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">{ipv4Only}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => copyToClipboard(ipv4Only)}
                        className="px-4 py-2 text-xs font-bold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                        IPv4 복사
                    </button>
                </div>
            )}

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
                    value={loading ? "..." : ipInfo?.version || "N/A"}
                    subValue={ipInfo?.version === "IPv6" ? "차세대 IP 주소 체계 (IPv6)" : "표준 IP 주소 체계 (IPv4)"}
                />
                <InfoCard 
                    icon={Globe} 
                    label="국가 코드" 
                    value={loading ? "..." : ipInfo?.country_name || "정보 없음"} 
                />
                <div className="flex flex-col justify-center p-6 bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 rounded-[28px]">
                    <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 mb-2">
                        <Info className="w-5 h-5" />
                        <span className="text-sm font-bold uppercase tracking-wider">안내사항</span>
                    </div>
                    <p className="text-xs text-blue-600/80 dark:text-blue-400/60 leading-relaxed font-medium">
                        5G/LTE 등 최신 네트워크에서는 숫자가 아닌 문자(IPv6)가 표시될 수 있습니다. 이는 지극히 정상적인 최신 규격의 IP 주소입니다.
                    </p>
                </div>
            </div>

            {/* FAQ / Info Section */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[32px] p-10 space-y-8">
                <h3 className="text-2xl font-bold flex items-center gap-3 text-zinc-900 dark:text-white">
                    <Info className="w-6 h-6 text-emerald-500" />
                    왜 IP 주소 형식이 다르게 보이나요?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                        <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                             전통적인 IPv4 (예: 123.45.67.89)
                        </h4>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                            4개의 숫자로 이루어진 기존의 주소 방식입니다. 하지만 전 세계적으로 사용할 수 있는 주소 개수가 부족해지면서 새로운 방식이 도입되었습니다.
                        </p>
                    </div>
                    <div className="space-y-3">
                        <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                             차세대 IPv6 (예: 2001:0db8...)
                        </h4>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                            무한에 가까운 주소를 제공하는 최신 방식입니다. <b>5G 통신 스마트폰</b>이나 최신 인터넷 환경에서는 보안과 성능이 강화된 IPv6 주소를 우선적으로 부여받게 됩니다.
                        </p>
                    </div>
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
                <p className="text-lg font-bold text-zinc-900 dark:text-white break-all">
                    {value || "정보 없음"}
                </p>
                {subValue && (
                    <p className="text-sm text-zinc-400 dark:text-zinc-500 text-xs font-medium">{subValue}</p>
                )}
            </div>
        </div>
    );
}
