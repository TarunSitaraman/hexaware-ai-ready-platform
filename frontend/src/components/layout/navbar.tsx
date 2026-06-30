"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { 
  Brain, ChevronDown, Database, LayoutDashboard, Download, 
  GitBranch, Shield, Layers, MessageSquare, Building2, Settings,
  Sparkles, Menu, X, ArrowRight
} from "lucide-react";

// Veritas Macro navigation links
const navigationLinks = [
  {
    label: "Overview",
    gridCols: 1,
    items: [
      { href: "/", label: "Dashboard", description: "Overall system stats and ingestion records", icon: LayoutDashboard },
      { href: "/upload", label: "Ingestion Hub", description: "Upload raw macroeconomic source CSVs", icon: Download },
      { href: "/pipeline", label: "Pipeline Runner", description: "Process data through Medallion stages", icon: GitBranch },
    ],
  },
  {
    label: "Data Layers",
    gridCols: 2,
    items: [
      { href: "/data/bronze", label: "Bronze Layer", description: "Raw landing storage validation logs", icon: Database },
      { href: "/data/silver", label: "Silver Layer", description: "Standardized and cleaned transaction records", icon: Database },
      { href: "/data/gold", label: "Gold Layer", description: "Optimized, aggregate macroeconomic series", icon: Database },
      { href: "/data/explore", label: "Data Explorer", description: "Multi-country interactive chart visualizer", icon: Layers },
      { href: "/data/lineage", label: "Data Lineage", description: "Trace record ledger hashes and timeline logs", icon: GitBranch },
      { href: "/quality", label: "Quality Center", description: "Schema checks, metrics, and anomaly detection", icon: Shield },
    ],
  },
  {
    label: "AI Platform",
    gridCols: 2,
    items: [
      { href: "/embeddings", label: "Embeddings Inspector", description: "Track generated text chunks and raw vectors", icon: Brain },
      { href: "/chat", label: "Macro Advisor", description: "Ground-truth RAG macroeconomic chatbot", icon: MessageSquare },
      { href: "/architecture", label: "Architecture", description: "Medallion ETL and AI pipeline blueprints", icon: Building2 },
      { href: "/settings", label: "Settings", description: "Configure API access keys and sync options", icon: Settings },
    ],
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close menus on path change
  useEffect(() => {
    setActiveMenu(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleMouseEnter = (menuLabel: string) => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setActiveMenu(menuLabel);
  };

  const handleMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 150); // slight delay to prevent flickering
  };

  return (
    <header className="sticky top-0 z-50 px-6 py-3 w-full shrink-0 bg-white/40 dark:bg-black/30 backdrop-blur-2xl border-b border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.06)] relative overflow-visible">
      {/* Liquid glass specular highlight overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 dark:from-white/5 to-transparent pointer-events-none z-[-1]" />
      <div className="relative z-10 max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
              <Sparkles className="h-4.5 w-4.5 text-primary animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-wide text-foreground uppercase">Macro Advisor</span>
              <span className="text-[10px] text-muted-foreground -mt-0.5">Macroeconomic Analytics</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigationLinks.map((group) => {
              const isGroupActive = group.items.some(
                (item) => pathname === item.href || pathname.startsWith(item.href + "/")
              );
              const isOpen = activeMenu === group.label;

              return (
                <div
                  key={group.label}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(group.label)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className={cn(
                      "flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      isGroupActive && "text-primary font-semibold"
                    )}
                  >
                    {group.label}
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")} />
                  </button>

                  {/* Dropdown Menu Panel */}
                  {isOpen && (
                    <div className="absolute left-0 mt-1.5 w-max rounded-xl border bg-popover p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className={cn(
                        "grid gap-4",
                        group.gridCols === 2 ? "grid-cols-2 w-[480px]" : "grid-cols-1 w-80"
                      )}>
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          const isItemActive = pathname === item.href || pathname.startsWith(item.href + "/");

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={cn(
                                "flex items-start gap-3 p-2 rounded-lg transition-colors hover:bg-muted text-left",
                                isItemActive && "bg-primary/5 text-primary"
                              )}
                            >
                              <div className="mt-0.5">
                                <Icon className="h-4.5 w-4.5" />
                              </div>
                              <div className="space-y-0.5">
                                <div className="text-xs font-semibold">{item.label}</div>
                                <div className="text-[10px] text-muted-foreground leading-normal">{item.description}</div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-accent rounded-md text-foreground"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t mt-3 pt-3 space-y-4 animate-in slide-in-from-top-4 duration-200">
          {navigationLinks.map((group) => (
            <div key={group.label} className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2">{group.label}</div>
              <div className="grid grid-cols-2 gap-2">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isItemActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg text-xs hover:bg-muted",
                        isItemActive && "bg-primary/10 text-primary font-medium"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}