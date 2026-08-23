import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: "Nene's Little World", description: 'บันทึกความทรงจำของเนเน่' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="th"><body>{children}</body></html>; }
