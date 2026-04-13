"use client";

import { useMemo, useState } from "react";
import {
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    Copy,
    Minus,
    Plus,
    Rows3,
    WrapText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";
import { PageHeader } from "@/components/ui/PageHeader";

type FlexDirectionValue = "row" | "row-reverse" | "column" | "column-reverse";
type JustifyContentValue =
    | "flex-start"
    | "center"
    | "flex-end"
    | "space-between"
    | "space-around"
    | "space-evenly";
type AlignItemsValue = "stretch" | "flex-start" | "center" | "flex-end" | "baseline";
type FlexWrapValue = "nowrap" | "wrap" | "wrap-reverse";
type JustifyItemsValue = "stretch" | "start" | "center" | "end";
type AlignContentValue = "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly";

export default function FlexGridEditorPage() {
    const [mode, setMode] = useState<"flex" | "grid">("flex");

    const [flexDirection, setFlexDirection] = useState<FlexDirectionValue>("row");
    const [justifyContent, setJustifyContent] = useState<JustifyContentValue>("center");
    const [alignItems, setAlignItems] = useState<AlignItemsValue>("center");
    const [flexWrap, setFlexWrap] = useState<FlexWrapValue>("nowrap");
    const [gap, setGap] = useState(12);

    const [columns, setColumns] = useState(3);
    const [rowHeight, setRowHeight] = useState(72);
    const [gridGap, setGridGap] = useState(12);
    const [justifyItems, setJustifyItems] = useState<JustifyItemsValue>("stretch");
    const [alignContent, setAlignContent] = useState<AlignContentValue>("start");

    const containerStyle = useMemo<CSSProperties>(() => {
        if (mode === "flex") {
            return {
                display: "flex",
                flexDirection,
                justifyContent,
                alignItems,
                flexWrap,
                gap: `${gap}px`,
            };
        }

        return {
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gridAutoRows: `${rowHeight}px`,
            gap: `${gridGap}px`,
            justifyItems,
            alignContent,
        };
    }, [
        mode,
        flexDirection,
        justifyContent,
        alignItems,
        flexWrap,
        gap,
        columns,
        rowHeight,
        gridGap,
        justifyItems,
        alignContent,
    ]);

    const cssCode = useMemo(() => {
        if (mode === "flex") {
            return `.container {
  display: flex;
  flex-direction: ${flexDirection};
  justify-content: ${justifyContent};
  align-items: ${alignItems};
  flex-wrap: ${flexWrap};
  gap: ${gap}px;
}`;
        }

        return `.container {
  display: grid;
  grid-template-columns: repeat(${columns}, minmax(0, 1fr));
  grid-auto-rows: ${rowHeight}px;
  gap: ${gridGap}px;
  justify-items: ${justifyItems};
  align-content: ${alignContent};
}`;
    }, [
        mode,
        flexDirection,
        justifyContent,
        alignItems,
        flexWrap,
        gap,
        columns,
        rowHeight,
        gridGap,
        justifyItems,
        alignContent,
    ]);

    const htmlCode = `<div class="container">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
  <div class="item">4</div>
  <div class="item">5</div>
  <div class="item">6</div>
</div>`;

    const copyAllCode = async () => {
        await navigator.clipboard.writeText(`${cssCode}\n\n${htmlCode}`);
    };

    return (
        <div className="space-y-10">
            <PageHeader
                title="Flexbox·Grid 시각 에디터"
                description="레이아웃 속성을 클릭으로 조정하고, 결과 CSS/HTML 코드를 바로 복사하세요."
            />

            <div className="flex items-center gap-2">
                <button
                    onClick={() => setMode("flex")}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        mode === "flex"
                            ? "bg-indigo-600 text-white"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    }`}
                >
                    Flexbox
                </button>
                <button
                    onClick={() => setMode("grid")}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        mode === "grid"
                            ? "bg-indigo-600 text-white"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    }`}
                >
                    Grid
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <section className="glass-card p-6 md:p-8 rounded-3xl space-y-5 order-2 xl:order-1">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">속성 설정</h2>

                    {mode === "flex" ? (
                        <div className="space-y-4">
                            <OptionButtonGroup
                                label="flex-direction"
                                value={flexDirection}
                                onChange={(value) => setFlexDirection(value as FlexDirectionValue)}
                                options={[
                                    { value: "row", label: "row", description: "가로 정방향 배치", icon: ArrowRight },
                                    { value: "row-reverse", label: "row-reverse", description: "가로 역방향 배치", icon: ArrowLeft },
                                    { value: "column", label: "column", description: "세로 정방향 배치", icon: ArrowDown },
                                    { value: "column-reverse", label: "column-reverse", description: "세로 역방향 배치", icon: ArrowUp },
                                ]}
                            />
                            <OptionButtonGroup
                                label="justify-content"
                                value={justifyContent}
                                onChange={(value) => setJustifyContent(value as JustifyContentValue)}
                                options={[
                                    { value: "flex-start", label: "flex-start", description: "시작 기준 정렬", icon: ArrowLeft },
                                    { value: "center", label: "center", description: "가운데 정렬", icon: Minus },
                                    { value: "flex-end", label: "flex-end", description: "끝 기준 정렬", icon: ArrowRight },
                                    { value: "space-between", label: "space-between", description: "양끝 기준 균등 간격", icon: Rows3 },
                                    { value: "space-around", label: "space-around", description: "주변 여백 포함 균등", icon: WrapText },
                                    { value: "space-evenly", label: "space-evenly", description: "완전 균등 간격", icon: Plus },
                                ]}
                            />
                            <OptionButtonGroup
                                label="align-items"
                                value={alignItems}
                                onChange={(value) => setAlignItems(value as AlignItemsValue)}
                                options={[
                                    { value: "stretch", label: "stretch", description: "교차축으로 늘려 채움", icon: Plus },
                                    { value: "flex-start", label: "flex-start", description: "교차축 시작 정렬", icon: ArrowUp },
                                    { value: "center", label: "center", description: "교차축 가운데 정렬", icon: Minus },
                                    { value: "flex-end", label: "flex-end", description: "교차축 끝 정렬", icon: ArrowDown },
                                    { value: "baseline", label: "baseline", description: "텍스트 기준선 정렬", icon: Rows3 },
                                ]}
                            />
                            <OptionButtonGroup
                                label="flex-wrap"
                                value={flexWrap}
                                onChange={(value) => setFlexWrap(value as FlexWrapValue)}
                                options={[
                                    { value: "nowrap", label: "nowrap", description: "줄바꿈 없이 한 줄 배치", icon: ArrowRight },
                                    { value: "wrap", label: "wrap", description: "공간 부족 시 다음 줄", icon: WrapText },
                                    { value: "wrap-reverse", label: "wrap-reverse", description: "역방향 줄바꿈", icon: ArrowLeft },
                                ]}
                            />
                            <RangeField
                                label="gap"
                                value={gap}
                                min={0}
                                max={48}
                                onChange={setGap}
                                unit="px"
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <RangeField
                                label="grid-template-columns"
                                value={columns}
                                min={1}
                                max={6}
                                onChange={setColumns}
                                unit="col"
                            />
                            <RangeField
                                label="grid-auto-rows"
                                value={rowHeight}
                                min={48}
                                max={140}
                                onChange={setRowHeight}
                                unit="px"
                            />
                            <RangeField
                                label="gap"
                                value={gridGap}
                                min={0}
                                max={48}
                                onChange={setGridGap}
                                unit="px"
                            />
                            <OptionButtonGroup
                                label="justify-items"
                                value={justifyItems}
                                onChange={(value) => setJustifyItems(value as JustifyItemsValue)}
                                options={[
                                    { value: "stretch", label: "stretch", description: "셀 가로 영역 채움", icon: Plus },
                                    { value: "start", label: "start", description: "셀 시작 정렬", icon: ArrowLeft },
                                    { value: "center", label: "center", description: "셀 중앙 정렬", icon: Minus },
                                    { value: "end", label: "end", description: "셀 끝 정렬", icon: ArrowRight },
                                ]}
                            />
                            <OptionButtonGroup
                                label="align-content"
                                value={alignContent}
                                onChange={(value) => setAlignContent(value as AlignContentValue)}
                                options={[
                                    { value: "start", label: "start", description: "콘텐츠 시작 정렬", icon: ArrowUp },
                                    { value: "center", label: "center", description: "콘텐츠 중앙 정렬", icon: Minus },
                                    { value: "end", label: "end", description: "콘텐츠 끝 정렬", icon: ArrowDown },
                                    { value: "space-between", label: "space-between", description: "행 간격 균등", icon: Rows3 },
                                    { value: "space-around", label: "space-around", description: "행 주변 균등", icon: WrapText },
                                    { value: "space-evenly", label: "space-evenly", description: "행 완전 균등", icon: Plus },
                                ]}
                            />
                        </div>
                    )}
                </section>

                <section className="space-y-6 order-1 xl:order-2">
                    <div className="glass-card p-5 rounded-2xl">
                        <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3">실시간 미리보기</p>
                        <div
                            className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 p-4 min-h-[320px]"
                            style={containerStyle}
                        >
                            {Array.from({ length: 6 }).map((_, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-lg bg-indigo-500/15 dark:bg-indigo-500/25 border border-indigo-500/30 text-indigo-700 dark:text-indigo-200 font-bold flex items-center justify-center min-h-[56px]"
                                >
                                    Item {idx + 1}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="order-3 xl:order-3 xl:col-span-2">
                    <div className="glass-card p-5 rounded-2xl">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">생성 코드</p>
                            <button
                                onClick={copyAllCode}
                                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-indigo-500 transition-colors"
                            >
                                <Copy className="w-3.5 h-3.5" />
                                CSS+HTML 복사
                            </button>
                        </div>
                        <pre className="bg-zinc-900 text-zinc-200 rounded-xl p-4 text-xs leading-relaxed overflow-x-auto">{cssCode}</pre>
                        <pre className="bg-zinc-900 text-zinc-200 rounded-xl p-4 text-xs leading-relaxed overflow-x-auto mt-3">{htmlCode}</pre>
                    </div>
                </section>
            </div>
        </div>
    );
}

function OptionButtonGroup({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string; description: string; icon: LucideIcon }[];
}) {
    const selected = options.find((option) => option.value === value);

    return (
        <div className="block">
            <span className="text-xs font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">{label}</span>
            <div className="mt-2 flex flex-wrap gap-2">
                {options.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange(option.value)}
                        aria-label={`${option.label} ${option.description}`}
                        className={`relative group w-10 h-10 rounded-lg border transition-colors inline-flex items-center justify-center ${
                            value === option.value
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:border-indigo-300 dark:hover:border-indigo-500"
                        }`}
                    >
                        <option.icon className="w-4 h-4 shrink-0" />
                        <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+8px)] hidden whitespace-nowrap rounded-md bg-zinc-900 text-white text-[11px] px-2 py-1 shadow-lg group-hover:block z-20">
                            {option.label} ({option.description})
                        </span>
                    </button>
                ))}
            </div>
            {selected ? (
                <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">
                    선택됨: <span className="font-semibold">{selected.label}</span> ({selected.description})
                </p>
            ) : null}
        </div>
    );
}

function RangeField({
    label,
    value,
    min,
    max,
    onChange,
    unit,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    onChange: (value: number) => void;
    unit: string;
}) {
    return (
        <label className="block">
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">{label}</span>
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                    {value}
                    {unit}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full mt-2 accent-indigo-600"
            />
        </label>
    );
}
