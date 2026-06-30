"use client";

import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col h-screen text-foreground antialiased bg-gradient-to-br from-[#f2eded] via-[#e6eff8] to-[#ebe5e1] bg-fixed">
        <TooltipProvider>
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6 relative z-0">
            {children}
          </main>
        </TooltipProvider>
      </body>
    </html>
  );
}