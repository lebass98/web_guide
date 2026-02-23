import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'QR Code Generator - WebTools',
  description: 'Create ready-to-use QR codes instantly.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
