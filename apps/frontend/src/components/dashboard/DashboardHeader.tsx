
"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Home, Bot, ScrollText, UserPlus, User, FileText, Sparkles, Menu, BrainCircuit, ClipboardList } from "lucide-react";
import { ColorSwitcher } from "../theme/ColorSwitcher";
import { Button } from "../ui/button";
import { ClientOnly } from "../shared/ClientOnly";

const viewMap: { [key: string]: { title: string; icon: React.ReactElement } } = {
  dashboard: { title: "Dashboard", icon: <Home className="h-5 w-5" /> },
  "train-avatar": { title: "Train Avatar", icon: <BrainCircuit className="h-5 w-5" /> },
  docs: { title: "Documentation", icon: <FileText className="h-5 w-5" /> },
  "create-avatar": { title: "Create Avatar", icon: <Sparkles className="h-5 w-5" /> },
  "invite": { title: "Invite Participant", icon: <UserPlus className="h-5 w-5" /> },
  "training-results": { title: "Training Results", icon: <ClipboardList className="h-5 w-5" /> },
  profile: { title: "User Profile", icon: <User className="h-5 w-5" /> },
};

interface DashboardHeaderProps {
  onMobileMenuClick: () => void;
}

export function DashboardHeader({ onMobileMenuClick }: DashboardHeaderProps) {
  const searchParams = useSearchParams();
  const [currentView, setCurrentView] = useState<{ title: string; icon: React.ReactElement }>({
    title: "Dashboard",
    icon: <Home className="h-5 w-5 text-black" />,
  });

  useEffect(() => {
    const view = searchParams.get("view") || "dashboard";
    setCurrentView(viewMap[view] || viewMap.dashboard);
  }, [searchParams]);

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/10 bg-neutral-950/60 backdrop-blur-xl px-4 md:px-6 rounded-t-2xl">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-foreground hover:bg-white/10"
          onClick={onMobileMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="text-primary hidden md:flex h-9 w-9 items-center justify-center rounded-full border border-primary/40 bg-primary/10 shadow-[0_0_12px_rgba(0,102,255,0.25)]">{currentView.icon}</div>
        <div className="flex flex-col leading-tight">
          <h1 className="text-md font-semibold text-foreground" style={{ color: 'var(--dynamic-text-color)' }}>
            {currentView.title}
          </h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Manage avatars, memory, and training from one workspace
          </p>
        </div>
      </div>
      <div className="flex items-center">
        <ClientOnly>
          <ColorSwitcher />
        </ClientOnly>
      </div>
    </header>
  );
}
