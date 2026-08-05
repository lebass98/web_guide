# WebTools UI/UX 디자인 시스템 규격서 (`ui-ux-system.md`)

WebTools 프로젝트의 시각적 정체성, UI/UX 설계 원칙, Glassmorphism 스타일 시스템 및 컴포넌트 아키텍처를 정의한 상세 가이드 문서입니다.

---

## 📑 목차 (Table of Contents)
1. [디자인 철학 및 핵심 컨셉](#1-디자인-철학-및-핵심-컨셉)
2. [디자인 토큰 (Design Tokens)](#2-디자인-토큰-design-tokens)
3. [Glassmorphism 시스템 (Glass Utilities)](#3-glassmorphism-시스템-glass-utilities)
4. [레이아웃 및 스마트 탭 시스템 (Layout & Smart Tabs)](#4-레이아웃-및-스마트-탭-시스템-layout--smart-tabs)
5. [반응형 레이아웃 및 모바일 UX (Responsive & Mobile UX)](#5-반응형-레이아웃-및-모바일-ux-responsive--mobile-ux)
6. [컴포넌트 패턴 및 코드 구현 주석 예시](#6-컴포넌트-패턴-및-코드-구현-주석-예시)
7. [모션 & 인터랙션 가이드라인](#7-모션--인터랙션-가이드라인)

---

## 1. 디자인 철학 및 핵심 컨셉

- **프리미엄 무드 (Premium & Modern Aesthetics)**: 단순한 도구 모음 사이트를 넘어, 사용자에게 시각적인 즐거움과 신뢰감을 주는 최첨단 Glassmorphic 디자인을 지향합니다.
- **스마트 탭 기반 멀티태스킹 (Smart Tab Multi-tasking)**: 사용자가 방문했던 여러 유틸리티 도구를 상단 탭으로 자동 등록하여 작업 흐름의 단절 없이 빠르게 전환할 수 있습니다.
- **다크/라이트 테마의 조화 (Fluid Theme Support)**: 시스템 설정 동기화 및 수동 테마 전환 기능을 지원하며, 각 테마에 최적화된 은은한 은하수 배경 그라데이션(Radial Gradient)을 제공합니다.

---

## 2. 디자인 토큰 (Design Tokens)

`src/app/globals.css`에 정의된 CSS Custom Properties 및 Tailwind v4 주제 설정입니다.

### 🎨 컬러 팔레트 (Color Palette)

```css
/* ==========================================================================
   1. Light Theme Tokens (기본 라이트 모드)
   ========================================================================== */
:root {
    --background: #f4f5f7;            /* 배경 기본 컬러 */
    --foreground: #1c1c1c;            /* 기본 메인 텍스트 */
    --card: #ffffff;                  /* 카드 및 컨테이너 배경 */
    --card-foreground: #1c1c1c;       /* 카드 내부 텍스트 */
    --primary: #6366f1;               /* 브랜드 주색상 (Indigo-500) */
    --primary-foreground: #ffffff;    /* Primary 요소 위 텍스트 */
    --secondary: #f0f1f3;             /* 세컨더리 버튼/배경 */
    --muted: #f9fafb;                 /* 비활성/비강조 영역 */
    --muted-foreground: #6b7280;      /* 보조 설명 텍스트 (Gray-500) */
    --border: #e5e7eb;                /* 구분선 및 테두리 (Gray-200) */
    --radius: 1rem;                   /* 기본 테두리 라운딩 (16px) */
}

/* ==========================================================================
   2. Dark Theme Tokens (다크 모드 오버라이드)
   ========================================================================== */
.dark {
    --background: #09090b;            /* 메인 다크 배경 (Zinc-950) */
    --foreground: #f8fafc;            /* 메인 밝은 텍스트 (Slate-50) */
    --card: #18181b;                  /* 다크 카드 배경 (Zinc-900) */
    --card-foreground: #f8fafc;       /* 다크 카드 텍스트 */
    --primary: #818cf8;               /* 다크 모드 주색상 (Indigo-400) */
    --primary-foreground: #ffffff;    /* 다크 Primary 요소 위 텍스트 */
    --muted: #27272a;                 /* 다크 딤 영역 (Zinc-800) */
    --muted-foreground: #a1a1aa;      /* 다크 보조 텍스트 (Zinc-400) */
    --border: #27272a;                /* 다크 테두리 (Zinc-800) */
}
```

### 🌌 동적 은하수 배경 (Dynamic Radial Background)

```css
/* 라이트/다크 모드 공통 은은한 4포인트 방사형 그라데이션 */
body {
    background-color: #f4f7ff;
    font-feature-settings: "rlig" 1, "calt" 1;
    background-image:
        radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%),    /* 좌상단 인디고 */
        radial-gradient(at 100% 0%, rgba(244, 63, 94, 0.1) 0px, transparent 50%),    /* 우상단 로즈 */
        radial-gradient(at 100% 100%, rgba(14, 165, 233, 0.1) 0px, transparent 50%), /* 우하단 스카이블루 */
        radial-gradient(at 0% 100%, rgba(232, 121, 249, 0.15) 0px, transparent 50%);  /* 좌하단 핑크 */
    background-attachment: fixed;
}
```

---

## 3. Glassmorphism 시스템 (Glass Utilities)

WebTools의 핵심 디자인 유틸리티 클래스 모음입니다 (`src/app/globals.css` 내 `@layer utilities`).

```css
/* ==========================================================================
   Glassmorphism CSS Utilities
   ========================================================================== */

/* 1. 기본 글래스 모듈 (패널, 모달, 팝오버용) */
.glass {
    /* 반투명 백그라운드 + 강력한 블러 효과 + 미세한 테두리 */
    @apply bg-white/40 dark:bg-zinc-950/60 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl;
}

/* 2. 유틸리티 카운터/카드용 메인 글래스 카드 (둥근 모서리 32px) */
.glass-card {
    @apply bg-white/60 dark:bg-zinc-900/80 backdrop-blur-lg border border-white/60 dark:border-white/10 rounded-[32px] transition-all duration-500;
    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.1);
}

.dark .glass-card {
    box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.5);
}

/* 3. 사이드바 및 헤더 전용 고투명도 글래스 */
.glass-sidebar {
    @apply bg-white/20 dark:bg-zinc-950/40 backdrop-blur-2xl border-r border-white/30 dark:border-white/5 shadow-2xl;
}

.glass-header {
    @apply bg-white/30 dark:bg-zinc-950/40 backdrop-blur-xl border-b border-white/40 dark:border-white/5 shadow-sm;
}

/* 4. 마우스 호버 모션 (카드가 살짝 떠오르며 그림자와 테두리가 강조됨) */
.glass-hover {
    @apply hover:bg-white/80 dark:hover:bg-zinc-800/90 hover:shadow-2xl dark:hover:shadow-indigo-500/10 hover:border-white/90 dark:hover:border-indigo-500/30 hover:-translate-y-2;
}
```

---

## 4. 레이아웃 및 스마트 탭 시스템 (Layout & Smart Tabs)

### 📌 스마트 탭 흐름도 (Smart Tabs Architecture)

1. **페이지 이동 감지**: 사용자가 사이드바/메인 카드를 통해 개별 유틸리티 경로(예: `/tools/color-converter`)에 접근.
2. **탭 자동 추가**: `TabProvider` 내 `addTab` 메서드가 실행되어 상단 스마트 탭 목록에 신규 탭 자동 생성.
3. **상태 영속성**: `localStorage`에 열린 탭 목록과 활성 탭이 저장되어 새로고침 후에도 유지.
4. **탭 닫기/초기화**: 탭의 'X' 버튼을 누르면 해당 경로 탭 제거 및 이전 탭 또는 메인으로 라우팅.

---

## 5. 반응형 레이아웃 및 모바일 UX (Responsive & Mobile UX)

- **Mobile First 디자인**:
  - 모바일 화면에서도 스마트 탭 목록이 좌우 스크롤(`no-scrollbar`) 가능.
  - 그리드 레이아웃:
    - 색상 팔레트 카드 등: 모바일 `grid-cols-2` → 데스크톱 `grid-cols-4` 이상으로 공간 활용도 최적화.
    - 유틸리티 리스트: 모바일 `grid-cols-1` → 태블릿 `grid-cols-2` → 데스크톱 `grid-cols-3`.
  - 햄버거 메인 메뉴: 오버플로우 방지 및 터치 친화적 패딩 제공 (`p-3`, `min-h-[44px]`).

---

## 6. 컴포넌트 패턴 및 코드 구현 주석 예시

### 🧩 1. 글래스 호버 유틸리티 카드 (`ToolCard.tsx` 예시)

```tsx
/**
 * @file ToolCard.tsx
 * @description 웹 유틸리티 도구 개별 카드 컴포넌트
 * Glassmorphism 디자인 토큰과 Hover 인터랙션이 적용되어 있습니다.
 */

import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface ToolCardProps {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    path: string;
    category: string;
}

export function ToolCard({ title, description, icon: Icon, path, category }: ToolCardProps) {
    return (
        <Link
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
