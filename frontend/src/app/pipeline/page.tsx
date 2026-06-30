"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSWRConfig } from "swr";
import { usePipelineStatus, usePipelineHistory } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Play, CheckCircle2, Loader2, XCircle, Clock,
  ArrowDown, RotateCw, History,
} from "lucide-react";
import { PIPELINE_STAGES, STATUS_BADGES } from "@/lib/constants";
import { apiClient } from "@/lib/api-client";
import { cn, formatDuration } from "@/lib/utils";

function StageIcon({ status }: { status: string }) {
  switch (status) {
    case "completed": return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    case "running": return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
    case "failed": return <XCircle className="h-5 w-5 text-red-500" />;
    default: return <Clock className="h-5 w-5 text-muted-foreground" />;
  }
}

function StageCard({ stage, stageDef, selected, onClick }: {
  stage: any; stageDef: typeof PIPELINE_STAGES[number]; selected: boolean; onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "border-l-4 rounded-lg cursor-pointer transition-all",
        stage.status === "completed" ? "border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20" :
        stage.status === "running" ? "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20" :
        stage.status === "failed" ? "border-l-red-500 bg-red-50/50 dark:bg-red-950/20" :
        "border-l-muted bg-card",
        selected && "ring-2 ring-primary/30 shadow-md"
      )}
    >
      <CardContent className="flex items-center gap-4 py-4">
        <StageIcon status={stage.status} />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{stageDef.label}</div>
          <div className="text-xs text-muted-foreground">{stageDef.description}</div>
          {stage.error && <div className="text-xs text-red-500 mt-1">{stage.error}</div>}
        </div>
        <div className="text-right text-xs shrink-0">
          {stage.status === "completed" && stage.duration_s && (
            <div className="text-muted-foreground">{formatDuration(stage.duration_s)}</div>
          )}
          {stage.row_count && <div className="font-medium">{stage.row_count.toLocaleString()} rows</div>}
          {stage.feature_count && <div className="font-medium">{stage.feature_count.toLocaleString()} features</div>}
          {stage.chunk_count && <div className="font-medium">{stage.chunk_count.toLocaleString()} chunks</div>}
        </div>
      </CardContent>
    </div>
  );
}

function PipelineContent() {
  const searchParams = useSearchParams();
  const datasetId = searchParams.get("dataset");
  const [runId, setRunId] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const { data: pipeline, mutate } = usePipelineStatus(runId);
  const { data: history, mutate: mutateHistory } = usePipelineHistory();
  const { mutate: globalMutate } = useSWRConfig();

  // When pipeline completes, revalidate datasets and history caches
  useEffect(() => {
    if (pipeline?.status === "completed") {
      globalMutate("/api/v1/datasets");
      mutateHistory();
    }
  }, [pipeline?.status, globalMutate, mutateHistory]);

  const startPipeline = async () => {
    const res = await apiClient.post("/api/v1/pipeline/start", {
      dataset_id: datasetId || "demo",
    });
    setRunId(res.data.run_id);
  };

  const stages = pipeline?.stages || [];
  const pct = pipeline ? Math.round((stages.filter((s) => s.status === "completed").length / Math.max(stages.length, 1)) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pipeline</h1>
          <p className="text-sm text-muted-foreground">Medallion architecture: Bronze, Silver, Gold, Features, Embeddings</p>
        </div>
        <div className="flex gap-2">
          {runId && (
            <Button variant="outline" size="sm" onClick={() => mutate()}>
              <RotateCw className="mr-1 h-4 w-4" />Refresh
            </Button>
          )}
          <Button onClick={startPipeline} disabled={runId !== null && pipeline?.status === "running"} size="sm">
            <Play className="mr-2 h-4 w-4" />{runId ? "Restart" : "Start Pipeline"}
          </Button>
        </div>
      </div>

      {runId && (
        <>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">Run ID: <span className="font-mono text-xs">{runId}</span></span>
            <Badge variant="outline" className={cn("text-[10px]", STATUS_BADGES[pipeline?.status || "pending"])}>
              {pipeline?.status || "pending"}
            </Badge>
            <Progress value={pct} className="h-2 flex-1 max-w-48" />
            <span className="text-muted-foreground">{pct}%</span>
          </div>

          <div className="relative space-y-2">
            {PIPELINE_STAGES.map((stageDef, i) => {
              const stage = stages.find((s) => s.name === stageDef.id) || { name: stageDef.id, status: "pending" as const };
              return (
                <div key={stageDef.id} className="flex gap-3">
                  {i < PIPELINE_STAGES.length - 1 && (
                    <div className="flex flex-col items-center ml-[28px]">
                      <ArrowDown className={cn("h-4 w-4 -mt-1", stage.status === "completed" ? "text-emerald-400" : "text-muted/30")} />
                      <div className={cn("w-0.5 h-full flex-1", stage.status === "completed" ? "bg-emerald-200" : "bg-muted/30")} />
                    </div>
                  )}
                  <div className="flex-1">
                    <StageCard
                      stage={stage}
                      stageDef={stageDef}
                      selected={selectedStage === stageDef.id}
                      onClick={() => setSelectedStage(selectedStage === stageDef.id ? null : stageDef.id)}
                    />
                  </div>
                  {i < PIPELINE_STAGES.length - 1 && <div className="w-14" />}
                </div>
              );
            })}
          </div>
        </>
      )}

      {!runId && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Play className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-2">Ready to transform data</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Start the pipeline to process your dataset through the medallion architecture: Bronze, Silver, Gold, Feature Engineering, and Embedding Generation.
            </p>
            <Button onClick={startPipeline}><Play className="mr-2 h-4 w-4" />Start Pipeline</Button>
          </CardContent>
        </Card>
      )}

      {history?.runs && history.runs.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-medium flex items-center gap-2 mb-3"><History className="h-4 w-4" />Pipeline History</h3>
            <div className="grid gap-2">
              {history.runs.slice(0, 5).map((run) => (
                <div key={run.run_id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{run.run_id.slice(0, 14)}...</span>
                    <Badge variant="outline" className={cn("text-[10px]", STATUS_BADGES[run.status])}>{run.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{run.bronze_count} bronze</span>
                    <span>{run.silver_count} silver</span>
                    <span>{run.gold_count} gold</span>
                    <span>{run.duration_s}s</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function PipelinePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <PipelineContent />
    </Suspense>
  );
}