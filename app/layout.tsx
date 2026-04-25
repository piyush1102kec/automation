import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'PostPilot — LinkedIn Content Automation',
  description: 'AI-powered LinkedIn post generation for Bitloom',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Sidebar />
        <main className="ml-60 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
