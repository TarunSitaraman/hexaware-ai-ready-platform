"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Globe, Database, ArrowRight, ShieldCheck, Activity } from "lucide-react";

export default function IngestionPage() {
  const router = useRouter();
  const [isIngesting, setIsIngesting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ingested, setIngested] = useState(false);

  const handleIngest = async () => {
    setIsIngesting(true);
    setProgress(15);
    // Simulate API connection and data pull
    await new Promise((r) => setTimeout(r, 1000));
    setProgress(45);
    await new Promise((r) => setTimeout(r, 1500));
    setProgress(85);
    await new Promise((r) => setTimeout(r, 800));
    setProgress(100);
    setIsIngesting(false);
    setIngested(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Automated Ingestion Engine</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Pull the latest macroeconomic data directly from trusted external APIs (World Bank, FRED). No manual uploads required.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="premium-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" /> Global Macro Data
            </CardTitle>
            <CardDescription>World Bank API (wbgapi)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between"><span>Status:</span> <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Connected</Badge></div>
              <div className="flex justify-between"><span>Indicators:</span> <span className="font-medium text-foreground">GDP, Inflation, Unemployment, Interest</span></div>
              <div className="flex justify-between"><span>Target:</span> <span className="font-medium text-foreground">ADLS Gen2 /raw-zone/world_bank</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" /> US Economic Data
            </CardTitle>
            <CardDescription>Federal Reserve (FRED API)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between"><span>Status:</span> <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Connected</Badge></div>
              <div className="flex justify-between"><span>Indicators:</span> <span className="font-medium text-foreground">CPI, Real GDP, Fed Funds Rate</span></div>
              <div className="flex justify-between"><span>Target:</span> <span className="font-medium text-foreground">ADLS Gen2 /raw-zone/fred</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="premium-shadow">
        <CardContent className="pt-6">
          {!ingested ? (
            <div className="text-center py-6">
              <Activity className="h-12 w-12 text-primary/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Ready to Synchronize</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Trigger the orchestrator to fetch the latest 2018-2025 data across all configured connectors.
              </p>
              
              {isIngesting ? (
                <div className="space-y-4 max-w-md mx-auto">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground animate-pulse">Connecting to APIs and writing to ADLS Gen2...</p>
                </div>
              ) : (
                <Button onClick={handleIngest} size="lg" className="w-full max-w-sm">
                  Run Automated Ingestion
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-medium mb-1">Ingestion Complete</h3>
              <p className="text-sm text-muted-foreground mb-8">Successfully pulled 88 new records into the Bronze landing zone.</p>
              
              <div className="grid grid-cols-3 gap-6 w-full max-w-2xl mb-8">
                <div className="text-center p-4 rounded-lg bg-slate-50 border">
                  <p className="text-xs text-muted-foreground mb-1">Rows Fetched</p>
                  <p className="text-2xl font-bold">88</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-50 border border-green-100">
                  <p className="text-xs text-green-700 mb-1 flex items-center justify-center gap-1"><ShieldCheck className="h-3 w-3"/> Quality Score</p>
                  <p className="text-2xl font-bold text-green-700">92%</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-slate-50 border">
                  <p className="text-xs text-muted-foreground mb-1">Data Trust Metric</p>
                  <p className="text-2xl font-bold">High</p>
                </div>
              </div>

              <Button onClick={() => router.push(`/pipeline?dataset=api_sync_123`)} className="px-8">
                View in Pipeline <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}