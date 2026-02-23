import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JSON Formatter - WebTools',
  description: 'Format, validate, and beautify JSON data.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
