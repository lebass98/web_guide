# 🔐 auth-setup.md (인증 및 권한 설정 모듈)

이 문서는 React / Next.js 애플리케이션에서 사용자 인증(Authentication), 토큰 갱신 메커니즘, 인가(Authorization) 및 역할 기반 접근 제어(RBAC)를 구현하기 위한 표준 가이드 문서입니다.

---

## 📑 목차 (Table of Contents)
1. [인증 시스템 아키텍처 (JWT Flow)](#1-인증-시스템-아키텍처-jwt-flow)
2. [Zustand 기반 Auth Store](#2-zustand-기반-auth-store)
3. [Axios Interceptor 토큰 자동 갱신](#3-axios-interceptor-토큰-자동-갱신)
4. [라우트 가드 & Role-Based Access Control](#4-라우트-가드--role-based-access-control)
5. [컴포넌트 구현 예시 및 주석](#5-컴포넌트-구현-예시-및-주석)

---

## 1. 인증 시스템 아키텍처 (JWT Flow)

보안을 위해 **Access Token (In-Memory / State)** 및 **Refresh Token (HttpOnly Cookie)** 전략을 사용합니다.

```
[클라이언트 (React)]                      [인증 서버 (Backend)]
       │                                         │
       │ 1. POST /api/auth/login                 │
       ├────────────────────────────────────────►│
       │ 2. Response: AccessToken & Cookie       │
       │◄────────────────────────────────────────┤ (Refresh Token은 HttpOnly 쿠키 저장)
       │                                         │
       │ 3. API 요청 (Header: Bearer Token)       │
       ├────────────────────────────────────────►│
       │ 4. 401 Unauthorized 발생 시            │
       │    POST /api/auth/refresh 자동 호출    │
       ├────────────────────────────────────────►│
       │ 5. 새 AccessToken 발급 및 재요청         │
       │◄────────────────────────────────────────┤
```

---

## 2. Zustand 기반 Auth Store

```typescript
/**
 * @file authStore.ts
 * @description 사용자 인증 상태 및 권한 정보를 관리하는 Zustand 스토어
 */

import { create } from 'zustand';

export type UserRole = 'ADMIN' | 'MANAGER' | 'USER';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserProfile, token: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  // 로그인 성공 시 사용자 정보 및 토큰 바인딩
  setAuth: (user, token) =>
    set({
      user,
      accessToken: token,
      isAuthenticated: true,
    }),

  // 토큰 갱신 시
  setAccessToken: (token) =>
    set({
      accessToken: token,
    }),

  // 로그아웃 시 상태 초기화
  logout: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    }),
}));
```

---

## 3. Axios Interceptor 토큰 자동 갱신

```typescript
/**
 * @file apiClient.ts
 * @description HTTP 요청 인터셉터 및 401 발생 시 Refresh Token 자동 재발급 로직
 */

import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // HttpOnly Refresh Token 쿠키 전송 허용
});

// 1. Request Interceptor: 모든 API 요청 시 Authorization 헤더 자동 주입
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Response Interceptor: 401 갱신 실패 처리
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 Unauthorized 및 재시도 하지 않은 요청일 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh Token으로 새 Access Token 발급 요청
        const refreshRes = await axios.post(
          '/api/auth/refresh',
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshRes.data.accessToken;
        useAuthStore.getState().setAccessToken(newAccessToken);

        // 이전 실패했던 요청 헤더 갱신 후 재시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 토큰 재발급 실패 시 강제 로그아웃
        useAuthStore.getState().logout();
        window.location.href = '/login?expired=true';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

---

## 4. 라우트 가드 & Role-Based Access Control

### 🛡️ `ProtectedRoute.tsx` (권한 체크 라우트 래퍼)

```tsx
/**
 * @file ProtectedRoute.tsx
 * @description 로그인 여부 및 역할(Role) 기반 페이지 접근 제한 라우트 가드 컴포넌트
 */

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, UserRole } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[]; // 허용된 권한 목록 (미지정 시 로그인 사용자 전체 허용)
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // 1. 미인증 사용자 로그인 페이지로 리다이렉트
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    // 2. 권한 불일치 시 접근 거부 페이지로 이동
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.replace('/unauthorized');
    }
  }, [isAuthenticated, user, allowedRoles, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center glass">
        <p className="text-sm font-semibold text-muted-foreground animate-pulse">
          인증 정보를 확인하는 중입니다...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
```
