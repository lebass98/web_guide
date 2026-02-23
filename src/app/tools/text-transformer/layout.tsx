import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Text Transformer - WebTools',
  description: 'Uppercase, lowercase, replace, and transform text.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
