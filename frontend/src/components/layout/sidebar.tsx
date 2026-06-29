"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Upload, GitBranch, Database, Shield,
  Brain, MessageSquare, Building2, Settings, ChevronDown, Layers,
} from "lucide-react";
import { useState } from "react";

const navSections = [
  {
    label: "Overview",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/upload", label: "Upload", icon: Upload },
      { href: "/pipeline", label: "Pipeline", icon: GitBranch },
    ],
  },
  {
    label: "Data Layers",
    items: [
      { href: "/data/bronze", label: "Bronze", icon: Database },
      { href: "/data/silver", label: "Silver", icon: Database },
      { href: "/data/gold", label: "Gold", icon: Database },
      { href: "/quality", label: "Quality", icon: Shield },
    ],
  },
  {
    label: "AI",
    items: [
      { href: "/embeddings", label: "Embeddings", icon: Brain },
      { href: "/chat", label: "Chat", icon: MessageSquare },
    ],
  },
  {
    label: "Platform",
    items: [
      { href: "/architecture", label: "Architecture", icon: Building2 },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleSection = (label: string) => {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className="w-56 border-r bg-card flex flex-col shrink-0">
      <div className="p-4 border-b">
        <Link href="/">
          <h1 className="font-bold text-base flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI-Ready Data
          </h1>
        </Link>
        <p className="text-[10px] text-muted-foreground mt-0.5">Macroeconomic Advisory MVP</p>
      </div>
      <nav className="flex-1 p-2 space-y-4 overflow-y-auto">
        {navSections.map((section) => {
          const isSectionCollapsed = collapsed[section.label] ?? false;
          const anyActive = section.items.some(
            (item) => pathname === item.href || pathname.startsWith(item.href + "/")
          );

          return (
            <div key={section.label}>
              <button
                onClick={() => toggleSection(section.label)}
                className="flex items-center justify-between w-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className={anyActive ? "text-foreground" : ""}>{section.label}</span>
                <ChevronDown
                  className={cn("h-3 w-3 transition-transform", isSectionCollapsed && "-rotate-90")}
                />
              </button>
              {!isSectionCollapsed && (
                <div className="space-y-0.5 mt-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="p-3 border-t">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          System Online
        </div>
      </div>
    </aside>
  );
}