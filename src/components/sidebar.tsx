'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  ShieldCheck,
  Database,
  Package,
  FileText,
  Settings,
  ChevronDown,
  X,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Logo } from './logo';
import { useState, useEffect, useMemo } from 'react';
import { useSidebar } from '@/contexts/sidebar-context';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import type { UserRole } from '@/types';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
  submenu?: { label: string; href: string }[];
  roles?: UserRole[]; // Se não definido, todos os roles podem ver
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Building2, label: 'Unidades Gestoras', href: '/unidades' },
  { icon: ShieldCheck, label: 'Regras de Validação', href: '/regras' },
  { icon: Database, label: 'Dados Recebidos', href: '/dados' },
  { icon: Package, label: 'Remessas', href: '/remessas' },
  {
    icon: FileText,
    label: 'Logs',
    href: '/logs',
    submenu: [
      { label: 'Comunicação', href: '/logs?tab=comunicacao' },
      { label: 'Auditoria', href: '/logs?tab=auditoria' },
    ],
  },
  {
    icon: Users,
    label: 'Usuários',
    href: '/usuarios',
    roles: ['ADMIN', 'MANAGER'], // Apenas ADMIN e MANAGER podem ver
  },
  { icon: Settings, label: 'Endpoints', href: '/endpoints' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['/logs']);
  const { isOpen, close } = useSidebar();
  const { user } = useAuth();

  // Filtra os itens de menu baseado no role do usuário
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Se o item não tem restrição de roles, mostra para todos
      if (!item.roles) return true;
      // Se o usuário não está logado, não mostra itens restritos
      if (!user) return false;
      // Verifica se o role do usuário está na lista permitida
      return item.roles.includes(user.role);
    });
  }, [user]);

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href)
        ? prev.filter((item) => item !== href)
        : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href.split('?')[0]);
  };

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    close();
  }, [pathname, close]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay - Mobile only */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={close}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-72 border-r border-sidebar-border bg-sidebar',
          'transition-transform duration-300 ease-in-out',
          // Mobile: slide in/out
          'lg:translate-x-0 lg:w-64',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4 lg:px-6">
            <Link href="/" className="flex items-center gap-3">
              <Logo size={42} />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-sidebar-foreground">
                  e-Sfinge Sync
                </span>
                <span className="text-xs text-muted-foreground">
                  TCE-MS PoC
                </span>
              </div>
            </Link>
            {/* Close button - Mobile only */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={close}
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isExpanded = expandedItems.includes(item.href);

              return (
                <div key={item.href}>
                  {hasSubmenu ? (
                    <button
                      onClick={() => toggleExpand(item.href)}
                      className={cn(
                        'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        active
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </div>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform',
                          isExpanded && 'rotate-180'
                        )}
                      />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        active
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  )}

                  {/* Submenu */}
                  {hasSubmenu && isExpanded && (
                    <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-4">
                      {item.submenu?.map((subitem) => (
                        <Link
                          key={subitem.href}
                          href={subitem.href}
                          className={cn(
                            'block rounded-lg px-3 py-2 text-sm transition-colors',
                            pathname +
                              (typeof window !== 'undefined'
                                ? window.location.search
                                : '') ===
                              subitem.href
                              ? 'bg-sidebar-accent/50 text-sidebar-accent-foreground'
                              : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground'
                          )}
                        >
                          {subitem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-sidebar-border p-4">
            <div className="rounded-lg bg-sidebar-accent/50 p-3">
              <p className="text-xs text-sidebar-accent-foreground/70">
                Versão 1.0.0 - PoC
              </p>
              <p className="text-xs text-sidebar-accent-foreground/50 mt-1">
                Ambiente de demonstração
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
