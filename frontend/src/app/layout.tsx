"use client";

import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex h-screen bg-gradient-to-br from-rose-50/50 via-white to-red-50/30 text-slate-900 antialiased">
        <TooltipProvider>
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 bg-white/50 backdrop-blur-3xl">
            <Navbar />
            <main className="flex-1 overflow-y-auto p-6">
              {children}
            </main>
          </div>
        </TooltipProvider>
      </body>
    </html>
  );
}