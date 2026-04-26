import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'PostPilot — Enterprise LinkedIn Automation',
  description: 'AI-powered LinkedIn content automation for Bitloom | Powered by Creatio + Claude AI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="antialiased h-full">
        <Sidebar />
        <main className="ml-64 min-h-screen bg-surface-subtle">
          <div className="min-h-screen">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
