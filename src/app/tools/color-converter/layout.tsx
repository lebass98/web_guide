import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '색상 변환기 - WebTools',
  description: 'HEX, RGB, HSL 색상 코드를 쉽게 변환하세요.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
