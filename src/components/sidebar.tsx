'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Database,
  ArrowLeftRight,
  CheckCircle2,
  Package,
  Send,
  FileText,
} from 'lucide-react';
import { Logo } from './logo';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Database, label: 'Origem dos Dados', href: '/origem' },
  { icon: ArrowLeftRight, label: 'Transformação', href: '/transformacao' },
  { icon: CheckCircle2, label: 'Validação', href: '/validacao' },
  { icon: Package, label: 'Remessa', href: '/remessa' },
  { icon: Send, label: 'Envio ao TCE', href: '/envio' },
  { icon: FileText, label: 'Logs', href: '/logs' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center border-b border-sidebar-border px-6">
          <div className="flex items-center gap-2">
            <Logo size={44} />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">
                Sync
              </span>
              <span className="text-xs text-muted-foreground">TCE-MS POC</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <div className="rounded-lg bg-sidebar-accent p-3">
            <p className="text-xs text-sidebar-accent-foreground/70">
              Versão 1.0.0 - POC
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
