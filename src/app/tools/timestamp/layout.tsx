import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '타임스탬프 변환기 - WebTools',
  description: 'Unix 타임스탬프를 읽기 쉬운 형식으로 변환하세요.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
