# 📂 folder-structure.md (FSD 및 프로젝트 아키텍처 모듈)

이 문서는 대규모 React / Next.js 프로젝트의 유지보수성, 확장성 및 모듈 간 결합도 최소화를 위한 **Feature-Sliced Design (FSD)** 아키텍처 폴더 구조 표준화 규격서입니다.

---

## 📑 목차 (Table of Contents)
1. [FSD (Feature-Sliced Design) 아키텍처 개요](#1-fsd-feature-sliced-design-아키텍처-개요)
2. [7대 레이어 계층 구조 (Layers)](#2-7대-레이어-계층-구조-layers)
3. [모듈 의존성 및 단방향 참조 원칙](#3-모듈-의존성-및-단방향-참조-원칙)
4. [실전 FSD 폴더 트리 예시](#4-실전-fsd-폴더-트리-예시)
5. [Next.js App Router와의 매핑 전략](#5-nextjs-app-router와의-매핑-전략)

---

## 1. FSD (Feature-Sliced Design) 아키텍처 개요

FSD는 애플리케이션 코드를 관심사 분리(SoC) 원칙에 따라 7개의 레이어로 계층화하고, 각 레이어를 Slice 및 Segment 단위로 나눕니다.

### 💡 핵심 이점
- **높은 응집도 & 낮은 결합도**: 기능(Feature) 단위로 코드가 격리되어 기능 추가/삭제 시 사이드 이펙트 최소화.
- **예측 가능한 코드 위치**: 프로젝트가 커져도 특정 로직의 파일 위치를 즉시 추적 가능.

---

## 2. 7대 레이어 계층 구조 (Layers)

아래 목록은 위에서 아래로 갈수록 **하위 레이어(추상화 수준 높음 / 비즈니스 로직 적음)**입니다.

| 레이어 (Layer) | 역할 및 포함 범위 | 예시 컴포넌트 / 로직 |
|---|---|---|
| **1. app** | 애플리케이션 전체 초기화, 프로바이더, 글로벌 스타일, 라우터 설정 | `providers/`, `styles/`, `store/` |
| **2. processes** | (선택적) 여러 페이지에 걸쳐 복잡한 비즈니스 프로세스 제어 | `checkout-process/` |
| **3. pages** | 라우팅되는 개별 페이지 (화면 조합) | `home-page/`, `product-detail-page/` |
| **4. widgets** | 독립된 완결성 있는 대형 UI 블록 (Page 구성 단위) | `header/`, `sidebar/`, `product-grid/` |
| **5. features** | 사용자 비즈니스 가치를 만드는 인터랙션 기능 | `add-to-cart/`, `search-products/`, `auth-by-email/` |
| **6. entities** | 도메인 모델, 엔티티 데이터 상태, 도메인 UI 카드 | `user/`, `product/`, `order/` |
| **7. shared** | 비즈니스 로직이 없는 재사용 가능 공통 모듈 | `ui/` (Button, Input), `api/`, `lib/` |

---

## 3. 모듈 의존성 및 단방향 참조 원칙

> ⚠️ **엄격한 규칙**: 상위 레이어는 하위 레이어만 import할 수 있으며, **하위 레이어는 절대로 상위 레이어를 참조할 수 없습니다.**

```
[app] ────► [pages] ────► [widgets] ────► [features] ────► [entities] ────► [shared]
                                                                                ▲
                                                                                │ (단방향만 허용)
```

- ✅ `features/add-to-cart`에서 `entities/product`의 모델이나 `shared/ui/GlassButton`을 가져올 수 있습니다.
- ❌ `entities/product`에서 `features/add-to-cart`를 import하는 것은 **금지**됩니다.
- ❌ 동일한 레이어의 Slice 간 직접 참조(Cross-Import)는 금지하며, 필요시 상위 레이어에서 조합합니다.

---

## 4. 실전 FSD 폴더 트리 예시

```
src/
├── app/                      # Next.js App Router (또는 앱 전역 설정)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── processes/                # 복잡한 프로세스
│   └── checkout/
│
├── pages/                    # 페이지 단위 컴포넌트
│   ├── home/
│   │   └── ui/HomePage.tsx
│   └── product-detail/
│
├── widgets/                  # 대형 UI 블록
│   ├── header/
│   │   └── ui/Header.tsx
│   └── product-grid/
│
├── features/                 # 비즈니스 인터랙션 기능
│   ├── add-to-cart/
│   │   ├── ui/AddToCartButton.tsx
│   │   └── model/useAddToCart.ts
│   └── filter-by-category/
│
├── entities/                 # 비즈니스 엔티티 (도메인)
│   ├── product/
│   │   ├── ui/ProductCard.tsx
│   │   ├── model/types.ts
│   │   └── api/productApi.ts
│   └── user/
│
└── shared/                   # 재사용 공통 모듈
    ├── ui/                   # Button, Input, Modal, Card 등
    │   ├── GlassButton.tsx
    │   └── GlassInput.tsx
    ├── api/                  # Axios / Fetch client
    │   └── apiClient.ts
    └── lib/                  # 유틸 함수 (utils.ts, format.ts)
```

---

## 5. Next.js App Router와의 매핑 전략

Next.js 13+ App Router는 파일 시스템 기반 라우팅을 강제하므로, `app/` 디렉토리는 **라우팅 래퍼 역할**만 수행하고 실제 비즈니스 뷰 컴포넌트는 `src/pages/` 또는 `src/widgets/`에 위임합니다.

```tsx
// src/app/products/[id]/page.tsx (Next.js App Router)
import { ProductDetailPage } from '@/pages/product-detail';

export default function Page({ params }: { params: { id: string } }) {
  return <ProductDetailPage productId={params.id} />;
}
```
