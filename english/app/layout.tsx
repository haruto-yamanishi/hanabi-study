import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hanabi Study English',
  description: '英検準1級・TOEFL・SAT向けの英単語学習',
  icons: { icon: '/brand/hanabi-normal.png', apple: '/brand/hanabi-normal.png' },
};
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="ja"><body>{children}</body></html>; }
