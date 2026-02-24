import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '텍스트 변환기 - WebTools',
  description: '대문자, 소문자, 치환 등 텍스트를 변환하세요.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
