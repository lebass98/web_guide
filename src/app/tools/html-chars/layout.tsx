import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HTML 특수문자 변환 - WebTools',
  description: 'HTML 엔티티를 쉽게 제거하거나 변환하세요.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
