# WebTools UI/UX 디자인 시스템 규격서 (`ui-ux-system.md`)

본 문서는 WebTools 프로젝트의 시각적 정체성, UI/UX 설계 원칙, Glassmorphism 스타일 가이드, 컴포넌트 아키텍처, 애니메이션 규격 및 웹 접근성(A11y) 기준을 정의한 종합 디자인 시스템 규격서입니다.

---

## 📑 목차 (Table of Contents)
1. [디자인 철학 및 핵심 컨셉](#1-디자인-철학-및-핵심-컨셉)
2. [디자인 토큰 시스템 (Design Tokens)](#2-디자인-토큰-시스템-design-tokens)
3. [Glassmorphism 레이어링 & 유틸리티](#3-glassmorphism-레이어링--유틸리티)
4. [레이아웃 & 스마트 탭 아키텍처](#4-레이아웃--스마트-탭-아키텍처)
5. [반응형 UI & 모바일 UX 전략](#5-반응형-ui--모바일-ux-전략)
6. [컴포넌트 패턴 & 상세 코드 주석 예시](#6-컴포넌트-패턴--상세-코드-주석-예시)
7. [모션 & 인터랙션 규격 (Motion & Interactions)](#7-모션--인터랙션-규격-motion--interactions)
8. [웹 접근성 (Accessibility & WAI-ARIA)](#8-웹-접근성-accessibility--wai-aria)

---

## 1. 디자인 철학 및 핵심 컨셉

WebTools는 유틸리티 도구 모음 사이트로서 단순한 기능 제공을 넘어, 시각적 아름다움과 몰입감을 선사하는 차세대 웹 인터페이스를 목표로 합니다.

### 💎 3대 UI/UX 기둥 (Core Pillars)
1. **차세대 글래스모피즘 (Next-Gen Glassmorphism)**
   - 다층 배경 블러(`backdrop-blur-xl`), 미세한 빛 반사 테두리(`border-white/40`), 수직적 레이어 감각을 통해 미래지향적이고 현대적인 입체감을 제공합니다.
2. **연속성 있는 스마트 멀티태스킹 (Smart Tab Continuity)**
   - 브라우저 탭 경험을 웹 애플리케이션 내에 이식하여, 사용자가 여러 도구(예: 색상 변환기, JSON 포맷터, RegEx 테스터)를 오갈 때 작업 상태 및 컨텍스트를 즉시 유지할 수 있도록 설계합니다.
3. **유기적 다크/라이트 테마 (Fluid Theme Adaptation)**
   - 시스템 반응형 테마 지원 및 부드러운 색상 전환(`transition-colors duration-300`)을 지원합니다.
   - 배경에는 단순 단색이 아닌 4포인트 방사형 조명 메시 그라데이션(Dynamic Mesh Radial Gradient)을 배치하여 입체적인 분위기를 자아냅니다.

---

## 2. 디자인 토큰 시스템 (Design Tokens)

`src/app/globals.css` 및 Tailwind CSS 기반으로 설정된 디자인 표준 변수 모음입니다.

### 🎨 2.1 시각적 컬러 토큰 (Color Palette Tokens)

```css
/* ==========================================================================
   [Design System] 1. Light Mode CSS Custom Properties (라이트 테마)
   ========================================================================== */
:root {
    /* 1.1 배경 및 기본 서식 */
    --background: #f4f5f7;            /* 소프트 그레이 기본 바탕 배경색 */
    --foreground: #1c1c1c;            /* 가독성이 확보된 진한 텍스트 컬러 (contrast 4.5:1 이상) */
    
    /* 1.2 카드 및 컨테이너 */
    --card: #ffffff;                  /* 컨테이너 및 팝오버 기본 백그라운드 */
    --card-foreground: #1c1c1c;       /* 카드 내부 텍스트 컬러 */
    
    /* 1.3 브랜드 및 주요 하이라이트 (Primary) */
    --primary: #6366f1;               /* 브랜드 아이덴티티 시그니처 컬러 (Indigo-500) */
    --primary-foreground: #ffffff;    /* Primary 버튼/아이콘 상위 반전 텍스트 */
    
    /* 1.4 보조 요소 (Secondary & Muted) */
    --secondary: #f0f1f3;             /* 세컨더리 버튼 및 비활성 배경 */
    --secondary-foreground: #374151;  /* 세컨더리 텍스트 컬러 */
    --muted: #f9fafb;                 /* 비강조 패널 background */
    --muted-foreground: #6b7280;      /* 캡션, 주석, 보조 설명글 (Gray-500) */
    
    /* 1.5 보더 및 라운딩 */
    --border: #e5e7eb;                /* 일반 구분선 및 테두리 (Gray-200) */
    --input: #e5e7eb;                 /* 폼 텍스트 입력창 테두리 */
    --ring: #6366f1;                  /* 키보드 포커스링 하이라이트 컬러 */
    --radius: 1rem;                   /* 기본 카드 테두리 곡률 반지름 (16px) */
}

/* ==========================================================================
   [Design System] 2. Dark Mode Overrides (다크 테마 오버라이드)
   ========================================================================== */
.dark {
    /* 2.1 배경 및 기본 서식 */
    --background: #09090b;            /* 딥 숯색/블랙 메인 테마 배경 (Zinc-950) */
    --foreground: #f8fafc;            /* 고대비 백색 메인 텍스트 (Slate-50) */
    
    /* 2.2 카드 및 컨테이너 */
    --card: #18181b;                  /* 다크 모드 카드 배경 (Zinc-900) */
    --card-foreground: #f8fafc;       /* 다크 카드 internal text */
    
    /* 2.3 브랜드 및 주요 하이라이트 (Primary) */
    --primary: #818cf8;               /* 시인성이 개선된 시그니처 릴랙스 인디고 (Indigo-400) */
    --primary-foreground: #ffffff;    /* Primary 반전 텍스트 */
    
    /* 2.4 보조 요소 (Secondary & Muted) */
    --secondary: #27272a;             /* 다크 모드 보조 버튼 배경 (Zinc-800) */
    --secondary-foreground: #f3f4f6;  /* 다크 보조 텍스트 */
    --muted: #27272a;                 /* 비활성 다크 패널 */
    --muted-foreground: #a1a1aa;      /* 보조 설명 텍스트 (Zinc-400) */
    
    /* 2.5 보더 및 포커스 */
    --border: #27272a;                /* 은은한 다크 보더선 (Zinc-800) */
    --input: #27272a;                 /* 인풋 테두리 */
    --ring: #818cf8;                  /* 다크 모드 포커스 링 */
}
```

### 🌌 2.2 동적 4포인트 방사형 캔버스 배경 (Dynamic Mesh Background)

화면 스크롤 위치와 무관하게 고정(`fixed`)되며, 4개 모서리에서 빛이 피어오르는 듯한 배경 연출 효과입니다.

```css
/* ==========================================================================
   [Design System] Ambient Radial Gradient Overlay
   ========================================================================== */
body {
    background-color: var(--background);
    color: var(--foreground);
    font-feature-settings: "rlig" 1, "calt" 1; /* 서체 합성 옵션 최적화 */
    background-image:
        /* 좌상단: 브랜드 인디고 Glow */
        radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%),
        /* 우상단: 악센트 로즈/핑크 Glow */
        radial-gradient(at 100% 0%, rgba(244, 63, 94, 0.1) 0px, transparent 50%),
        /* 우하단: 시원한 스카이 블루 Glow */
        radial-gradient(at 100% 100%, rgba(14, 165, 233, 0.1) 0px, transparent 50%),
        /* 좌하단: 신비로운 바이올렛/마젠타 Glow */
        radial-gradient(at 0% 100%, rgba(232, 121, 249, 0.15) 0px, transparent 50%);
    background-attachment: fixed; /* 스크롤 시에도 배경 빛이 일관되게 고정 */
}
```

---

## 3. Glassmorphism 레이어링 & 유틸리티

글래스 효과는 컴포넌트의 위계(Depth)와 사용 목적에 따라 차등 적용됩니다.

| 유틸리티 클래스 | 용도 | 백드롭 블러 | 투명도 (Light/Dark) | 테두리 (Border) |
|---|---|---|---|---|
| `.glass` | 기본 팝오버/모달/패널 | `backdrop-blur-xl` | 40% / 60% | `border-white/40` / `border-white/10` |
| `.glass-card` | 메인 카운터 및 유틸리티 도구 카드 | `backdrop-blur-lg` | 60% / 80% | `rounded-[32px]` 반사 보더 |
| `.glass-sidebar` | 고정 네비게이션 사이드바 | `backdrop-blur-2xl` | 20% / 40% | `border-r border-white/30` |
| `.glass-header` | 상단 고정 헤더 & 스마트 탭 바 | `backdrop-blur-xl` | 30% / 40% | `border-b border-white/40` |

### 🛠️ CSS 유틸리티 상세 정의 (`globals.css`)

```css
@layer utilities {
    /* ----------------------------------------------------------------------
       1. Standard Glass Module (기본 글래스 모듈)
       ---------------------------------------------------------------------- */
    .glass {
        @apply bg-white/40 dark:bg-zinc-950/60 
               backdrop-blur-xl 
               border border-white/40 dark:border-white/10 
               shadow-xl;
    }

    /* ----------------------------------------------------------------------
       2. Glass Card (유틸리티 카드 표준: 32px 둥근 곡률 + 입체 그림자)
       ---------------------------------------------------------------------- */
    .glass-card {
        @apply bg-white/60 dark:bg-zinc-900/80 
               backdrop-blur-lg 
               border border-white/60 dark:border-white/10 
               rounded-[32px] 
               transition-all duration-500;
        /* 라이트 모드 소프트 그림자 */
        box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.08);
    }

    .dark .glass-card {
        /* 다크 모드 딥 섀도우 */
        box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.5);
    }

    /* ----------------------------------------------------------------------
       3. Interactive Hover Animation (글래스 호버 마이크로 인터랙션)
       ---------------------------------------------------------------------- */
    .glass-hover {
        @apply hover:bg-white/80 dark:hover:bg-zinc-800/90 
               hover:shadow-2xl dark:hover:shadow-indigo-500/10 
               hover:border-white/90 dark:hover:border-indigo-500/30 
               hover:-translate-y-1.5; /* 부드럽게 위로浮上 */
    }

    /* ----------------------------------------------------------------------
       4. Navigation Glass Components (사이드바 & 헤더 고투명 유틸)
       ---------------------------------------------------------------------- */
    .glass-sidebar {
        @apply bg-white/20 dark:bg-zinc-950/40 
               backdrop-blur-2xl 
               border-r border-white/30 dark:border-white/5 
               shadow-2xl;
    }

    .glass-header {
        @apply bg-white/30 dark:bg-zinc-950/40 
               backdrop-blur-xl 
               border-b border-white/40 dark:border-white/5 
               shadow-sm;
    }
}
```

---

## 4. 레이아웃 & 스마트 탭 아키텍처

WebTools는 사이드바, 헤더, 스마트 탭바, 캔버스 영역의 4중 구조로 통합 관리됩니다.

```
+-----------------------------------------------------------------------+
|  [Header & Smart Tab Bar] (glass-header)                             |
|  [🏠 홈] [🎨 색상 변환기 (Active)] [📝 JSON 포맷터 x] [+ 새 탭]         |
+------------------+----------------------------------------------------+
|                  |                                                    |
|  [Sidebar]       |  [Main Canvas Area]                                |
|  (glass-sidebar) |  (스마트 탭 활성화 경로에 해당하는 컴포넌트 렌더링)   |
|                  |                                                    |
|  - 홈            |  +----------------------------------------------+  |
|  - 도구 목록     |  | [Tool Title & Glass Workspace Card]         |  |
|  - 즐겨찾기      |  |                                              |  |
|  - 설정          |  +----------------------------------------------+  |
|                  |                                                    |
+------------------+----------------------------------------------------+
```

### 🔄 스마트 탭 라이프사이클 흐름
1. **라우팅 감지 (`usePathname`)**: 사용자가 특정 경로(예: `/tools/color-picker`)로 진입합니다.
2. **탭 컨텍스트 업데이트 (`addTab`)**:
   - `TabProvider`에 경로가 등록되어 있지 않으면 탭 매핑 객체를 기반으로 자동 추가.
   - 이미 존재하는 탭이면 해당 탭을 Active 상태로 전환.
3. **로컬스토리지 동기화 (`localStorage`)**:
   - 사용자가 방문한 탭 목록과 `activeTabId`가 브라우저에 저장되어, 새로고침 시에도 작업 탭이 그대로 유지됨.
4. **탭 닫기 및 이동 메커니즘**:
   - 활성 탭 닫기 시 바로 직전 인덱스 탭 또는 홈(`/`)으로 이탈 제어.

---

## 5. 반응형 UI & 모바일 UX 전략

모바일 퍼스트(Mobile-First) 설계 원칙을 준수하며 터치 경험과 스크롤 편의성을 극대화합니다.

### 📱 5.1 브레이크포인트 규격 (Breakpoints)
- **`sm` (640px)**: 모바일 가로 모드 및 대형 스마트폰
- **`md` (768px)**: 태블릿 (사이드바 햄버거 토글로 전환)
- **`lg` (1024px)**: 소형 노트북 (사이드바 고정 렌더링 시작)
- **`xl` (1280px)**: 대형 데스크톱 (3단 카드 그리드 분할)

### 🖐️ 5.2 모바일 UX 모범 사례
- **터치 타겟 규격**: 모든 버튼 및 터치 대상은 최소 **`44px x 44px`** (Padding `p-3` 이상) 공간 확보.
- **스마트 탭 오버플로우 스크롤**:
  ```tsx
  /* 스크롤바는 숨기되 손가락 제스처 스크롤은 자유롭게 지원 */
  <div className="flex items-center overflow-x-auto no-scrollbar scroll-smooth space-x-2">
      {/* 탭 개별 아이템들 */}
  </div>
  ```
- **모바일 폼 컨트롤 터치 줌 방지**: 모바일 웹뷰에서 Input 포커스 시 화면이 자동으로 줌인되는 현상을 막기 위해 폰트 크기 `text-base` (16px) 이상 유지.

---

## 6. 컴포넌트 패턴 & 상세 코드 주석 예시

### 🧩 6.1 ToolCard.tsx (유틸리티 카드 컴포넌트)

```tsx
/**
 * @file ToolCard.tsx
 * @description 단일 유틸리티 도구를 표상하는 글래스모픽 인터랙티브 카드 컴포넌트입니다.
 * 
 * 주요 기능:
 * 1. Glassmorphism 토큰(.glass-card, .glass-hover)을 적용한 입체적 렌더링
 * 2. 마우스 호버 시 카드 내부에서 우상단 인디고 빛(Glow)이 은은하게 퍼지는 애니메이션
 * 3. Next.js Link와 연동되어 클릭 시 해당 유틸리티 도구 경로로 즉시 라우팅
 */

import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

/**
 * ToolCard 컴포넌트가 전달받는 Props 정의
 */
export interface ToolCardProps {
    /** 도구의 고유 식별자 (예: 'color-converter') */
    id: string;
    /** 화면에 표출할 도구 이름 (예: '색상 코드 변환기') */
    title: string;
    /** 도구에 대한 간략한 기능 설명 (최대 2줄 권장) */
    description: string;
    /** Lucide React 아이콘 컴포넌트 객체 */
    icon: LucideIcon;
    /** 해당 유틸리티로 이동할 내부 URL 경로 (예: '/tools/color-converter') */
    path: string;
    /** 카테고리 명칭 (예: '개발 / 디자인') */
    category: string;
}

export function ToolCard({
    title,
    description,
    icon: Icon,
    path,
    category,
}: ToolCardProps) {
    return (
        <Link
            href={path}
            aria-label={`${title} 도구로 이동`}
            className="group relative flex flex-col justify-between p-6 glass-card glass-hover overflow-hidden transition-all duration-300"
        >
            {/* -----------------------------------------------------------------
               [배경 모션 효과] 마우스 호버 시 은은하게 확산되는 인디고 백그라운드 Glow
               ----------------------------------------------------------------- */}
            <div 
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl transition-all duration-500 group-hover:bg-indigo-500/25 group-hover:scale-125" 
            />

            <div>
                {/* -------------------------------------------------------------
                   [상단 영역] 카테고리 뱃지 & 브랜드 아이콘 래퍼
                   ------------------------------------------------------------- */}
                <div className="flex items-center justify-between mb-4">
                    {/* 카테고리 뱃지 */}
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        {category}
                    </span>
                    
                    {/* 아이콘 백그라운드 컨테이너 (호버 시 크기 살짝 확대) */}
                    <div className="p-3 rounded-2xl bg-white/50 dark:bg-zinc-800/50 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-sm">
                        <Icon className="w-6 h-6" />
                    </div>
                </div>

                {/* -------------------------------------------------------------
                   [본문 영역] 카드 타이틀 & 설명글 (line-clamp-2 적용)
                   ------------------------------------------------------------- */}
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {title}
                </h3>

                <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {description}
                </p>
            </div>

            {/* -----------------------------------------------------------------
               [하단 영역] 실행하기 텍스트 & 우측 이동 화살표 (호버 시 슬라이드 모션)
               ----------------------------------------------------------------- */}
            <div className="mt-6 flex items-center text-xs font-semibold text-primary opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                <span>실행하기</span>
                <span 
                    aria-hidden="true" 
                    className="ml-1 transition-transform duration-300 group-hover:translate-x-1.5"
                >
                    →
                </span>
            </div>
        </Link>
    );
}
```

---

### 🧩 6.2 TabBar.tsx (스마트 탭 바 컴포넌트)

```tsx
/**
 * @file TabBar.tsx
 * @description 열려있는 스마트 탭 목록을 표시하고, 탭 선택/닫기/이동을 제어하는 상단 헤더 컴포넌트입니다.
 */

"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X, Home } from "lucide-react";
import { useTabs } from "@/components/providers/TabProvider";

export function TabBar() {
    const pathname = usePathname();
    const router = useRouter();
    const { tabs, removeTab } = useTabs();

    /**
     * 탭 닫기 버튼 클릭 핸들러
     * @param e - 클릭 이벤트 (부모 탭 클릭 이벤트로의 전파 방지)
     * @param tabId - 삭제 대상 탭의 고유 ID
     * @param tabPath - 삭제 대상 탭의 URL 경로
     */
    const handleCloseTab = (e: React.MouseEvent, tabId: string, tabPath: string) => {
        e.preventDefault(); // 링크 이동 방지
        e.stopPropagation(); // 이벤트 버블링 차단

        const isCurrentActive = pathname === tabPath;
        removeTab(tabId);

        // 현재 보고 있던 활성 탭을 닫았을 경우 대안 경로로 라우팅
        if (isCurrentActive) {
            const remainingTabs = tabs.filter((t) => t.id !== tabId);
            if (remainingTabs.length > 0) {
                router.push(remainingTabs[remainingTabs.length - 1].path);
            } else {
                router.push("/"); // 탭이 없으면 홈으로 이동
            }
        }
    };

    return (
        <div className="glass-header w-full px-4 py-2 flex items-center space-x-2 overflow-x-auto no-scrollbar">
            {/* 홈 기본 고정 탭 */}
            <Link
                href="/"
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    pathname === "/"
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-white/30 dark:bg-zinc-800/40 text-muted-foreground hover:bg-white/50"
                }`}
            >
                <Home className="w-3.5 h-3.5" />
                <span>홈</span>
            </Link>

            {/* 동적으로 추가된 열린 유틸리티 탭 리스트 */}
            {tabs.map((tab) => {
                const isActive = pathname === tab.path;
                return (
                    <Link
                        key={tab.id}
                        href={tab.path}
                        className={`group flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                            isActive
                                ? "bg-primary/90 text-white shadow-md shadow-indigo-500/20"
                                : "bg-white/30 dark:bg-zinc-800/40 text-muted-foreground hover:bg-white/60 dark:hover:bg-zinc-800/70"
                        }`}
                    >
                        <span>{tab.title}</span>

                        {/* 탭 닫기(X) 버튼 */}
                        <button
                            type="button"
                            onClick={(e) => handleCloseTab(e, tab.id, tab.path)}
                            aria-label={`${tab.title} 탭 닫기`}
                            className="p-0.5 rounded-md opacity-60 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/20 transition-all"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </Link>
                );
            })}
        </div>
    );
}
```

---

## 7. 모션 & 인터랙션 규격 (Motion & Interactions)

WebTools의 모든 움직임은 예측 가능하며 자연스러워야 합니다.

### ⏱️ 7.1 지속 시간 및 타이밍 (Duration & Easing)
- **Fast (`150ms - 200ms`)**: 버튼 누름(`active:scale-95`), 툴팁/팝오버 출현.
- **Normal (`300ms`)**: 카드 호버 상승(`hover:-translate-y-1.5`), 테마 전환(`transition-colors`).
- **Slow (`500ms`)**: 모달 슬라이드 인, 메인 글래스 카드 섀도우 확장.
- **Easing Curve**: Standard Easing `cubic-bezier(0.4, 0, 0.2, 1)` 권장.

### ♿ 7.2 모션 접근성 (`prefers-reduced-motion`)
애니메이션으로 인해 어지러움이나 고통을 겪는 사용자를 위해 미디어 쿼리를 기본 지원합니다.

```css
@media (prefers-reduced-motion: reduce) {
    *, ::before, ::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
}
```

---

## 8. 웹 접근성 (Accessibility & WAI-ARIA)

모든 사용자가 장애 여부와 관계없이 유틸리티를 자유롭게 이용할 수 있도록 다음 준수 사항을 기본 적용합니다.

1. **시각 명암비 보장 (Color Contrast)**
   - 일반 본문 텍스트: 최소 **`4.5:1`** 이상의 명암비 준수 (`--foreground` 및 `--muted-foreground` 고대비 설정).
   - Large 타이틀 텍스트: 최소 **`3:1`** 준수.
2. **키보드 탐색 포커스 링 (Focus Rings)**
   - `Tab` 키 조작 시 현재 포커스된 요소를 직관적으로 파악할 수 있도록 표준 포커스 링 적용:
     ```css
     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
     ```
3. **스크린 리더 전용 ARIA 레이블**
   - 아이콘으로만 이루어진 버튼(예: 탭 닫기 `X`, 테마 토글 렌즈 아이콘)에는 반드시 `aria-label` 명시.
   - 데코레이션 전용 요소(빛 반응 Glow 등)에는 `aria-hidden="true"` 부여.
         href={path}
            className="group relative flex flex-col justify-between p-6 glass-card glass-hover overflow-hidden"
        >
            {/* 호버 시 배경에 은은하게 나타나는 인디고 하이라이트 빛 (Glow Effect) */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl transition-all duration-500 group-hover:bg-indigo-500/20" />

            <div>
                {/* 카테고리 태그 및 아이콘 영역 */}
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        {category}
                    </span>
                    <div className="p-3 rounded-2xl bg-white/50 dark:bg-zinc-800/50 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-6 h-6" />
                    </div>
                </div>

                {/* 카드 제목 */}
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {title}
                </h3>

                {/* 카드 설명 */}
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {description}
                </p>
            </div>

            {/* 카드 하단 액션 화살표 */}
            <div className="mt-6 flex items-center text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>실행하기</span>
                <span className="ml-1 group-hover:translate-x-1 transition-transform duration-300">→</span>
            </div>
        </Link>
    );
}
```

---

## 7. 모션 & 인터랙션 가이드라인

1. **트랜지션 지속 시간**:
   - 호버 및 위치 이동 모션: `duration-300` ~ `duration-500`
   - 색상 변경(Dark/Light Mode): `transition-colors duration-300`
2. **피드백 인터랙션**:
   - 클릭 가능 요소는 `active:scale-95` 또는 `hover:-translate-y-1`로 물리적인 버튼 감각 제공.
   - 복사 완료 등 토스트/알림 시 반투명 Glass 배경과 `animate-in fade-in slide-in-from-bottom-2` 적용.
