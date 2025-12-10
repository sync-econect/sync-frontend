'use client';

import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      <Sidebar />
      {/* Main content - adjust margin for desktop sidebar */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <Topbar />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
