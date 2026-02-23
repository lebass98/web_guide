import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Timestamp Converter - WebTools',
  description: 'Convert Unix epoch times to human-readable dates.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
