"use client";

import { useDatasets, usePipelineHistory } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Upload, Database, GitBranch, Shield, TrendingUp,
  CircleDollarSign, ArrowRight, FileText,
} from "lucide-react";
import Link from "next/link";
import { formatBytes, formatDuration, cn } from "@/lib/utils";
import { STATUS_BADGES, LAYER_COLORS } from "@/lib/constants";

function MetricCard({ title, value, subtitle, icon: Icon, trend }: {
  title: string; value: string | number; subtitle?: string; icon: React.ElementType;
  trend?: { value: number; label: string };
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
          {trend && (
            <Badge variant="secondary" className={cn("text-[10px]", trend.value >= 0 ? "text-emerald-600" : "text-red-600")}>
              {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: datasets } = useDatasets();
  const { data: history } = usePipelineHistory();

  const totalDatasets = datasets?.datasets?.length ?? 0;
  const runs = history?.runs ?? [];
  const lastRun = runs[0];
  const datasetsArr = datasets?.datasets ?? [];

  const totalBronze = datasetsArr.reduce((s, d) => s + (d.bronze_count ?? 0), 0);
  const totalSilver = datasetsArr.reduce((s, d) => s + (d.silver_count ?? 0), 0);
  const totalGold = datasetsArr.reduce((s, d) => s + (d.gold_count ?? 0), 0);
  const successRate = runs.length > 0
    ? Math.round((runs.filter((r) => r.status === "completed").length / runs.length) * 100)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">AI-Ready Data Platform — Macroeconomic Advisory</p>
        </div>
        <div className="flex gap-2">
          <Link href="/upload">
            <Button size="sm"><Upload className="mr-2 h-4 w-4" />Upload</Button>
          </Link>
          <Link href="/chat">
            <Button variant="secondary" size="sm"><ArrowRight className="mr-2 h-4 w-4" />Ask AI</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Datasets" value={totalDatasets} subtitle="Uploaded" icon={Database}
          trend={totalDatasets > 0 ? { value: totalDatasets * 100, label: "active" } : undefined} />
        <MetricCard title="Pipeline Runs" value={runs.length} subtitle={lastRun ? `Last: ${lastRun.status}` : "No runs"} icon={GitBranch}
          trend={successRate !== null ? { value: successRate, label: "success rate" } : undefined} />
        <MetricCard title="Bronze Records" value={totalBronze.toLocaleString()} subtitle="Schema-on-read" icon={FileText}
          trend={totalSilver > 0 ? { value: Math.round((totalSilver / Math.max(totalBronze, 1)) * 100), label: "passed to silver" } : undefined} />
        <MetricCard title="Gold Chunks" value={totalGold.toLocaleString()} subtitle="AI-ready" icon={CircleDollarSign} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Recent Pipeline Runs</CardTitle>
          </CardHeader>
          <CardContent>
            {runs.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No pipeline runs yet. Upload a dataset to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {runs.slice(0, 5).map((run, i) => (
                  <div key={run.run_id}>
                    {i > 0 && <Separator className="mb-3" />}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-muted-foreground">{run.run_id.slice(0, 20)}...</span>
                          <Badge variant="outline" className={cn("text-[10px]", STATUS_BADGES[run.status])}>
                            {run.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{run.bronze_count.toLocaleString()} bronze</span>
                          <span>{run.silver_count.toLocaleString()} silver</span>
                          <span>{run.gold_count.toLocaleString()} gold</span>
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <div>{run.duration_s}s</div>
                        <div>{new Date(run.completed_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Data Quality Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {totalDatasets === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                Run the pipeline to see quality scores across layers.
              </div>
            ) : (
              <div className="space-y-5 py-2">
                {(["bronze", "silver", "gold"] as const).map((layer) => (
                  <div key={layer} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize font-medium">{layer}</span>
                      <span className="text-muted-foreground">—</span>
                    </div>
                    <Progress value={0} className="h-2" style={{ ["--progress-color" as any]: LAYER_COLORS[layer] }} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {totalDatasets === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Database className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Welcome to the AI-Ready Data Platform</h3>
            <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
              Upload a macroeconomic dataset to demonstrate the full AI readiness lifecycle:
              Bronze → Silver → Gold → Embeddings → AI Chat.
            </p>
            <div className="flex gap-3">
              <Link href="/upload"><Button size="lg"><Upload className="mr-2 h-4 w-4" />Upload Dataset</Button></Link>
              <Link href="/architecture"><Button variant="outline" size="lg">View Architecture</Button></Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}