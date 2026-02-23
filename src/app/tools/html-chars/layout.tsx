import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HTML Special Chars - WebTools',
  description: 'Easily remove or convert HTML entities.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
