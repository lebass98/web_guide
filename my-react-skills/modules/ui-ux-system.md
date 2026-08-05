# 🎨 ui-ux-system.md (디자인 시스템 & 공통 컴포넌트 모듈)

이 문서는 WebTools 및 React 프로젝트 전반에서 일관된 시각적 정체성, Glassmorphism 디자인 가이드라인, 반응형 그리드 및 재사용 가능한 공통 컴포넌트 체계를 제공하는 모듈 가이드 문서입니다.

---

## 📑 목차 (Table of Contents)
1. [디자인 토큰 (Design Tokens)](#1-디자인-토큰-design-tokens)
2. [Glassmorphic 레이어 유틸리티](#2-glassmorphic-레이어-유틸리티)
3. [공통 UI 컴포넌트 규격 (Core UI Components)](#3-공통-ui-컴포넌트-규격-core-ui-components)
4. [반응형 레이아웃 & 모바일 UX](#4-반응형-레이아웃--모바일-ux)
5. [웹 접근성 (Accessibility & WAI-ARIA)](#5-웹-접근성-accessibility--wai-aria)

---

## 1. 디자인 토큰 (Design Tokens)

```css
/* ==========================================================================
   CSS Custom Properties (Light & Dark Mode Tokens)
   ========================================================================== */
:root {
  --background: #f4f5f7;
  --foreground: #1c1c1c;
  --card: #ffffff;
  --card-foreground: #1c1c1c;
  --primary: #6366f1;           /* Indigo-500 */
  --primary-foreground: #ffffff;
  --secondary: #f0f1f3;
  --muted: #f9fafb;
  --muted-foreground: #6b7280;  /* Gray-500 */
  --border: #e5e7eb;
  --radius: 1rem;              /* 16px */
}

.dark {
  --background: #09090b;       /* Zinc-950 */
  --foreground: #f8fafc;       /* Slate-50 */
  --card: #18181b;             /* Zinc-900 */
  --card-foreground: #f8fafc;
  --primary: #818cf8;          /* Indigo-400 */
  --primary-foreground: #ffffff;
  --secondary: #27272a;
  --muted: #27272a;
  --muted-foreground: #a1a1aa; /* Zinc-400 */
  --border: #27272a;
}
```

---

## 2. Glassmorphic 레이어 유틸리티

```css
@layer utilities {
  /* 1. 표준 글래스 패널 */
  .glass {
    @apply bg-white/40 dark:bg-zinc-950/60 
           backdrop-blur-xl 
           border border-white/40 dark:border-white/10 
           shadow-xl;
  }

  /* 2. 글래스 카드 (둥근 모서리 32px) */
  .glass-card {
    @apply bg-white/60 dark:bg-zinc-900/80 
           backdrop-blur-lg 
           border border-white/60 dark:border-white/10 
           rounded-[32px] 
           transition-all duration-500;
    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.08);
  }

  /* 3. 호버 마이크로 인터랙션 */
  .glass-hover {
    @apply hover:bg-white/80 dark:hover:bg-zinc-800/90 
           hover:shadow-2xl dark:hover:shadow-indigo-500/10 
           hover:border-white/90 dark:hover:border-indigo-500/30 
           hover:-translate-y-1.5;
  }
}
```

---

## 3. 공통 UI 컴포넌트 규격 (Core UI Components)

### 🔘 `GlassButton.tsx` (공통 버튼)

```tsx
/**
 * @file GlassButton.tsx
 * @description 시각적 피드백과 접근성이 반영된 공통 글래스 버튼 컴포넌트
 */

import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function GlassButton({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}: GlassButtonProps) {
  const baseStyles =
    'relative inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  const variantStyles = {
    primary:
      'bg-primary text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-600',
    secondary:
      'glass hover:bg-white/60 dark:hover:bg-zinc-800/70 text-foreground border border-white/40 dark:border-white/10',
    ghost: 'bg-transparent hover:bg-white/30 dark:hover:bg-zinc-800/40 text-foreground',
    danger:
      'bg-rose-500 text-white shadow-lg shadow-rose-500/25 hover:bg-rose-600',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
}
```

---

## 4. 반응형 레이아웃 & 모바일 UX

- **터치 Target 방어선**: 최소 높이 `44px` (`min-h-[44px]`), 클릭 핫스팟 확보.
- **모바일 수평 스크롤**: `.no-scrollbar` 처리로 디스플레이 깔끔하게 보존.

---

## 5. 웹 접근성 (Accessibility & WAI-ARIA)

- **명암비 표준**: 본문 최소 `4.5:1` 이상 유지.
- **포커스 하이라이트**: `focus-visible:ring-2 focus-visible:ring-primary` 필수 부여.
- **대체 텍스트**: 비텍스트 요소(아이콘 전용 버튼 등)에 `aria-label` 필수 지정.
