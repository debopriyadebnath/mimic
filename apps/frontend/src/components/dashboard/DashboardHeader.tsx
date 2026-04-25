
"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Home, Bot, FileText, UserPlus, User, Sparkles, Menu, BrainCircuit, ClipboardList } from "lucide-react";
import { ColorSwitcher } from "../theme/ColorSwitcher";
import { Button } from "../ui/button";
import { ClientOnly } from "../shared/ClientOnly";

const viewMap: Record<string, { title: string; icon: React.ReactElement }> = {
  dashboard:         { title: "Dashboard",       icon: <Home className="h-4 w-4" />         },
  "train-avatar":    { title: "Train Avatar",    icon: <BrainCircuit className="h-4 w-4" /> },
  docs:              { title: "Documentation",   icon: <FileText className="h-4 w-4" />      },
  "create-avatar":   { title: "Create Avatar",   icon: <Sparkles className="h-4 w-4" />     },
  invite:            { title: "Invite Trainer",  icon: <UserPlus className="h-4 w-4" />     },
  "training-results":{ title: "Training Results",icon: <ClipboardList className="h-4 w-4" />},
  profile:           { title: "Profile",         icon: <User className="h-4 w-4" />          },
};

interface DashboardHeaderProps {
  onMobileMenuClick: () => void;
}

export function DashboardHeader({ onMobileMenuClick }: DashboardHeaderProps) {
  const searchParams = useSearchParams();
  const [currentView, setCurrentView] = useState(viewMap.dashboard);

  useEffect(() => {
    const view = searchParams.get("view") || "dashboard";
    setCurrentView(viewMap[view] ?? viewMap.dashboard);
  }, [searchParams]);

  return (
    <header className="flex h-14 items-center justify-between border-b border-white/[0.06] bg-black/30 backdrop-blur-xl px-4 md:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-8 w-8 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06]"
          onClick={onMobileMenuClick}
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Icon badge */}
        <div className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary shadow-[0_0_10px_rgba(0,102,255,0.2)]">
          {currentView.icon}
        </div>

        {/* Title area */}
        <div className="flex flex-col leading-none">
          <span className="text-sm font-medium text-white/85" style={{ color: 'var(--dynamic-text-color)' }}>
            {currentView.title}
          </span>
          <span className="text-[11px] text-white/30 hidden sm:block mt-0.5">
            Manage avatars, memory &amp; training
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        <ClientOnly>
          <ColorSwitcher />
        </ClientOnly>
      </div>
    </header>
  );
}
