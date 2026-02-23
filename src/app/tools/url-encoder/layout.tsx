import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'URL Encoder/Decoder - WebTools',
  description: 'Quickly encode or decode URI components.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
