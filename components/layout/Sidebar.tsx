'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { LayoutDashboard, PenLine, Clock, History, Zap } from 'lucide-react';

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/generate', label: 'Generate Post', icon: PenLine },
  { href: '/scheduled', label: 'Scheduled', icon: Clock },
  { href: '/posts', label: 'All Posts', icon: History },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-200 flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
        <div className="w-8 h-8 bg-linkedin rounded flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-bold text-linkedin-dark text-sm leading-tight">PostPilot</div>
          <div className="text-xs text-gray-400">by Bitloom</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-linkedin-light text-linkedin'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-linkedin' : 'text-gray-400')} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-linkedin flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            B
          </div>
          <div>
            <div className="text-xs font-medium text-gray-700">Bitloom</div>
            <div className="text-xs text-gray-400">piyush@bitloom.ai</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
