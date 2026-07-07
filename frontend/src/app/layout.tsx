import type { Metadata } from "next";
import "./globals.css";
import { 
  LayoutDashboard, 
  Database, 
  BrainCircuit, 
  ShieldCheck, 
  Bot 
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hexaware AI-Ready Platform",
  description: "Enterprise Data and AI Platform powered by Databricks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="layout-container">
          <aside className="sidebar">
            <div className="logo-container">
              <div className="logo-icon">
                <BrainCircuit size={32} />
              </div>
              <div className="logo-text">Hexaware AI</div>
            </div>
            
            <nav className="nav-links">
              <Link href="/" className="nav-link active">
                <LayoutDashboard size={20} />
                Dashboard
              </Link>
              <Link href="#" className="nav-link">
                <Database size={20} />
                Data Pipelines (DLT)
              </Link>
              <Link href="#" className="nav-link">
                <Bot size={20} />
                Retail Copilot
              </Link>
              <Link href="#" className="nav-link">
                <BrainCircuit size={20} />
                Model Serving
              </Link>
              <Link href="#" className="nav-link">
                <ShieldCheck size={20} />
                Governance & Security
              </Link>
            </nav>
          </aside>
          
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
