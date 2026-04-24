'use client';
import { SidebarDemo } from '@/components/ui/aceternity-sidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import React, { useState } from 'react';
import Image from 'next/image';
import { FloatingDots } from '@/components/dashboard/FloatingDots';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { BackendUserSync } from '@/components/auth/BackendUserSync';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="h-screen w-full overflow-hidden">
      <BackendUserSync />
      <div className="fixed inset-0 z-0">
        <Image
          src="https://i.pinimg.com/originals/29/c7/c9/29c7c98a6be6f7401416d3653cb68907.gif"
          alt="Dashboard background"
          fill
          className="object-cover animate-glow scale-110"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.15),transparent_35%)]" />
        <FloatingDots />
      </div>
      <div className={cn("relative z-10 flex h-full w-full", isMobile && 'flex-col')}>
        <SidebarDemo isMobileNavOpen={isMobileNavOpen} setIsMobileNavOpen={setIsMobileNavOpen} />
        <div className={cn(
          "flex flex-1 flex-col overflow-hidden bg-transparent transition-all duration-300",
          isMobileNavOpen && isMobile && "blur-sm"
        )}>
          <DashboardHeader onMobileMenuClick={() => setIsMobileNavOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="mx-auto max-w-7xl w-full min-h-full perspective-container rounded-2xl border border-white/10 bg-black/25 backdrop-blur-md p-4 md:p-6 shadow-2xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
