import 'katex/dist/katex.min.css';
import './globals.css';
import '@xyflow/react/dist/style.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hanabi Study',
  icons: { icon: '/brand/hanabi-normal.png', apple: '/brand/hanabi-normal.png' },
  description: 'FRC Team 9494 Hanabi - engineering study dashboard.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ja"><body>{children}</body></html>;
}
