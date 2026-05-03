'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import {
  LayoutDashboard, PenLine, Clock, BookOpen,
  Newspaper, BarChart2, Settings, Zap,
  ChevronRight, CalendarDays, FlaskConical,
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { href: '/generate', label: 'Generate Post', icon: PenLine },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/posts', label: 'All Posts', icon: BookOpen },
      { href: '/scheduled', label: 'Scheduled', icon: Clock },
      { href: '/schedule', label: 'Auto-Schedule', icon: CalendarDays },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { href: '/news', label: 'News Feed', icon: Newspaper },
      { href: '/analytics', label: 'Analytics', icon: BarChart2 },
    ],
  },
  {
    label: 'Automation',
    items: [
      { href: '/poc', label: 'Automation Builder', icon: FlaskConical },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar-bg flex flex-col z-40 border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-linkedin to-sky-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-linkedin/20">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-bold text-white text-sm leading-tight tracking-tight">PostPilot</div>
          <div className="text-[11px] text-slate-500 font-medium">Enterprise · by Bitloom</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            <div className="px-3 mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-section-header">
                {section.label}
              </span>
            </div>
            <div className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon, exact }) => {
                const active = isActive(pathname, href, exact);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                      active
                        ? 'text-white bg-[#1E3A5F] border border-[#0A66C2]/25 shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-sidebar-hover',
                    )}
                  >
                    <Icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-linkedin' : '')} />
                    <span className="flex-1">{label}</span>
                    {active && <ChevronRight className="w-3 h-3 text-linkedin/60" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* System status */}
      <div className="px-4 py-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
          <span className="text-[11px] text-slate-500">System operational</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-linkedin to-sky-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            B
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-300 truncate">Bitloom</div>
            <div className="text-[11px] text-slate-500 truncate">piyush@bitloom.ai</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
