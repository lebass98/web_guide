# 📊 Admin-Dashboard-Template.md (관리자 대시보드 템플릿 가이드)

이 문서는 기업형 어드민 시스템, 데이터 시각화 패널, 사용자/주문/콘텐츠 관리자를 위한 백오피스 대시보드 구축 종합 규격서입니다.

---

## 📑 목차 (Table of Contents)
1. [어드민 시스템 레이아웃 아키텍처](#1-어드민-시스템-레이아웃-아키텍처)
2. [핵심 기능 모듈 (Core Admin Modules)](#2-핵심-기능-모듈-core-admin-modules)
3. [스마트 탭 기반 멀티태스킹 캔버스](#3-스마트-탭-기반-멀티태스킹-캔버스)
4. [데이터 테이블 & 모듈 연동 가이드](#4-데이터-테이블--모듈-연동-가이드)
5. [핵심 코드 구현 예시 및 상세 주석](#5-핵심-코드-구현-예시-및-상세-주석)

---

## 1. 어드민 시스템 레이아웃 아키텍처

어드민 인터페이스는 대량의 데이터 처리 및 동시 작업 효율성이 극대화되어야 합니다.

```
+-------------------------------------------------------------------------+
| [Top Navigation & Smart Tab Bar] (glass-header)                         |
| [🏠 대시보드] [👥 회원 관리 (Active)] [📦 상품 등록 x] [🔔 3] [👤 어드민] |
+------------------+------------------------------------------------------+
|                  |                                                      |
| [Admin Sidebar]  | [Main Content Canvas]                                |
| (glass-sidebar)  |                                                      |
|                  | +--------------------------------------------------+ |
| - KPI 대시보드   | | [Header & Action Buttons: 검색 / EXCEL / 신규]    | |
| - 회원/권한 관리 | +--------------------------------------------------+ |
| - 주문/결제 관리 | | [Data Table with Pagination & Bulk Actions]      | |
| - 상품/재고 관리 | |                                                  | |
| - 시스템 설정    | +--------------------------------------------------+ |
|                  |                                                      |
+------------------+------------------------------------------------------+
```

---

## 2. 핵심 기능 모듈 (Core Admin Modules)

### 📈 2.1 KPI 메트릭 카운터 (Dashboard Analytics)
- 실시간 주요 지표 (당일 매출액, 신규 가입자 수, 처리 대기 주문 수, 동시 접속자 수).
- 증감율(YoY / MoM) 표출 및 상태 컬러(성장: Green, 감소: Red) 인디케이터.

### 📋 2.2 고성능 데이터 테이블 (Data Grid / Table)
- **주요 기능**: 서버 사이드 페이징(Pagination), 칼럼별 정렬(Sorting), 조건별 다중 검색 필터링, 컬럼 숨김/노출 토글.
- **다중 선택 처리(Bulk Actions)**: 일괄 승인, 일괄 삭제, EXCEL 다운로드 기능.

### 🔒 2.3 역할 기반 접근 제어 (RBAC: Role-Based Access Control)
- 슈퍼 관리자(Super Admin), 일반 관리자(Manager), CS 담당자(CS Staff)에 따른 메뉴 노출 및 API 수정 권한 제한.
- 자세한 권한 구현은 [`modules/auth-setup.md`](./modules/auth-setup.md) 참조.

---

## 3. 스마트 탭 기반 멀티태스킹 캔버스

어드민 사용자가 회원 상세 정보 조회 중 상품 등록 페이지로 전환할 때, 이전 작업 입력 폼의 상태가 유실되지 않도록 **Smart Tab Context System**을 적용합니다.

- **탭 자동 생성**: 사이드바 메뉴 클릭 시 신규 탭으로 열림.
- **탭 간 빠른 스위칭**: 키보드 단축키(`Alt + 1~9`) 또는 상단 스마트 탭 바를 통한 작업 전환.

---

## 4. 데이터 테이블 & 모듈 연동 가이드

- 🎨 **디자인 시스템 연동**: [`modules/ui-ux-system.md`](./modules/ui-ux-system.md)
  - 다크/라이트 테마에 동적 반응하는 Glassmorphism 대시보드 카드 적용.
- 📂 **아키텍처 연동**: [`modules/folder-structure.md`](./modules/folder-structure.md)
  - FSD 아키텍처의 `widgets/data-table`, `features/user-role-update` 분리 설계.

---

## 5. 핵심 코드 구현 예시 및 상세 주석

### 📊 5.1 어드민 KPI 지표 카드 (`AdminMetricCard.tsx`)

```tsx
/**
 * @file AdminMetricCard.tsx
 * @description 관리자 대시보드 상단 지표 카운터 컴포넌트
 * 매출, 회원수 등의 실시간 숫자와 전일 대비 증감율을 Glassmorphism 카드로 보여줍니다.
 */

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface AdminMetricCardProps {
  title: string;          // 지표 제목 (예: '오늘 총 매출액')
  value: string;          // 지표 값 (예: '₩ 14,250,000')
  changePercentage: number; // 전일 대비 증감율 (예: +12.5 또는 -3.2)
  icon: LucideIcon;       // 메인 표시 아이콘
  periodText?: string;    // 비교 기간 문구 (기본값: '전일 대비')
}

export function AdminMetricCard({
  title,
  value,
  changePercentage,
  icon: Icon,
  periodText = '전일 대비',
}: AdminMetricCardProps) {
  const isPositive = changePercentage >= 0;

  return (
    <div className="p-6 glass-card glass-hover relative overflow-hidden transition-all duration-300">
      {/* 카드 배경 하이라이트 아이콘 백드롭 */}
      <div className="absolute -right-4 -bottom-4 opacity-5 dark:opacity-10 pointer-events-none">
        <Icon className="w-32 h-32 text-primary" />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* 실시간 메트릭 수치 */}
      <div className="mt-4 flex items-baseline justify-between">
        <h4 className="text-2xl font-extrabold text-foreground tracking-tight">
          {value}
        </h4>

        {/* 증감율 뱃지 */}
        <div
          className={`flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
            isPositive
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5" />
          )}
          <span>
            {isPositive ? '+' : ''}
            {changePercentage}%
          </span>
        </div>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {periodText}
      </p>
    </div>
  );
}
```
