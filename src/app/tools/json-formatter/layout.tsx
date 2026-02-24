import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JSON 포매터 - WebTools',
  description: 'JSON 데이터를 포맷, 검증 및 정렬하세요.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
