import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'Hanabi Study English', description: '毎日使える英単語帳' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="ja"><body>{children}</body></html>; }
