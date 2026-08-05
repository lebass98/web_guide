# 🛒 E-Commerce-Template.md (이커머스 통합 템플릿 가이드)

이 문서는 modern React (Next.js / Vite) 기반의 고성능 이커머스(E-Commerce) 웹 애플리케이션을 구축하기 위한 메인 통합 가이드 문서입니다. 사용자 서비스의 전체 아키텍처, 데이터 흐름, 장바구니/결제 프로세스 및 세부 모듈과의 연동 방식을 정의합니다.

---

## 📑 목차 (Table of Contents)
1. [시스템 아키텍처 & 서비스 전체 흐름](#1-시스템-아키텍처--서비스-전체-흐름)
2. [핵심 도메인 흐름 (Core Domain Workflows)](#2-핵심-도메인-흐름-core-domain-workflows)
3. [모듈 연동 가이드라인 (Modules Integration)](#3-모듈-연동-가이드라인-modules-integration)
4. [주요 상태 관리 설계 (Cart & Checkout State)](#4-주요-상태-관리-설계-cart--checkout-state)
5. [핵심 코드 구현 예시 및 상세 주석](#5-핵심-코드-구현-예시-및-상세-주석)

---

## 1. 시스템 아키텍처 & 서비스 전체 흐름

이커머스 시스템은 높은 도메인 복잡성을 가지므로, **FSD(Feature-Sliced Design)** 아키텍처와 **Zustand / React Query** 기반 데이터 흐름을 따릅니다.

```
[사용자 (Client)]
       │
       ▼
 ┌─────────────────────────────────────────────────────────────┐
 │  1. 상품 탐색 (Product Catalog & Filter)                      │
 └──────────────────────────────┬──────────────────────────────┘
                                │ (상품 선택 및 옵션 지정)
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │  2. 장바구니 (Cart State: Local Storage & Server Sync)        │
 └──────────────────────────────┬──────────────────────────────┘
                                │ (인증 확인 - auth-setup.md 연동)
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │  3. 주문 및 결제 (Checkout & PG Payment Integration)          │
 └──────────────────────────────┬──────────────────────────────┘
                                │ (결제 완료 및 Webhook 처리)
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │  4. 주문 내역 및 배송 추적 (Order History & Tracking)        │
 └─────────────────────────────────────────────────────────────┘
```

---

## 2. 핵심 도메인 흐름 (Core Domain Workflows)

### 🛍️ 2.1 상품 디스플레이 & 필터링 (Product Catalog)
- **SSR/ISR 최적화**: SEO가 중요한 상품 상세 및 카테고리 목록은 Next.js 서버 사이드 렌더링(SSR) 또는 주기적 재검증(ISR)을 사용합니다.
- **무한 스크롤 & 동적 필터**: 카테고리, 가격대, 브랜드를 URL SearchParams와 연동하여 상태를 보존합니다.

### 🛒 2.2 장바구니 관리 (Shopping Cart Engine)
- **비회원/회원 하이브리드 지원**:
  - 비회원: Browser `localStorage`에 Cart Item 저장.
  - 로그인 시: 비회원 장바구니 항목을 서버 장바구니 API와 자동으로 **Merge(병합)** 처리.
- **옵션 선택 메커니즘**: 동일 상품이라도 SKU/색상/사이즈 옵션이 다르면 별도 Item으로 구분 관리.

### 💳 2.3 주문 & 결제 (Checkout & Payment)
- **주문서 작성**: 배송지 입력, 쿠폰/포인트 적용, 최종 금액 자동 계산.
- **PG사 결제 연동 (Portone / Toss Payments)**:
  - 클라이언트 SDK 호출 -> 결제 승인 요청 -> 서버 웹훅(Webhook) 검증 -> 결제 완료 페이지 이동.

---

## 3. 모듈 연동 가이드라인 (Modules Integration)

이 템플릿은 `modules/` 디렉토리의 세부 아키텍처 규격을 준수합니다.

- 🔐 **인증 및 권한 모듈**: [`modules/auth-setup.md`](./modules/auth-setup.md)
  - 마이페이지, 장바구니 결제 진입 시 `ProtectedRoute` 라우트 가드 적용.
- 🎨 **디자인 시스템 모듈**: [`modules/ui-ux-system.md`](./modules/ui-ux-system.md)
  - Glassmorphic 상품 카드, 수량 조절 버튼, 모바일 바텀시트 결제 폼 적용.
- 📂 **폴더 구조 모듈**: [`modules/folder-structure.md`](./modules/folder-structure.md)
  - FSD 규격에 따른 `entities/product`, `features/add-to-cart`, `widgets/header` 분리.

---

## 4. 주요 상태 관리 설계 (Cart & Checkout State)

### 🛒 Zustand 장바구니 스토어 예시

```typescript
/**
 * @file cartStore.ts
 * @description 이커머스 장바구니 불변 상태 관리 스토어 (Zustand + Persist)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;          // 장바구니 아이템 고유 ID (SKU 단위)
  productId: string;   // 상품 ID
  title: string;       // 상품 이름
  price: number;       // 단가
  quantity: number;    // 수량
  imageUrl: string;    // 대표 이미지 URL
  selectedOption?: string; // 선택된 옵션 (예: 'Color: Black / Size: L')
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      // 상품 장바구니 추가 (기존 동일 옵션 상품 존재 시 수량만 증가)
      addItem: (newItem, qty = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex((item) => item.id === newItem.id);
          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex].quantity += qty;
            return { items: updatedItems };
          }
          return { items: [...state.items, { ...newItem, quantity: qty }] };
        });
      },

      // 아이템 삭제
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      // 수량 변경
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) return;
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },

      // 장바구니 비우기
      clearCart: () => set({ items: [] }),

      // 총 금액 계산
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'webtools-ecommerce-cart', // localStorage 저장 키
    }
  )
);
```

---

## 5. 핵심 코드 구현 예시 및 상세 주석

### 🛍️ 상품 장바구니 추가 버튼 (`AddToCartButton.tsx`)

```tsx
/**
 * @file AddToCartButton.tsx
 * @description 사용자 인터랙션 기반 장바구니 담기 버튼 컴포넌트
 * 클릭 시 마이크로 토스트 알림 및 수량 추가를 수행합니다.
 */

'use client';

import React, { useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { useCartStore, CartItem } from '@/stores/cartStore';

interface AddToCartButtonProps {
  product: Omit<CartItem, 'quantity'>;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addItem(product, 1);
    setIsAdded(true);

    // 2초 후 피드백 버튼 상태 원복
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={isAdded}
      className={`w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-2xl font-bold transition-all duration-300 ${
        isAdded
          ? 'bg-emerald-500 text-white scale-98 shadow-lg shadow-emerald-500/20'
          : 'bg-primary hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 active:scale-95'
      }`}
    >
      {isAdded ? (
        <>
          <Check className="w-5 h-5 animate-bounce" />
          <span>장바구니에 담겼습니다!</span>
        </>
      ) : (
        <>
          <ShoppingBag className="w-5 h-5" />
          <span>장바구니에 담기</span>
        </>
      )}
    </button>
  );
}
```
