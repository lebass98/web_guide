import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Color Converter - WebTools',
  description: 'Convert HEX, RGB, HSL color codes with ease.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
