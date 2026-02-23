import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Base64 Encoder/Decoder - WebTools',
  description: 'Encode or decode Base64 strings safely.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
