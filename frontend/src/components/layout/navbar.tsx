"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const ROUTE_LABELS: Record<string, string> = {
  "": "Dashboard",
  upload: "Upload",
  pipeline: "Pipeline",
  data: "Data Explorer",
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  explore: "Data Explorer",
  lineage: "Data Lineage",
  quality: "Data Quality",
  embeddings: "Embeddings",
  chat: "Chat",
  architecture: "Architecture",
  settings: "Settings",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link href="/" className="hover:text-foreground transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {segments.map((seg, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/");
        const label = ROUTE_LABELS[seg] || seg;
        const isLast = i === segments.length - 1;

        return (
          <span key={href} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3" />
            {isLast ? (
              <span className="text-foreground font-medium">{label}</span>
            ) : (
              <Link href={href} className="hover:text-foreground transition-colors">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function Navbar() {
  return (
    <header className="h-12 border-b flex items-center px-6 bg-card shrink-0">
      <Breadcrumbs />
      <div className="ml-auto flex items-center gap-3">
        <span className="text-[11px] text-muted-foreground">v0.1.0</span>
      </div>
    </header>
  );
}