"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ImpactBoxCard, BoxItem, DEFAULT_BOX_ITEMS } from "@/components/ui/ImpactBoxCard";
import { useToast } from "@/components/providers/ToastProvider";
import {
    Copy,
    RotateCcw,
    Plus,
    Trash2,
    Laptop,
    Tablet,
    Smartphone,
    Sun,
    Moon,
    Sparkles,
    Check,
    Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface PresetTheme {
    name: string;
    glowColor: string;
    bgClass?: string;
    title1: string;
    title2: string;
    subtitle: string;
    items: string[];
}

const PRESET_THEMES: PresetTheme[] = [
    {
        name: "토스 옐로우 (기본)",
        glowColor: "rgba(255, 245, 167, 1)",
        title1: "impact for",
        title2: "growth",
        subtitle: "성장의 토대",
        items: [
            "토스 앱에 오픈하는 내 서비스",
            "사장님의 경영을 돕는 결제 단말기",
            "온라인 사업에 필요한 결제 솔루션",
            "셀러와 사용자를 잇는 토스 쇼핑",
        ],
    },
    {
        name: "에메랄드 민트",
        glowColor: "rgba(167, 243, 208, 0.95)",
        title1: "power for",
        title2: "creators",
        subtitle: "창작의 즐거움",
        items: [
            "원클릭 디지털 에셋 배포",
            "글로벌 마켓플레이스 연동",
            "실시간 수익 분석 대시보드",
            "커뮤니티 후원 및 멤버십",
        ],
    },
    {
        name: "사이버 바이올렛",
        glowColor: "rgba(221, 214, 254, 0.95)",
        title1: "build for",
        title2: "future",
        subtitle: "차세대 AI 플랫폼",
        items: [
            "초거대 LLM 워크플로우 자동화",
            "노코드 에이전트 빌더",
            "엔터프라이즈 보안 및 온프레미스",
            "실시간 멀티모달 API 연동",
        ],
    },
    {
        name: "스카이 블루",
        glowColor: "rgba(186, 230, 253, 0.95)",
        title1: "cloud for",
        title2: "scale",
        subtitle: "무한한 확장성",
        items: [
            "글로벌 초저지연 CDN 엣지망",
            "서버리스 오토스케일링 인프라",
            "실시간 네트워크 가시성 모니터링",
            "스마트 장애 복구 아키텍처",
        ],
    },
    {
        name: "로즈 블러썸",
        glowColor: "rgba(254, 205, 211, 0.95)",
        title1: "design for",
        title2: "delight",
        subtitle: "경험의 완성",
        items: [
            "일관된 멀티플랫폼 디자인 시스템",
            "마이크로 인터랙션 모션 라이브러리",
            "접근성(A11y) 자동 검증 툴",
            "디자이너-개발자 핸드오프 스위트",
        ],
    },
];

export default function BoxPage() {
    const { toast } = useToast();

    // Box Component State
    const [titleLine1, setTitleLine1] = useState("impact for");
    const [titleLine2, setTitleLine2] = useState("growth");
    const [subtitle, setSubtitle] = useState("성장의 토대");
    const [glowColor, setGlowColor] = useState("rgba(255, 245, 167, 1)");
    const [items, setItems] = useState<BoxItem[]>(DEFAULT_BOX_ITEMS);

    // Preview Toolbar State
    const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
    const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("light");
    const [codeFormat, setCodeFormat] = useState<"react" | "html-tailwind" | "vanilla">("react");

    // Handlers
    const handleApplyPreset = (preset: PresetTheme) => {
        setTitleLine1(preset.title1);
        setTitleLine2(preset.title2);
        setSubtitle(preset.subtitle);
        setGlowColor(preset.glowColor);
        setItems(preset.items.map((text, idx) => ({ id: String(idx + 1), text })));
        toast(`'${preset.name}' 프리셋이 적용되었습니다.`, "info");
    };

    const handleAddItem = () => {
        if (items.length >= 8) {
            toast("최대 8개까지 추가할 수 있습니다.", "error");
            return;
        }
        const newItem: BoxItem = {
            id: String(Date.now()),
            text: `새 바로가기 메뉴 ${items.length + 1}`,
        };
        setItems((prev) => [...prev, newItem]);
    };

    const handleUpdateItemText = (id: string, text: string) => {
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, text } : item)));
    };

    const handleRemoveItem = (id: string) => {
        if (items.length <= 1) {
            toast("최소 1개 이상의 항목이 필요합니다.", "error");
            return;
        }
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const handleReset = () => {
        handleApplyPreset(PRESET_THEMES[0]);
    };

    const handleItemClick = (item: BoxItem) => {
        toast(`"${item.text}" 항목을 클릭했습니다.`, "info");
    };

    // Code Generator
    const generateCode = () => {
        if (codeFormat === "react") {
            return `import React from "react";
import { ChevronRight } from "lucide-react";

export function ImpactBox() {
  const items = ${JSON.stringify(items.map(i => i.text), null, 4)};

  return (
    <div
      className="rounded-[40px] md:rounded-[45px] p-8 md:pt-[60px] md:pr-16 md:pb-[60px] md:pl-16 flex flex-col lg:flex-row gap-8 lg:gap-[100px] items-start justify-between relative overflow-hidden bg-[#fcfcfa] border border-amber-100"
      style={{
        backgroundImage: "radial-gradient(closest-side, ${glowColor} 0%, rgba(255, 245, 167, 0) 72%)",
      }}
    >
      {/* Left Title */}
      <div className="flex flex-col justify-between shrink-0 w-full lg:w-[295px] gap-6">
        <div>
          <h2 className="text-[#333d4b] text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight">
            ${titleLine1}
          </h2>
          <h2 className="text-[#333d4b] text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight">
            ${titleLine2}
          </h2>
        </div>
        ${subtitle ? `<div className="flex items-center gap-2 text-[#333d4b]/75 font-bold text-2xl md:text-3xl cursor-pointer hover:opacity-100 transition-opacity">
          <span>${subtitle}</span>
          <ChevronRight className="w-6 h-6 stroke-[2.5]" />
        </div>` : ""}
      </div>

      {/* Right List */}
      <div className="flex flex-col gap-4 w-full lg:w-[500px] shrink-0 justify-center">
        {items.map((text, idx) => (
          <button
            key={idx}
            className="bg-white rounded-full py-4 md:py-5 pl-7 pr-5 flex items-center justify-between shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer border border-white/80"
          >
            <span className="text-[#333d4b] font-semibold text-lg md:text-xl tracking-tight">
              {text}
            </span>
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 group-hover:bg-amber-400 group-hover:text-zinc-900 transition-all">
              <ChevronRight className="w-6 h-6 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}`;
        }

        if (codeFormat === "html-tailwind") {
            return `<div
  class="rounded-[45px] p-8 md:pt-[60px] md:pr-16 md:pb-[60px] md:pl-16 flex flex-col lg:flex-row gap-8 lg:gap-[100px] items-start justify-between relative overflow-hidden bg-[#fcfcfa] border border-amber-100"
  style="background-image: radial-gradient(closest-side, ${glowColor} 0%, rgba(255, 245, 167, 0) 72%);"
>
  <!-- Left Side -->
  <div class="flex flex-col justify-between shrink-0 w-full lg:w-[295px] gap-6">
    <div>
      <div class="text-[#333d4b] text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight">
        ${titleLine1}
      </div>
      <div class="text-[#333d4b] text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight">
        ${titleLine2}
      </div>
    </div>
    ${subtitle ? `<div class="flex items-center gap-2 text-[#333d4b]/75 font-bold text-2xl md:text-3xl">
      <span>${subtitle}</span>
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
    </div>` : ""}
  </div>

  <!-- Right Pill List -->
  <div class="flex flex-col gap-4 w-full lg:w-[500px] shrink-0 justify-center">
    ${items.map(i => `<div class="bg-white rounded-full py-4 md:py-5 pl-7 pr-5 flex items-center justify-between shadow-sm hover:shadow-md transition-all cursor-pointer">
      <span class="text-[#333d4b] font-semibold text-lg md:text-xl">${i.text}</span>
      <div class="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
      </div>
    </div>`).join("\n    ")}
  </div>
</div>`;
        }

        return `<!-- HTML -->
<div class="toss-impact-box">
  <div class="toss-box-left">
    <div class="toss-box-title">
      <div>${titleLine1}</div>
      <div>${titleLine2}</div>
    </div>
    ${subtitle ? `<div class="toss-box-subtitle">${subtitle} &rsaquo;</div>` : ""}
  </div>
  <div class="toss-box-right">
    ${items.map(i => `<div class="toss-pill-item">
      <span>${i.text}</span>
      <div class="toss-pill-arrow">&rsaquo;</div>
    </div>`).join("\n    ")}
  </div>
</div>

<!-- CSS -->
<style>
.toss-impact-box {
  border-radius: 45px;
  padding: 60px 64px;
  display: flex;
  justify-content: space-between;
  gap: 80px;
  background-color: #fcfcfa;
  background-image: radial-gradient(closest-side, ${glowColor} 0%, rgba(255, 245, 167, 0) 72%);
  border: 1px solid rgba(254, 243, 199, 0.8);
  box-shadow: 0 10px 30px rgba(0,0,0,0.03);
  font-family: -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif;
}
.toss-box-title {
  font-size: 56px;
  font-weight: 800;
  line-height: 1.1;
  color: #333d4b;
}
.toss-box-subtitle {
  font-size: 26px;
  font-weight: 700;
  color: rgba(51, 61, 75, 0.75);
  margin-top: 24px;
}
.toss-box-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 500px;
}
.toss-pill-item {
  background: #ffffff;
  border-radius: 9999px;
  padding: 18px 24px 18px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  font-size: 18px;
  font-weight: 600;
  color: #333d4b;
}
.toss-pill-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}
.toss-pill-arrow {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f4f5f7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}
</style>`;
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(generateCode());
        toast("코드가 클립보드에 복사되었습니다!", "success");
    };

    return (
        <div className="space-y-10">
            <PageHeader
                title="박스 (Box UI 컴포넌트)"
                description="토스 스타일의 감각적인 방사형 그라데이션과 바로가기 알약 버튼을 갖춘 배너 박스 컴포넌트입니다."
            />

            {/* Top Controls: Preset Badges */}
            <div className="glass-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                            추천 테마 프리셋
                        </span>
                    </div>
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                        <RotateCcw className="w-3.5 h-3.5" /> 초기화
                    </button>
                </div>

                <div className="flex flex-wrap gap-2.5">
                    {PRESET_THEMES.map((preset) => {
                        const isSelected = glowColor === preset.glowColor;
                        return (
                            <button
                                key={preset.name}
                                onClick={() => handleApplyPreset(preset)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95",
                                    isSelected
                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-600/30"
                                        : "bg-white/70 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 border border-gray-200/60 dark:border-zinc-700/60 hover:bg-white dark:hover:bg-zinc-800"
                                )}
                            >
                                <span
                                    className="w-3 h-3 rounded-full border border-black/10 shadow-xs"
                                    style={{ backgroundColor: preset.glowColor }}
                                />
                                {preset.name}
                                {isSelected && <Check className="w-3.5 h-3.5" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Live Interactive Preview Canvas */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                        라이브 컴포넌트 프리뷰
                    </span>

                    <div className="flex items-center gap-2">
                        {/* Device Mode Switcher */}
                        <div className="flex items-center bg-zinc-200/70 dark:bg-zinc-800/80 p-1 rounded-xl gap-1">
                            <button
                                onClick={() => setPreviewDevice("desktop")}
                                className={cn(
                                    "p-1.5 rounded-lg transition-all",
                                    previewDevice === "desktop"
                                        ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
                                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                                )}
                                title="데스크톱 뷰"
                            >
                                <Laptop className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPreviewDevice("tablet")}
                                className={cn(
                                    "p-1.5 rounded-lg transition-all",
                                    previewDevice === "tablet"
                                        ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
                                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                                )}
                                title="태블릿 뷰"
                            >
                                <Tablet className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPreviewDevice("mobile")}
                                className={cn(
                                    "p-1.5 rounded-lg transition-all",
                                    previewDevice === "mobile"
                                        ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
                                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                                )}
                                title="모바일 뷰"
                            >
                                <Smartphone className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Theme Mode Toggle for Preview */}
                        <button
                            onClick={() => setPreviewTheme(previewTheme === "light" ? "dark" : "light")}
                            className="p-2 bg-zinc-200/70 dark:bg-zinc-800/80 rounded-xl text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all shadow-xs"
                            title="프리뷰 테마 전환"
                        >
                            {previewTheme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Canvas Container */}
                <div
                    className={cn(
                        "rounded-[32px] p-4 sm:p-8 flex items-center justify-center transition-all duration-300 border border-black/5 dark:border-white/5",
                        previewTheme === "light"
                            ? "bg-zinc-100/80 dark:bg-zinc-900/50"
                            : "bg-zinc-950 text-white"
                    )}
                >
                    <div
                        className={cn(
                            "w-full transition-all duration-300",
                            previewDevice === "tablet" && "max-w-[720px]",
                            previewDevice === "mobile" && "max-w-[390px]"
                        )}
                    >
                        <ImpactBoxCard
                            titleLine1={titleLine1}
                            titleLine2={titleLine2}
                            subtitle={subtitle}
                            items={items}
                            glowColor={glowColor}
                            onItemClick={handleItemClick}
                        />
                    </div>
                </div>
            </div>

            {/* Customization & Code Generation Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Left: Customization Form (5 cols) */}
                <div className="xl:col-span-5 space-y-6">
                    <div className="glass-card p-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-4">
                            <h3 className="font-bold text-gray-900 dark:text-white text-base">
                                텍스트 및 스타일 설정
                            </h3>
                            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full">
                                커스터마이징
                            </span>
                        </div>

                        {/* Title Inputs */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                    메인 타이틀 1행
                                </label>
                                <input
                                    type="text"
                                    value={titleLine1}
                                    onChange={(e) => setTitleLine1(e.target.value)}
                                    placeholder="예: impact for"
                                    className="w-full px-4 py-2.5 bg-white/70 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                    메인 타이틀 2행
                                </label>
                                <input
                                    type="text"
                                    value={titleLine2}
                                    onChange={(e) => setTitleLine2(e.target.value)}
                                    placeholder="예: growth"
                                    className="w-full px-4 py-2.5 bg-white/70 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                    서브 타이틀 (하단 라벨)
                                </label>
                                <input
                                    type="text"
                                    value={subtitle}
                                    onChange={(e) => setSubtitle(e.target.value)}
                                    placeholder="예: 성장의 토대"
                                    className="w-full px-4 py-2.5 bg-white/70 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                    방사형 글로우 색상 (CSS Color)
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={glowColor}
                                        onChange={(e) => setGlowColor(e.target.value)}
                                        className="flex-1 px-4 py-2.5 bg-white/70 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <div
                                        className="w-10 h-10 rounded-xl border border-black/10 shadow-sm shrink-0"
                                        style={{ backgroundColor: glowColor }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* List Items Manager */}
                        <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                    알약 바로가기 목록 ({items.length}/8)
                                </label>
                                <button
                                    onClick={handleAddItem}
                                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    <Plus className="w-3.5 h-3.5" /> 항목 추가
                                </button>
                            </div>

                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                                <AnimatePresence>
                                    {items.map((item, idx) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex items-center gap-2"
                                        >
                                            <span className="text-xs font-bold text-zinc-400 w-4 text-center">
                                                {idx + 1}
                                            </span>
                                            <input
                                                type="text"
                                                value={item.text}
                                                onChange={(e) => handleUpdateItemText(item.id, e.target.value)}
                                                className="flex-1 px-3 py-2 bg-white/70 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="p-2 text-zinc-400 hover:text-rose-500 transition-colors"
                                                title="삭제"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Code Generator & Export (7 cols) */}
                <div className="xl:col-span-7 flex flex-col">
                    <div className="glass-card p-6 flex flex-col flex-1 space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-4">
                            <div className="flex items-center gap-2">
                                <Code2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                <span className="font-bold text-gray-900 dark:text-white text-base">
                                    코드 생성 & 내보내기
                                </span>
                            </div>

                            {/* Format Switcher */}
                            <div className="flex items-center bg-zinc-200/70 dark:bg-zinc-800/80 p-1 rounded-xl gap-1">
                                <button
                                    onClick={() => setCodeFormat("react")}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                        codeFormat === "react"
                                            ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
                                            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                                    )}
                                >
                                    React (JSX)
                                </button>
                                <button
                                    onClick={() => setCodeFormat("html-tailwind")}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                        codeFormat === "html-tailwind"
                                            ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
                                            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                                    )}
                                >
                                    HTML + Tailwind
                                </button>
                                <button
                                    onClick={() => setCodeFormat("vanilla")}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                        codeFormat === "vanilla"
                                            ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
                                            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                                    )}
                                >
                                    Vanilla CSS
                                </button>
                            </div>
                        </div>

                        {/* Code Box */}
                        <div className="relative flex-1 min-h-[380px] flex flex-col">
                            <div className="absolute top-3 right-3 z-10">
                                <button
                                    onClick={handleCopyCode}
                                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/25 active:scale-95 transition-all"
                                >
                                    <Copy className="w-3.5 h-3.5" /> 코드 복사
                                </button>
                            </div>

                            <pre className="p-5 bg-zinc-950 text-indigo-200 rounded-2xl text-xs sm:text-sm font-mono leading-relaxed overflow-x-auto flex-1 border border-zinc-800">
                                <code>{generateCode()}</code>
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
