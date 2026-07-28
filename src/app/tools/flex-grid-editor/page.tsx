"use client";

import { useState, useMemo, useCallback } from "react";
import {
    Check, Copy, Plus, Minus, RefreshCw, ChevronDown, Search,
    Sparkles, Eye, ArrowRight, ArrowDown, LayoutGrid, Box
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useToast } from "@/components/providers/ToastProvider";
import { cn } from "@/lib/utils";

// ─── TYPES & INTERFACES ────────────────────────────────────────────────────────

type MainTab = "flex-cheatsheet" | "grid-cheatsheet" | "playground";
type Mode = "flex" | "grid";

type FlexDir = "row" | "row-reverse" | "column" | "column-reverse";
type JCValue = "flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "space-evenly";
type AIValue = "stretch" | "flex-start" | "center" | "flex-end" | "baseline";
type ACValue = "flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "space-evenly" | "stretch";
type FWValue = "nowrap" | "wrap" | "wrap-reverse";

interface FlexCfg {
    direction: FlexDir;
    justifyContent: JCValue;
    alignItems: AIValue;
    alignContent: ACValue;
    wrap: FWValue;
    colGap: number;
    rowGap: number;
    pt: number; pr: number; pb: number; pl: number;
}

interface GridCfg {
    cols: number;
    rows: number;
    colGap: number;
    rowGap: number;
    justifyItems: "stretch" | "start" | "center" | "end";
    alignItems: "stretch" | "start" | "center" | "end";
    justifyContent: "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly";
    alignContent: "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly";
    autoRows: number;
    pt: number; pr: number; pb: number; pl: number;
}

interface ItemProp {
    id: number;
    grow: number; shrink: number; basis: string;
    alignSelf: "auto" | "flex-start" | "center" | "flex-end" | "stretch";
    order: number;
    colSpan: number; rowSpan: number;
}

// ─── DEFAULTS & PALETTE ───────────────────────────────────────────────────────

const DEFAULT_FLEX: FlexCfg = {
    direction: "row", justifyContent: "flex-start", alignItems: "stretch",
    alignContent: "flex-start", wrap: "wrap", colGap: 12, rowGap: 12,
    pt: 16, pr: 16, pb: 16, pl: 16,
};
const DEFAULT_GRID: GridCfg = {
    cols: 3, rows: 2, colGap: 12, rowGap: 12, justifyItems: "stretch", alignItems: "stretch",
    justifyContent: "start", alignContent: "start", autoRows: 80,
    pt: 16, pr: 16, pb: 16, pl: 16,
};
const DEFAULT_ITEM: ItemProp = { id: 0, grow: 0, shrink: 1, basis: "auto", alignSelf: "auto", order: 0, colSpan: 1, rowSpan: 1 };

const ITEM_PALETTE = [
    { bg: "bg-indigo-500/20 dark:bg-indigo-500/30", border: "border-indigo-500/50", text: "text-indigo-700 dark:text-indigo-300", ring: "ring-indigo-500" },
    { bg: "bg-rose-500/20 dark:bg-rose-500/30",   border: "border-rose-500/50",   text: "text-rose-700 dark:text-rose-300",     ring: "ring-rose-500" },
    { bg: "bg-emerald-500/20 dark:bg-emerald-500/30",border: "border-emerald-500/50",text: "text-emerald-700 dark:text-emerald-300",ring: "ring-emerald-500" },
    { bg: "bg-amber-500/20 dark:bg-amber-500/30",  border: "border-amber-500/50",  text: "text-amber-700 dark:text-amber-300",   ring: "ring-amber-500" },
    { bg: "bg-violet-500/20 dark:bg-violet-500/30", border: "border-violet-500/50", text: "text-violet-700 dark:text-violet-300", ring: "ring-violet-500" },
    { bg: "bg-cyan-500/20 dark:bg-cyan-500/30",   border: "border-cyan-500/50",   text: "text-cyan-700 dark:text-cyan-300",     ring: "ring-cyan-500" },
    { bg: "bg-pink-500/20 dark:bg-pink-500/30",   border: "border-pink-500/50",   text: "text-pink-700 dark:text-pink-300",     ring: "ring-pink-500" },
    { bg: "bg-teal-500/20 dark:bg-teal-500/30",   border: "border-teal-500/50",   text: "text-teal-700 dark:text-teal-300",     ring: "ring-teal-500" },
];

// ─── TAILWIND UTILS ────────────────────────────────────────────────────────────

const JC_TW: Record<string, string> = {
    "flex-start": "justify-start", center: "justify-center", "flex-end": "justify-end",
    "space-between": "justify-between", "space-around": "justify-around", "space-evenly": "justify-evenly",
    start: "justify-start", end: "justify-end",
};
const AI_TW: Record<string, string> = {
    stretch: "items-stretch", "flex-start": "items-start", center: "items-center",
    "flex-end": "items-end", baseline: "items-baseline", start: "items-start", end: "items-end",
};
const FD_TW: Record<string, string> = {
    row: "flex-row", "row-reverse": "flex-row-reverse", column: "flex-col", "column-reverse": "flex-col-reverse",
};
const FW_TW: Record<string, string> = { nowrap: "flex-nowrap", wrap: "flex-wrap", "wrap-reverse": "flex-wrap-reverse" };
const JI_TW: Record<string, string> = { stretch: "justify-items-stretch", start: "justify-items-start", center: "justify-items-center", end: "justify-items-end" };
const AC_TW: Record<string, string> = {
    "flex-start": "content-start", start: "content-start", center: "content-center",
    "flex-end": "content-end", end: "content-end", "space-between": "content-between",
    "space-around": "content-around", "space-evenly": "content-evenly", stretch: "content-stretch"
};

// ─── SVG ICONS ─────────────────────────────────────────────────────────────────

function Svg({ c }: { c: React.ReactNode }) {
    return <svg viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5">{c}</svg>;
}

const IcRow     = () => <Svg c={<><rect x="1" y="5.5" width="4" height="5" rx="0.75"/><rect x="6.5" y="5.5" width="4" height="5" rx="0.75"/><rect x="12" y="5.5" width="3" height="5" rx="0.75"/></>} />;
const IcRowRev  = () => <Svg c={<><rect x="12" y="5.5" width="3" height="5" rx="0.75"/><rect x="6.5" y="5.5" width="4" height="5" rx="0.75"/><rect x="1" y="5.5" width="4" height="5" rx="0.75"/></>} />;
const IcCol     = () => <Svg c={<><rect x="4" y="1" width="8" height="4" rx="0.75"/><rect x="4" y="6.5" width="8" height="4" rx="0.75"/><rect x="4" y="12" width="8" height="3" rx="0.75"/></>} />;
const IcColRev  = () => <Svg c={<><rect x="4" y="12" width="8" height="3" rx="0.75"/><rect x="4" y="6.5" width="8" height="4" rx="0.75"/><rect x="4" y="1" width="8" height="4" rx="0.75"/></>} />;

const IcNowrap  = () => <Svg c={<><rect x="1" y="6" width="3" height="4" rx="0.6"/><rect x="4.5" y="6" width="3" height="4" rx="0.6"/><rect x="8" y="6" width="3" height="4" rx="0.6"/><rect x="11.5" y="6" width="3.5" height="4" rx="0.6"/></>} />;
const IcWrap    = () => <Svg c={<><rect x="1" y="2.5" width="3.5" height="4" rx="0.6"/><rect x="5.5" y="2.5" width="3.5" height="4" rx="0.6"/><rect x="10" y="2.5" width="4.5" height="4" rx="0.6"/><rect x="1" y="9.5" width="3.5" height="4" rx="0.6"/><rect x="5.5" y="9.5" width="3.5" height="4" rx="0.6"/></>} />;
const IcWrapRev = () => <Svg c={<><rect x="1" y="9.5" width="3.5" height="4" rx="0.6"/><rect x="5.5" y="9.5" width="3.5" height="4" rx="0.6"/><rect x="10" y="9.5" width="4.5" height="4" rx="0.6"/><rect x="1" y="2.5" width="3.5" height="4" rx="0.6"/><rect x="5.5" y="2.5" width="3.5" height="4" rx="0.6"/></>} />;

const IcJStart   = () => <Svg c={<><rect x="1" y="5.5" width="1" height="5" rx="0.5" opacity="0.45"/><rect x="3" y="6.5" width="3.5" height="3" rx="0.6"/><rect x="7.5" y="6.5" width="4" height="3" rx="0.6"/></>} />;
const IcJCenter  = () => <Svg c={<><rect x="1.5" y="6.5" width="3" height="3" rx="0.6"/><rect x="6.5" y="6.5" width="3" height="3" rx="0.6"/><rect x="11.5" y="6.5" width="3" height="3" rx="0.6"/></>} />;
const IcJEnd     = () => <Svg c={<><rect x="14" y="5.5" width="1" height="5" rx="0.5" opacity="0.45"/><rect x="9.5" y="6.5" width="3.5" height="3" rx="0.6"/><rect x="5" y="6.5" width="3.5" height="3" rx="0.6"/></>} />;
const IcJBetween = () => <Svg c={<><rect x="1" y="6.5" width="3.5" height="3" rx="0.6"/><rect x="6.25" y="6.5" width="3.5" height="3" rx="0.6"/><rect x="11.5" y="6.5" width="3.5" height="3" rx="0.6"/></>} />;
const IcJAround  = () => <Svg c={<><rect x="1.5" y="6.5" width="3" height="3" rx="0.6"/><rect x="6.5" y="6.5" width="3" height="3" rx="0.6"/><rect x="11.5" y="6.5" width="3" height="3" rx="0.6"/></>} />;
const IcJEvenly  = () => <Svg c={<><rect x="2" y="6.5" width="2.5" height="3" rx="0.6"/><rect x="6.75" y="6.5" width="2.5" height="3" rx="0.6"/><rect x="11.5" y="6.5" width="2.5" height="3" rx="0.6"/></>} />;

const IcAStretch  = () => <Svg c={<><rect x="1" y="3" width="14" height="0.7" rx="0.35" opacity="0.35"/><rect x="1" y="12.3" width="14" height="0.7" rx="0.35" opacity="0.35"/><rect x="2" y="3.7" width="3" height="8.6" rx="0.75"/><rect x="6.5" y="3.7" width="3" height="8.6" rx="0.75"/><rect x="11" y="3.7" width="3" height="8.6" rx="0.75"/></>} />;
const IcAStart    = () => <Svg c={<><rect x="1" y="3" width="14" height="0.7" rx="0.35" opacity="0.35"/><rect x="2" y="3.7" width="3" height="5" rx="0.75"/><rect x="6.5" y="3.7" width="3" height="7" rx="0.75"/><rect x="11" y="3.7" width="3" height="4" rx="0.75"/></>} />;
const IcACenter   = () => <Svg c={<><rect x="1" y="7.65" width="14" height="0.7" rx="0.35" opacity="0.35"/><rect x="2" y="5.25" width="3" height="5.5" rx="0.75"/><rect x="6.5" y="4.25" width="3" height="7.5" rx="0.75"/><rect x="11" y="6.25" width="3" height="3.5" rx="0.75"/></>} />;
const IcAEnd      = () => <Svg c={<><rect x="1" y="12.3" width="14" height="0.7" rx="0.35" opacity="0.35"/><rect x="2" y="7.3" width="3" height="5" rx="0.75"/><rect x="6.5" y="5.3" width="3" height="7" rx="0.75"/><rect x="11" y="8.3" width="3" height="4" rx="0.75"/></>} />;
const IcABaseline = () => <Svg c={<><rect x="1" y="9.5" width="14" height="0.5" rx="0.25" opacity="0.45"/><rect x="2" y="4.5" width="3" height="5" rx="0.75"/><rect x="6.5" y="3" width="3" height="6.5" rx="0.75"/><rect x="11" y="6" width="3" height="3.5" rx="0.75"/></>} />;

const IcGJStart  = () => <Svg c={<><rect x="1" y="1" width="14" height="14" rx="1.5" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.3"/><rect x="2.5" y="4" width="5" height="8" rx="0.6"/></>} />;
const IcGJCenter = () => <Svg c={<><rect x="1" y="1" width="14" height="14" rx="1.5" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.3"/><rect x="5.5" y="4" width="5" height="8" rx="0.6"/></>} />;
const IcGJEnd    = () => <Svg c={<><rect x="1" y="1" width="14" height="14" rx="1.5" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.3"/><rect x="8.5" y="4" width="5" height="8" rx="0.6"/></>} />;
const IcGAStart  = () => <Svg c={<><rect x="1" y="1" width="14" height="14" rx="1.5" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.3"/><rect x="3" y="2.5" width="10" height="5" rx="0.6"/></>} />;
const IcGACenter = () => <Svg c={<><rect x="1" y="1" width="14" height="14" rx="1.5" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.3"/><rect x="3" y="5.5" width="10" height="5" rx="0.6"/></>} />;
const IcGAEnd    = () => <Svg c={<><rect x="1" y="1" width="14" height="14" rx="1.5" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.3"/><rect x="3" y="8.5" width="10" height="5" rx="0.6"/></>} />;

// ─── CHEATSHEET DATA DEFINITIONS ─────────────────────────────────────────────

interface CheatPropItem {
    id: string;
    title: string;
    desc: string;
    target: "container" | "item";
    options: { value: string; label?: string; css?: React.CSSProperties; itemCss?: React.CSSProperties }[];
    defaultVal: string;
}

const FLEX_CHEATSHEET_CONTAINER: CheatPropItem[] = [
    {
        id: "flex-direction",
        title: "flex-direction",
        desc: "주 축(Main Axis)의 방향과 아이템의 정렬 방향을 지정합니다.",
        target: "container",
        options: [
            { value: "row", label: "row" },
            { value: "row-reverse", label: "row-reverse" },
            { value: "column", label: "column" },
            { value: "column-reverse", label: "column-reverse" },
        ],
        defaultVal: "row",
    },
    {
        id: "flex-wrap",
        title: "flex-wrap",
        desc: "아이템들이 한 줄에 담기지 않을 때 줄바꿈 여부를 설정합니다.",
        target: "container",
        options: [
            { value: "nowrap", label: "nowrap" },
            { value: "wrap", label: "wrap" },
            { value: "wrap-reverse", label: "wrap-reverse" },
        ],
        defaultVal: "wrap",
    },
    {
        id: "justify-content",
        title: "justify-content",
        desc: "주 축(Main Axis)을 기준으로 아이템들의 정렬과 간격을 설정합니다.",
        target: "container",
        options: [
            { value: "flex-start", label: "flex-start" },
            { value: "center", label: "center" },
            { value: "flex-end", label: "flex-end" },
            { value: "space-between", label: "space-between" },
            { value: "space-around", label: "space-around" },
            { value: "space-evenly", label: "space-evenly" },
        ],
        defaultVal: "flex-start",
    },
    {
        id: "align-items",
        title: "align-items",
        desc: "교차 축(Cross Axis)을 기준으로 아이템들의 수직 정렬을 설정합니다.",
        target: "container",
        options: [
            { value: "stretch", label: "stretch" },
            { value: "flex-start", label: "flex-start" },
            { value: "center", label: "center" },
            { value: "flex-end", label: "flex-end" },
            { value: "baseline", label: "baseline" },
        ],
        defaultVal: "stretch",
    },
    {
        id: "align-content",
        title: "align-content",
        desc: "여러 줄(wrap) 상태일 때 교차 축(Cross Axis) 기준 라인 간격을 정렬합니다.",
        target: "container",
        options: [
            { value: "flex-start", label: "flex-start" },
            { value: "center", label: "center" },
            { value: "flex-end", label: "flex-end" },
            { value: "space-between", label: "space-between" },
            { value: "space-around", label: "space-around" },
            { value: "space-evenly", label: "space-evenly" },
            { value: "stretch", label: "stretch" },
        ],
        defaultVal: "flex-start",
    },
    {
        id: "gap",
        title: "gap (column-gap / row-gap)",
        desc: "아이템 간의 여백(간격)을 설정합니다.",
        target: "container",
        options: [
            { value: "0px", label: "0px" },
            { value: "8px", label: "8px" },
            { value: "16px", label: "16px" },
            { value: "24px", label: "24px" },
        ],
        defaultVal: "16px",
    },
];

const FLEX_CHEATSHEET_ITEMS: CheatPropItem[] = [
    {
        id: "flex-grow",
        title: "flex-grow (Item 1)",
        desc: "컨테이너 남은 여백을 아이템이 얼마나 비례하여 차지할지 결정합니다.",
        target: "item",
        options: [
            { value: "0", label: "0 (기본)" },
            { value: "1", label: "1 (동등 비율)" },
            { value: "2", label: "2 (2배 비율)" },
        ],
        defaultVal: "0",
    },
    {
        id: "flex-shrink",
        title: "flex-shrink (Item 1)",
        desc: "공간이 부족할 때 아이템이 축소되는 비율을 결정합니다.",
        target: "item",
        options: [
            { value: "1", label: "1 (축소 허용)" },
            { value: "0", label: "0 (축소 금지)" },
        ],
        defaultVal: "1",
    },
    {
        id: "align-self",
        title: "align-self (Item 2)",
        desc: "개별 아이템에 대해서만 교차 축(Cross Axis) 정렬을 재정의합니다.",
        target: "item",
        options: [
            { value: "auto", label: "auto" },
            { value: "flex-start", label: "flex-start" },
            { value: "center", label: "center" },
            { value: "flex-end", label: "flex-end" },
            { value: "stretch", label: "stretch" },
        ],
        defaultVal: "auto",
    },
    {
        id: "order",
        title: "order (Item 3)",
        desc: "시각적 배치 순서를 변경합니다 (작은 숫자가 앞으로 배치).",
        target: "item",
        options: [
            { value: "-1", label: "-1 (맨 앞)" },
            { value: "0", label: "0 (기본)" },
            { value: "1", label: "1 (맨 뒤)" },
        ],
        defaultVal: "0",
    },
];

const GRID_CHEATSHEET_CONTAINER: CheatPropItem[] = [
    {
        id: "grid-template-columns",
        title: "grid-template-columns",
        desc: "그리드의 열(Track) 트랙의 크기와 개수를 정의합니다.",
        target: "container",
        options: [
            { value: "repeat(3, 1fr)", label: "repeat(3, 1fr)" },
            { value: "1fr 2fr 1fr", label: "1fr 2fr 1fr" },
            { value: "100px 1fr 100px", label: "100px 1fr 100px" },
            { value: "repeat(auto-fit, minmax(80px, 1fr))", label: "auto-fit" },
        ],
        defaultVal: "repeat(3, 1fr)",
    },
    {
        id: "grid-template-rows",
        title: "grid-template-rows",
        desc: "그리드의 행(Track) 트랙의 높이 크기를 정의합니다.",
        target: "container",
        options: [
            { value: "repeat(2, 60px)", label: "repeat(2, 60px)" },
            { value: "50px 90px", label: "50px 90px" },
            { value: "1fr 2fr", label: "1fr 2fr" },
        ],
        defaultVal: "repeat(2, 60px)",
    },
    {
        id: "grid-auto-flow",
        title: "grid-auto-flow",
        desc: "자동 배치 알고리즘이 아이템을 채우는 방향을 지정합니다.",
        target: "container",
        options: [
            { value: "row", label: "row (기본)" },
            { value: "column", label: "column" },
            { value: "row dense", label: "row dense (빈공간 채움)" },
            { value: "column dense", label: "column dense" },
        ],
        defaultVal: "row",
    },
    {
        id: "justify-items",
        title: "justify-items",
        desc: "그리드 셀 안에서 아이템의 수평 정렬을 설정합니다.",
        target: "container",
        options: [
            { value: "stretch", label: "stretch" },
            { value: "start", label: "start" },
            { value: "center", label: "center" },
            { value: "end", label: "end" },
        ],
        defaultVal: "stretch",
    },
    {
        id: "align-items",
        title: "align-items",
        desc: "그리드 셀 안에서 아이템의 수직 정렬을 설정합니다.",
        target: "container",
        options: [
            { value: "stretch", label: "stretch" },
            { value: "start", label: "start" },
            { value: "center", label: "center" },
            { value: "end", label: "end" },
        ],
        defaultVal: "stretch",
    },
    {
        id: "justify-content",
        title: "justify-content",
        desc: "그리드 전체가 컨테이너보다 작을 때 주 축 방향 정렬을 지정합니다.",
        target: "container",
        options: [
            { value: "start", label: "start" },
            { value: "center", label: "center" },
            { value: "end", label: "end" },
            { value: "space-between", label: "space-between" },
            { value: "space-around", label: "space-around" },
            { value: "space-evenly", label: "space-evenly" },
        ],
        defaultVal: "start",
    },
    {
        id: "align-content",
        title: "align-content",
        desc: "그리드 전체 트랙들의 수직 정렬을 지정합니다.",
        target: "container",
        options: [
            { value: "start", label: "start" },
            { value: "center", label: "center" },
            { value: "end", label: "end" },
            { value: "space-between", label: "space-between" },
            { value: "space-around", label: "space-around" },
            { value: "space-evenly", label: "space-evenly" },
        ],
        defaultVal: "start",
    },
    {
        id: "gap",
        title: "gap",
        desc: "행(row)과 열(column) 사이의 간격을 지정합니다.",
        target: "container",
        options: [
            { value: "8px", label: "8px" },
            { value: "16px", label: "16px" },
            { value: "24px", label: "24px" },
        ],
        defaultVal: "16px",
    },
];

const GRID_CHEATSHEET_ITEMS: CheatPropItem[] = [
    {
        id: "grid-column",
        title: "grid-column (Item 1)",
        desc: "아이템이 차지할 열 트랙 영역의 시작과 끝(span)을 지정합니다.",
        target: "item",
        options: [
            { value: "span 1", label: "span 1" },
            { value: "span 2", label: "span 2" },
            { value: "1 / -1", label: "1 / -1 (전체 너비)" },
        ],
        defaultVal: "span 1",
    },
    {
        id: "grid-row",
        title: "grid-row (Item 1)",
        desc: "아이템이 차지할 행 트랙 영역의 스팬 높이를 지정합니다.",
        target: "item",
        options: [
            { value: "span 1", label: "span 1" },
            { value: "span 2", label: "span 2" },
        ],
        defaultVal: "span 1",
    },
    {
        id: "justify-self",
        title: "justify-self (Item 2)",
        desc: "개별 아이템에 대해 그리드 셀 안의 수평 정렬을 재정의합니다.",
        target: "item",
        options: [
            { value: "auto", label: "auto" },
            { value: "start", label: "start" },
            { value: "center", label: "center" },
            { value: "end", label: "end" },
            { value: "stretch", label: "stretch" },
        ],
        defaultVal: "auto",
    },
    {
        id: "align-self",
        title: "align-self (Item 2)",
        desc: "개별 아이템에 대해 그리드 셀 안의 수직 정렬을 재정의합니다.",
        target: "item",
        options: [
            { value: "auto", label: "auto" },
            { value: "start", label: "start" },
            { value: "center", label: "center" },
            { value: "end", label: "end" },
            { value: "stretch", label: "stretch" },
        ],
        defaultVal: "auto",
    },
];

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function FlexGridEditorPage() {
    const { toast } = useToast();
    const [mainTab, setMainTab] = useState<MainTab>("flex-cheatsheet");
    const [searchQuery, setSearchQuery] = useState("");

    // Playground state
    const [mode, setMode] = useState<Mode>("flex");
    const [flex, setFlex] = useState<FlexCfg>({ ...DEFAULT_FLEX });
    const [grid, setGrid] = useState<GridCfg>({ ...DEFAULT_GRID });
    const [itemCount, setItemCount] = useState(5);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [showAxisGuide, setShowAxisGuide] = useState(true);
    const [items, setItems] = useState<ItemProp[]>(
        Array.from({ length: 8 }, (_, i) => ({ ...DEFAULT_ITEM, id: i }))
    );
    const [codeTab, setCodeTab] = useState<"css" | "html" | "tailwind">("css");
    const [copied, setCopied] = useState(false);

    // Callbacks for updating state
    const updateFlex = useCallback(<K extends keyof FlexCfg>(k: K, v: FlexCfg[K]) =>
        setFlex(p => ({ ...p, [k]: v })), []);

    const updateGrid = useCallback(<K extends keyof GridCfg>(k: K, v: GridCfg[K]) =>
        setGrid(p => ({ ...p, [k]: v })), []);

    const updateItem = useCallback(<K extends keyof ItemProp>(id: number, k: K, v: ItemProp[K]) =>
        setItems(prev => prev.map(it => it.id === id ? { ...it, [k]: v } : it)), []);

    const selectedItem = useMemo(() => items.find(it => it.id === selectedId) ?? null, [items, selectedId]);

    // Playground styles & codes
    const containerStyle = useMemo(() => {
        const base = {
            padding: `${mode === "flex" ? flex.pt : grid.pt}px ${mode === "flex" ? flex.pr : grid.pr}px ${mode === "flex" ? flex.pb : grid.pb}px ${mode === "flex" ? flex.pl : grid.pl}px`
        };
        if (mode === "flex") return {
            ...base,
            display: "flex",
            flexDirection: flex.direction,
            justifyContent: flex.justifyContent,
            alignItems: flex.alignItems,
            alignContent: flex.alignContent,
            flexWrap: flex.wrap,
            columnGap: `${flex.colGap}px`,
            rowGap: `${flex.rowGap}px`,
        };
        return {
            ...base,
            display: "grid",
            gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${grid.rows}, minmax(${grid.autoRows}px, auto))`,
            columnGap: `${grid.colGap}px`,
            rowGap: `${grid.rowGap}px`,
            justifyItems: grid.justifyItems,
            alignItems: grid.alignItems,
            justifyContent: grid.justifyContent,
            alignContent: grid.alignContent,
        };
    }, [mode, flex, grid]);

    const cssCode = useMemo(() => {
        if (mode === "flex") {
            const lines = [
                `.container {`,
                `  display: flex;`,
                flex.direction !== "row" ? `  flex-direction: ${flex.direction};` : null,
                `  justify-content: ${flex.justifyContent};`,
                `  align-items: ${flex.alignItems};`,
                flex.wrap !== "nowrap" ? `  flex-wrap: ${flex.wrap};` : null,
                flex.alignContent !== "flex-start" ? `  align-content: ${flex.alignContent};` : null,
                flex.colGap === flex.rowGap
                    ? `  gap: ${flex.colGap}px;`
                    : `  column-gap: ${flex.colGap}px;\n  row-gap: ${flex.rowGap}px;`,
                (flex.pt === flex.pr && flex.pr === flex.pb && flex.pb === flex.pl)
                    ? `  padding: ${flex.pt}px;`
                    : `  padding: ${flex.pt}px ${flex.pr}px ${flex.pb}px ${flex.pl}px;`,
                `}`,
            ];
            return lines.filter(Boolean).join("\n");
        }
        const lines = [
            `.container {`,
            `  display: grid;`,
            `  grid-template-columns: repeat(${grid.cols}, 1fr);`,
            grid.colGap === grid.rowGap
                ? `  gap: ${grid.colGap}px;`
                : `  column-gap: ${grid.colGap}px;\n  row-gap: ${grid.rowGap}px;`,
            grid.justifyItems !== "stretch" ? `  justify-items: ${grid.justifyItems};` : null,
            grid.alignItems !== "stretch" ? `  align-items: ${grid.alignItems};` : null,
            grid.justifyContent !== "start" ? `  justify-content: ${grid.justifyContent};` : null,
            grid.alignContent !== "start" ? `  align-content: ${grid.alignContent};` : null,
            (grid.pt === grid.pr && grid.pr === grid.pb && grid.pb === grid.pl)
                ? `  padding: ${grid.pt}px;`
                : `  padding: ${grid.pt}px ${grid.pr}px ${grid.pb}px ${grid.pl}px;`,
            `}`,
        ];
        return lines.filter(Boolean).join("\n");
    }, [mode, flex, grid]);

    const htmlCode = useMemo(() => {
        const itemsHtml = Array.from({ length: itemCount }, (_, i) => {
            const it = items[i];
            if (!it) return `  <div class="item">Item ${i + 1}</div>`;
            const hasCustom = mode === "flex"
                ? it.grow !== 0 || it.shrink !== 1 || it.basis !== "auto" || it.alignSelf !== "auto" || it.order !== 0
                : it.colSpan !== 1 || it.rowSpan !== 1;
            if (!hasCustom) return `  <div class="item">Item ${i + 1}</div>`;
            const styleFrags: string[] = [];
            if (mode === "flex") {
                if (it.grow !== 0 || it.shrink !== 1 || it.basis !== "auto")
                    styleFrags.push(`flex: ${it.grow} ${it.shrink} ${it.basis}`);
                if (it.alignSelf !== "auto") styleFrags.push(`align-self: ${it.alignSelf}`);
                if (it.order !== 0) styleFrags.push(`order: ${it.order}`);
            } else {
                if (it.colSpan > 1) styleFrags.push(`grid-column: span ${it.colSpan}`);
                if (it.rowSpan > 1) styleFrags.push(`grid-row: span ${it.rowSpan}`);
            }
            return `  <div class="item" style="${styleFrags.join("; ")}">Item ${i + 1}</div>`;
        });
        return `<div class="container">\n${itemsHtml.join("\n")}\n</div>`;
    }, [mode, items, itemCount]);

    const tailwindCode = useMemo(() => {
        if (mode === "flex") {
            const gapClass = flex.colGap === flex.rowGap ? `gap-[${flex.colGap}px]` : `gap-x-[${flex.colGap}px] gap-y-[${flex.rowGap}px]`;
            const padClass = flex.pt === flex.pr && flex.pr === flex.pb && flex.pb === flex.pl
                ? `p-[${flex.pt}px]`
                : `pt-[${flex.pt}px] pr-[${flex.pr}px] pb-[${flex.pb}px] pl-[${flex.pl}px]`;
            const classes = [
                "flex", FD_TW[flex.direction] !== "flex-row" ? FD_TW[flex.direction] : null,
                JC_TW[flex.justifyContent], AI_TW[flex.alignItems],
                flex.wrap !== "nowrap" ? FW_TW[flex.wrap] : null,
                gapClass, padClass,
            ].filter(Boolean);
            return `<div class="${classes.join(" ")}">\n  <div class="item">Item 1</div>\n  <!-- ... -->\n</div>`;
        }
        const gapClass = grid.colGap === grid.rowGap ? `gap-[${grid.colGap}px]` : `gap-x-[${grid.colGap}px] gap-y-[${grid.rowGap}px]`;
        const padClass = grid.pt === grid.pr && grid.pr === grid.pb && grid.pb === grid.pl
            ? `p-[${grid.pt}px]`
            : `pt-[${grid.pt}px] pr-[${grid.pr}px] pb-[${grid.pb}px] pl-[${flex.pl}px]`;
        const classes = [
            "grid", `grid-cols-${grid.cols}`, gapClass, padClass,
            grid.justifyItems !== "stretch" ? JI_TW[grid.justifyItems] : null,
            grid.alignContent !== "start" ? AC_TW[grid.alignContent] : null,
        ].filter(Boolean);
        return `<div class="${classes.join(" ")}">\n  <div>Item 1</div>\n  <!-- ... -->\n</div>`;
    }, [mode, flex, grid]);

    const activeCode = codeTab === "css" ? cssCode : codeTab === "html" ? htmlCode : tailwindCode;

    const handleCopy = async (codeToCopy?: string) => {
        await navigator.clipboard.writeText(codeToCopy || activeCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
        toast("코드가 클립보드에 복사되었습니다!", "success");
    };

    const resetPlayground = () => {
        if (mode === "flex") setFlex({ ...DEFAULT_FLEX });
        else setGrid({ ...DEFAULT_GRID });
        setSelectedId(null);
        setItems(Array.from({ length: 8 }, (_, i) => ({ ...DEFAULT_ITEM, id: i })));
        toast("설정이 초기화되었습니다.", "success");
    };

    return (
        <div className="space-y-6 pb-12">
            <PageHeader
                title="Flexbox · Grid 시각 치트시트 & 인터랙티브 에디터"
                description="flexngrid 스타일의 시각적 치트시트로 모든 CSS 레이아웃 속성을 쉽게 익히고 실시간 인터랙티브 에디터에서 즉시 코드를 생성하세요."
            />

            {/* ── Top Main Nav Tabs ────────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1.5 rounded-2xl shadow-sm">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setMainTab("flex-cheatsheet")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                            mainTab === "flex-cheatsheet"
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        )}
                    >
                        <Sparkles className="w-4 h-4" /> Flex Cheatsheet
                    </button>
                    <button
                        onClick={() => setMainTab("grid-cheatsheet")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                            mainTab === "grid-cheatsheet"
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        )}
                    >
                        <LayoutGrid className="w-4 h-4" /> Grid Cheatsheet
                    </button>
                    <button
                        onClick={() => setMainTab("playground")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                            mainTab === "playground"
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        )}
                    >
                        <Box className="w-4 h-4" /> Visual Playground
                    </button>
                </div>

                {/* Search filter for cheatsheet tabs */}
                {mainTab !== "playground" && (
                    <div className="relative min-w-[200px] px-2">
                        <Search className="w-3.5 h-3.5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="속성 검색 (예: justify, wrap...)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                )}
            </div>

            {/* ══ TAB 1: FLEX CHEATSHEET ════════════════════════════════════════ */}
            {mainTab === "flex-cheatsheet" && (
                <CheatsheetView
                    type="flex"
                    containerItems={FLEX_CHEATSHEET_CONTAINER}
                    itemItems={FLEX_CHEATSHEET_ITEMS}
                    query={searchQuery}
                    onCopyCode={handleCopy}
                />
            )}

            {/* ══ TAB 2: GRID CHEATSHEET ════════════════════════════════════════ */}
            {mainTab === "grid-cheatsheet" && (
                <CheatsheetView
                    type="grid"
                    containerItems={GRID_CHEATSHEET_CONTAINER}
                    itemItems={GRID_CHEATSHEET_ITEMS}
                    query={searchQuery}
                    onCopyCode={handleCopy}
                />
            )}

            {/* ══ TAB 3: VISUAL PLAYGROUND ══════════════════════════════════════ */}
            {mainTab === "playground" && (
                <div className="grid grid-cols-1 xl:grid-cols-[310px_1fr_310px] gap-5 items-start">
                    {/* Left: Controls Panel */}
                    <aside className="xl:sticky xl:top-24 space-y-2">
                        <div className="glass-card rounded-2xl px-4 py-3 flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">모드</span>
                            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl gap-1">
                                {(["flex", "grid"] as Mode[]).map(m => (
                                    <button key={m} onClick={() => setMode(m)}
                                        className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                                            mode === m
                                                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                                                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800"
                                        )}>
                                        {m === "flex" ? "Flexbox" : "Grid"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Alignment Section */}
                        <PanelSection title="정렬 (Alignment)">
                            {mode === "flex" ? (
                                <FlexAlignPanel flex={flex} updateFlex={updateFlex} />
                            ) : (
                                <GridAlignPanel grid={grid} updateGrid={updateGrid} />
                            )}
                        </PanelSection>

                        {/* Layout Section */}
                        <PanelSection title="레이아웃 & 간격">
                            {mode === "flex" ? (
                                <FlexLayoutPanel flex={flex} updateFlex={updateFlex} />
                            ) : (
                                <GridLayoutPanel grid={grid} updateGrid={updateGrid} />
                            )}
                        </PanelSection>

                        {/* Selected Item Section */}
                        {selectedItem && (
                            <PanelSection title={`선택된 아이템 #${selectedItem.id + 1} 속성`}>
                                <ItemPanel
                                    mode={mode}
                                    item={selectedItem}
                                    onUpdate={(k, v) => updateItem(selectedItem.id, k, v)}
                                />
                            </PanelSection>
                        )}

                        <button onClick={resetPlayground}
                            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300">
                            <RefreshCw className="w-3.5 h-3.5" /> 초기화
                        </button>
                    </aside>

                    {/* Center: Live Canvas */}
                    <div className="space-y-3">
                        <div className="glass-card rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            {/* Canvas Toolbar */}
                            <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 gap-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                                        <Eye className="w-3.5 h-3.5 text-indigo-500" /> 실시간 캔버스
                                    </span>
                                    {mode === "flex" && (
                                        <button
                                            onClick={() => setShowAxisGuide(v => !v)}
                                            className={cn(
                                                "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 border",
                                                showAxisGuide
                                                    ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/30"
                                                    : "text-zinc-400 border-zinc-200 dark:border-zinc-800"
                                            )}
                                        >
                                            축 가이드 표시 {showAxisGuide ? "ON" : "OFF"}
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-zinc-400">아이템 수</span>
                                    <div className="flex items-center gap-1 bg-zinc-200/60 dark:bg-zinc-800 rounded-lg p-0.5">
                                        <button onClick={() => setItemCount(c => Math.max(1, c - 1))}
                                            className="w-5 h-5 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 rounded">
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="text-xs font-bold min-w-[20px] text-center">{itemCount}</span>
                                        <button onClick={() => setItemCount(c => Math.min(items.length, c + 1))}
                                            className="w-5 h-5 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 rounded">
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Main Canvas View */}
                            <div className="p-4 min-h-[420px] relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px]">
                                {/* Axis Overlay Guide */}
                                {mode === "flex" && showAxisGuide && (
                                    <div className="absolute inset-2 pointer-events-none z-10 flex flex-col justify-between p-2">
                                        <div className="flex items-center gap-1 text-[10px] font-mono text-indigo-500 font-bold bg-indigo-500/10 backdrop-blur px-2 py-0.5 rounded border border-indigo-500/20 w-fit">
                                            {flex.direction.includes("row") ? <ArrowRight className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                            Main Axis: {flex.direction}
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] font-mono text-pink-500 font-bold bg-pink-500/10 backdrop-blur px-2 py-0.5 rounded border border-pink-500/20 w-fit self-end">
                                            Cross Axis: {flex.direction.includes("row") ? "vertical" : "horizontal"}
                                        </div>
                                    </div>
                                )}

                                <div
                                    className="min-h-[360px] rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80 transition-all overflow-auto"
                                    style={containerStyle as React.CSSProperties}
                                >
                                    {Array.from({ length: itemCount }, (_, i) => {
                                        const it = items[i] ?? items[0];
                                        const pal = ITEM_PALETTE[i % ITEM_PALETTE.length];
                                        const isSelected = selectedId === it.id;
                                        const itemStyle: React.CSSProperties = mode === "flex"
                                            ? {
                                                flexGrow: it.grow, flexShrink: it.shrink,
                                                flexBasis: it.basis, order: it.order,
                                                alignSelf: it.alignSelf === "auto" ? undefined : it.alignSelf,
                                            }
                                            : {
                                                gridColumn: it.colSpan > 1 ? `span ${it.colSpan}` : undefined,
                                                gridRow: it.rowSpan > 1 ? `span ${it.rowSpan}` : undefined,
                                            };
                                        return (
                                            <div
                                                key={it.id}
                                                onClick={() => setSelectedId(isSelected ? null : it.id)}
                                                className={cn(
                                                    "rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all select-none min-h-[70px] min-w-[70px] p-3 shadow-sm",
                                                    pal.bg, pal.border, pal.text,
                                                    isSelected && `ring-2 ring-offset-2 dark:ring-offset-zinc-900 ${pal.ring} scale-[1.02] shadow-md`,
                                                    "hover:brightness-105 active:scale-95"
                                                )}
                                                style={itemStyle}
                                            >
                                                <span className="text-xs font-black">Item {i + 1}</span>
                                                {isSelected && <span className="text-[9px] font-semibold opacity-70 mt-0.5">선택됨</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Active Properties Badges */}
                        <div className="flex flex-wrap gap-1.5">
                            {mode === "flex" ? (
                                <>
                                    <PropBadge label="dir" value={flex.direction} />
                                    <PropBadge label="justify" value={flex.justifyContent} />
                                    <PropBadge label="align" value={flex.alignItems} />
                                    <PropBadge label="wrap" value={flex.wrap} />
                                    <PropBadge label="gap" value={`${flex.colGap}×${flex.rowGap}px`} />
                                </>
                            ) : (
                                <>
                                    <PropBadge label="cols" value={`${grid.cols} cols`} />
                                    <PropBadge label="gap" value={`${grid.colGap}×${grid.rowGap}px`} />
                                    <PropBadge label="justify-items" value={grid.justifyItems} />
                                    <PropBadge label="align-items" value={grid.alignItems} />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right: Code Generator Output */}
                    <div className="xl:sticky xl:top-24 glass-card rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
                            <div className="flex gap-1 bg-zinc-200/60 dark:bg-zinc-800 p-0.5 rounded-xl">
                                {(["css", "html", "tailwind"] as const).map(t => (
                                    <button key={t} onClick={() => setCodeTab(t)}
                                        className={cn("px-3 py-1 rounded-lg text-[11px] font-bold transition-all",
                                            codeTab === t
                                                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                                                : "text-zinc-500 hover:text-zinc-800"
                                        )}>
                                        {t.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => handleCopy()}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95",
                                    copied
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                        : "bg-indigo-600 text-white hover:bg-indigo-500"
                                )}>
                                {copied ? <><Check className="w-3.5 h-3.5" /> 복사됨</> : <><Copy className="w-3.5 h-3.5" /> 복사</>}
                            </button>
                        </div>

                        <pre className="p-4 text-[11px] font-mono leading-relaxed overflow-x-auto bg-zinc-950 text-emerald-400 max-h-[500px] min-h-[220px]">
                            <code>{activeCode}</code>
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── CHEATSHEET VIEW COMPONENT ─────────────────────────────────────────────────

function CheatsheetView({
    type,
    containerItems,
    itemItems,
    query,
    onCopyCode
}: {
    type: "flex" | "grid";
    containerItems: CheatPropItem[];
    itemItems: CheatPropItem[];
    query: string;
    onCopyCode: (code: string) => void;
}) {
    const filterFn = (item: CheatPropItem) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.desc.toLowerCase().includes(query.toLowerCase());

    const filteredContainer = containerItems.filter(filterFn);
    const filteredItem = itemItems.filter(filterFn);

    return (
        <div className="space-y-8">
            {/* Section 1: Container Properties */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                    <LayoutGrid className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                        Container 속성 ({type === "flex" ? "Flex Container" : "Grid Container"})
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredContainer.map(item => (
                        <CheatsheetCard key={item.id} item={item} type={type} onCopyCode={onCopyCode} />
                    ))}
                </div>
            </div>

            {/* Section 2: Item Properties */}
            <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                    <Box className="w-5 h-5 text-pink-500" />
                    <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                        Item 속성 ({type === "flex" ? "Flex Item" : "Grid Item"})
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredItem.map(item => (
                        <CheatsheetCard key={item.id} item={item} type={type} onCopyCode={onCopyCode} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── CHEATSHEET CARD COMPONENT ─────────────────────────────────────────────────

function CheatsheetCard({
    item,
    type,
    onCopyCode
}: {
    item: CheatPropItem;
    type: "flex" | "grid";
    onCopyCode: (code: string) => void;
}) {
    const [selectedVal, setSelectedVal] = useState(item.defaultVal);

    // Compute live preview CSS style for container or item
    const containerPreviewStyle: React.CSSProperties = useMemo(() => {
        if (item.target === "container") {
            if (type === "flex") {
                const base: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: "8px" };
                if (item.id === "flex-direction") base.flexDirection = selectedVal as FlexDir;
                if (item.id === "flex-wrap") base.flexWrap = selectedVal as FWValue;
                if (item.id === "justify-content") base.justifyContent = selectedVal as JCValue;
                if (item.id === "align-items") base.alignItems = selectedVal as AIValue;
                if (item.id === "align-content") {
                    base.alignContent = selectedVal as ACValue;
                    base.height = "160px";
                    base.flexWrap = "wrap";
                }
                if (item.id === "gap") base.gap = selectedVal;
                return base;
            } else {
                const base: React.CSSProperties = { display: "grid", gap: "8px" };
                if (item.id === "grid-template-columns") base.gridTemplateColumns = selectedVal;
                if (item.id === "grid-template-rows") {
                    base.gridTemplateRows = selectedVal;
                    base.gridTemplateColumns = "repeat(3, 1fr)";
                    base.height = "150px";
                }
                if (item.id === "grid-auto-flow") {
                    base.gridAutoFlow = selectedVal;
                    base.gridTemplateColumns = "repeat(3, 1fr)";
                }
                if (item.id === "justify-items") base.justifyItems = selectedVal;
                if (item.id === "align-items") {
                    base.alignItems = selectedVal;
                    base.gridTemplateColumns = "repeat(3, 1fr)";
                    base.height = "130px";
                }
                if (item.id === "justify-content") {
                    base.justifyContent = selectedVal;
                    base.gridTemplateColumns = "repeat(2, 60px)";
                }
                if (item.id === "align-content") {
                    base.alignContent = selectedVal;
                    base.gridTemplateColumns = "repeat(2, 1fr)";
                    base.height = "140px";
                }
                if (item.id === "gap") {
                    base.gap = selectedVal;
                    base.gridTemplateColumns = "repeat(3, 1fr)";
                }
                return base;
            }
        }
        return type === "flex" ? { display: "flex", gap: "8px", minHeight: "110px" } : { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" };
    }, [item, selectedVal, type]);

    const generatedCss = `.container {\n  display: ${type};\n  ${item.id}: ${selectedVal};\n}`;

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
            <div>
                {/* Card Header */}
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                            {item.title}
                        </h3>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                            {item.desc}
                        </p>
                    </div>
                </div>

                {/* Option Selector Buttons */}
                <div className="p-3 bg-zinc-100/50 dark:bg-zinc-950/40 border-b border-zinc-100 dark:border-zinc-800 flex flex-wrap gap-1">
                    {item.options.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setSelectedVal(opt.value)}
                            className={cn(
                                "px-2.5 py-1 rounded-lg text-xs font-mono transition-all border",
                                selectedVal === opt.value
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm font-bold"
                                    : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400"
                            )}
                        >
                            {opt.label || opt.value}
                        </button>
                    ))}
                </div>

                {/* Live Preview Box */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-950/60 min-h-[140px] flex items-center justify-center">
                    <div
                        className="w-full min-h-[110px] rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 p-3"
                        style={containerPreviewStyle}
                    >
                        {Array.from({ length: 4 }).map((_, idx) => {
                            const isTargetItem = (item.id.includes("Item 1") && idx === 0) ||
                                                 (item.id.includes("Item 2") && idx === 1) ||
                                                 (item.id.includes("Item 3") && idx === 2);

                            let itemStyle: React.CSSProperties = {};
                            if (item.target === "item" && isTargetItem) {
                                if (item.id === "flex-grow") itemStyle.flexGrow = Number(selectedVal);
                                if (item.id === "flex-shrink") itemStyle.flexShrink = Number(selectedVal);
                                if (item.id === "align-self") itemStyle.alignSelf = selectedVal;
                                if (item.id === "justify-self") itemStyle.justifySelf = selectedVal;
                                if (item.id === "order") itemStyle.order = Number(selectedVal);
                                if (item.id === "grid-column") itemStyle.gridColumn = selectedVal;
                                if (item.id === "grid-row") itemStyle.gridRow = selectedVal;
                            }

                            const pal = ITEM_PALETTE[idx % ITEM_PALETTE.length];
                            return (
                                <div
                                    key={idx}
                                    style={itemStyle}
                                    className={cn(
                                        "rounded-lg border text-xs font-bold font-mono flex items-center justify-center p-2 min-h-[36px] min-w-[36px] transition-all",
                                        pal.bg, pal.border, pal.text,
                                        isTargetItem && "ring-2 ring-indigo-500 scale-105 shadow-md"
                                    )}
                                >
                                    {idx + 1}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Generated Code Footer */}
            <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-900 text-zinc-100 flex items-center justify-between">
                <code className="text-[11px] font-mono text-emerald-400 truncate max-w-[80%]">
                    {item.id}: {selectedVal};
                </code>
                <button
                    onClick={() => onCopyCode(generatedCss)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                    title="CSS 코드 복사"
                >
                    <Copy className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}

// ─── HELPER COMPONENTS ─────────────────────────────────────────────────────────

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(true);
    return (
        <div className="glass-card rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
            >
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{title}</span>
                <ChevronDown className={cn("w-3.5 h-3.5 text-zinc-400 transition-transform duration-200", open ? "rotate-0" : "-rotate-90")} />
            </button>
            {open && <div className="p-3 space-y-3 border-t border-zinc-100 dark:border-zinc-800">{children}</div>}
        </div>
    );
}

function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{label}</label>
            {children}
        </div>
    );
}

function IconGroup({ children }: { children: React.ReactNode }) {
    return <div className="flex flex-wrap gap-1 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl">{children}</div>;
}

function IconBtn({ active, title, onClick, children }: { active: boolean; title: string; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            title={title}
            className={cn(
                "p-1.5 rounded-lg transition-all flex items-center justify-center min-w-[32px] min-h-[32px]",
                active
                    ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-sm font-bold"
                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            )}
        >
            {children}
        </button>
    );
}

function PropBadge({ label, value }: { label: string; value: string }) {
    return (
        <div className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-mono text-zinc-600 dark:text-zinc-300">
            <span className="opacity-50">{label}:</span> <span className="font-bold text-indigo-600 dark:text-indigo-400">{value}</span>
        </div>
    );
}

function NumInput({ label, unit, value, min, max, onChange }: { label: string; unit?: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 font-bold">{label}</label>
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-950 rounded-xl p-1 border border-zinc-200 dark:border-zinc-800">
                <input
                    type="number"
                    min={min}
                    max={max}
                    value={value}
                    onChange={e => onChange(Number(e.target.value))}
                    className="w-full text-center text-xs font-bold bg-transparent border-none text-zinc-800 dark:text-zinc-200 focus:outline-none"
                />
                {unit && <span className="text-[10px] text-zinc-400 pr-1">{unit}</span>}
            </div>
        </div>
    );
}

function PaddingInputs({ pt, pr, pb, pl, onChange }: { pt: number; pr: number; pb: number; pl: number; onChange: (k: string, v: number) => void }) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 font-bold">padding (top, right, bottom, left)</label>
            <div className="grid grid-cols-4 gap-1">
                {(["pt", "pr", "pb", "pl"] as const).map((k) => (
                    <input
                        key={k}
                        type="number"
                        min={0}
                        max={100}
                        value={k === "pt" ? pt : k === "pr" ? pr : k === "pb" ? pb : pl}
                        onChange={e => onChange(k, Number(e.target.value))}
                        className="w-full text-center text-xs font-mono bg-zinc-100 dark:bg-zinc-950 rounded-lg py-1 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200"
                    />
                ))}
            </div>
        </div>
    );
}

// ─── CONTROL PANELS FOR PLAYGROUND ──────────────────────────────────────────────

function FlexAlignPanel({ flex, updateFlex }: { flex: FlexCfg; updateFlex: (k: keyof FlexCfg, v: FlexCfg[keyof FlexCfg]) => void }) {
    return (
        <div className="space-y-2.5">
            <PropRow label="justify-content">
                <IconGroup>
                    {[
                        { v: "flex-start", ic: <IcJStart />, label: "flex-start" },
                        { v: "center", ic: <IcJCenter />, label: "center" },
                        { v: "flex-end", ic: <IcJEnd />, label: "flex-end" },
                        { v: "space-between", ic: <IcJBetween />, label: "space-between" },
                        { v: "space-around", ic: <IcJAround />, label: "space-around" },
                        { v: "space-evenly", ic: <IcJEvenly />, label: "space-evenly" },
                    ].map(o => (
                        <IconBtn key={o.v} active={flex.justifyContent === o.v} title={o.label} onClick={() => updateFlex("justifyContent", o.v as JCValue)}>{o.ic}</IconBtn>
                    ))}
                </IconGroup>
            </PropRow>
            <PropRow label="align-items">
                <IconGroup>
                    {[
                        { v: "stretch", ic: <IcAStretch />, label: "stretch" },
                        { v: "flex-start", ic: <IcAStart />, label: "flex-start" },
                        { v: "center", ic: <IcACenter />, label: "center" },
                        { v: "flex-end", ic: <IcAEnd />, label: "flex-end" },
                        { v: "baseline", ic: <IcABaseline />, label: "baseline" },
                    ].map(o => (
                        <IconBtn key={o.v} active={flex.alignItems === o.v} title={o.label} onClick={() => updateFlex("alignItems", o.v as AIValue)}>{o.ic}</IconBtn>
                    ))}
                </IconGroup>
            </PropRow>
        </div>
    );
}

function GridAlignPanel({ grid, updateGrid }: { grid: GridCfg; updateGrid: (k: keyof GridCfg, v: GridCfg[keyof GridCfg]) => void }) {
    return (
        <div className="space-y-2.5">
            <PropRow label="justify-items">
                <IconGroup>
                    {[
                        { v: "stretch", ic: <IcAStretch />, label: "stretch" },
                        { v: "start", ic: <IcGJStart />, label: "start" },
                        { v: "center", ic: <IcGJCenter />, label: "center" },
                        { v: "end", ic: <IcGJEnd />, label: "end" },
                    ].map(o => (
                        <IconBtn key={o.v} active={grid.justifyItems === o.v} title={o.label} onClick={() => updateGrid("justifyItems", o.v as any)}>{o.ic}</IconBtn>
                    ))}
                </IconGroup>
            </PropRow>
            <PropRow label="align-items">
                <IconGroup>
                    {[
                        { v: "stretch", ic: <IcAStretch />, label: "stretch" },
                        { v: "start", ic: <IcGAStart />, label: "start" },
                        { v: "center", ic: <IcGACenter />, label: "center" },
                        { v: "end", ic: <IcGAEnd />, label: "end" },
                    ].map(o => (
                        <IconBtn key={o.v} active={grid.alignItems === o.v} title={o.label} onClick={() => updateGrid("alignItems", o.v as any)}>{o.ic}</IconBtn>
                    ))}
                </IconGroup>
            </PropRow>
        </div>
    );
}

function FlexLayoutPanel({ flex, updateFlex }: { flex: FlexCfg; updateFlex: (k: keyof FlexCfg, v: FlexCfg[keyof FlexCfg]) => void }) {
    return (
        <div className="space-y-2.5">
            <PropRow label="flex-direction">
                <IconGroup>
                    {[
                        { v: "row", ic: <IcRow />, label: "row" },
                        { v: "row-reverse", ic: <IcRowRev />, label: "row-reverse" },
                        { v: "column", ic: <IcCol />, label: "column" },
                        { v: "column-reverse", ic: <IcColRev />, label: "column-reverse" },
                    ].map(o => (
                        <IconBtn key={o.v} active={flex.direction === o.v} title={o.label} onClick={() => updateFlex("direction", o.v as FlexDir)}>{o.ic}</IconBtn>
                    ))}
                </IconGroup>
            </PropRow>
            <PropRow label="flex-wrap">
                <IconGroup>
                    {[
                        { v: "nowrap", ic: <IcNowrap />, label: "nowrap" },
                        { v: "wrap", ic: <IcWrap />, label: "wrap" },
                        { v: "wrap-reverse", ic: <IcWrapRev />, label: "wrap-reverse" },
                    ].map(o => (
                        <IconBtn key={o.v} active={flex.wrap === o.v} title={o.label} onClick={() => updateFlex("wrap", o.v as FWValue)}>{o.ic}</IconBtn>
                    ))}
                </IconGroup>
            </PropRow>
            <div className="grid grid-cols-2 gap-2">
                <NumInput label="col-gap" unit="px" value={flex.colGap} min={0} max={80} onChange={v => updateFlex("colGap", v)} />
                <NumInput label="row-gap" unit="px" value={flex.rowGap} min={0} max={80} onChange={v => updateFlex("rowGap", v)} />
            </div>
            <PaddingInputs pt={flex.pt} pr={flex.pr} pb={flex.pb} pl={flex.pl} onChange={(k, v) => updateFlex(k as keyof FlexCfg, v)} />
        </div>
    );
}

function GridLayoutPanel({ grid, updateGrid }: { grid: GridCfg; updateGrid: (k: keyof GridCfg, v: GridCfg[keyof GridCfg]) => void }) {
    return (
        <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
                <NumInput label="columns" unit="cols" value={grid.cols} min={1} max={12} onChange={v => updateGrid("cols", v)} />
                <NumInput label="rows" unit="rows" value={grid.rows} min={1} max={12} onChange={v => updateGrid("rows", v)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <NumInput label="col-gap" unit="px" value={grid.colGap} min={0} max={80} onChange={v => updateGrid("colGap", v)} />
                <NumInput label="row-gap" unit="px" value={grid.rowGap} min={0} max={80} onChange={v => updateGrid("rowGap", v)} />
            </div>
            <PaddingInputs pt={grid.pt} pr={grid.pr} pb={grid.pb} pl={grid.pl} onChange={(k, v) => updateGrid(k as keyof GridCfg, v)} />
        </div>
    );
}

function ItemPanel({ mode, item, onUpdate }: { mode: Mode; item: ItemProp; onUpdate: (k: keyof ItemProp, v: ItemProp[keyof ItemProp]) => void }) {
    if (mode === "flex") return (
        <div className="space-y-2.5">
            <div className="grid grid-cols-3 gap-2">
                <NumInput label="grow" value={item.grow} min={0} max={10} onChange={v => onUpdate("grow", v)} />
                <NumInput label="shrink" value={item.shrink} min={0} max={10} onChange={v => onUpdate("shrink", v)} />
                <NumInput label="order" value={item.order} min={-5} max={10} onChange={v => onUpdate("order", v)} />
            </div>
            <PropRow label="align-self">
                <div className="flex flex-wrap gap-1">
                    {[
                        { v: "auto", label: "auto" }, { v: "flex-start", label: "start" },
                        { v: "center", label: "center" }, { v: "flex-end", label: "end" },
                        { v: "stretch", label: "stretch" },
                    ].map(o => (
                        <button
                            key={o.v}
                            onClick={() => onUpdate("alignSelf", o.v as any)}
                            className={cn(
                                "px-2 py-1 rounded-lg text-xs font-mono transition-all border",
                                item.alignSelf === o.v
                                    ? "bg-indigo-600 text-white font-bold border-indigo-600"
                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
                            )}
                        >
                            {o.label}
                        </button>
                    ))}
                </div>
            </PropRow>
        </div>
    );

    return (
        <div className="grid grid-cols-2 gap-2">
            <NumInput label="col-span" value={item.colSpan} min={1} max={12} onChange={v => onUpdate("colSpan", v)} />
            <NumInput label="row-span" value={item.rowSpan} min={1} max={12} onChange={v => onUpdate("rowSpan", v)} />
        </div>
    );
}
