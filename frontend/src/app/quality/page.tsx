"use client";

import { useQuality } from "@/hooks/use-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LAYER_COLORS, QUALITY_DIMENSIONS, DIMENSION_LABELS } from "@/lib/constants";
import { AlertCircle, CheckCircle2, Info, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PolarAngleAxis, PolarGrid, PolarRadiusAxis,
  Radar, RadarChart, ResponsiveContainer,
  Tooltip as RechartsTooltip, Legend,
} from "recharts";

// ── Quality scoring data with reasoning ──
type DimensionDetail = {
  score: number;
  total: number;
  passed: number;
  failed: number;
  reasoning: string;
};

type LayerDetail = {
  overall: number;
  overallReasoning: string;
  dimensions: Record<string, DimensionDetail>;
};

const QUALITY: Record<string, LayerDetail> = {
  bronze: {
    overall: 0.862,
    overallReasoning:
      "Average of 4 quality dimensions. Bronze layer performs schema-on-read ingestion with minimal transformations, so quality reflects raw data state.",
    dimensions: {
      completeness: {
        score: 0.92, total: 20000, passed: 18400, failed: 1600,
        reasoning: "Measures non-null field coverage. 1,600 records have missing values in required columns (date, indicator_value, country_code).",
      },
      uniqueness: {
        score: 0.88, total: 20000, passed: 17600, failed: 2400,
        reasoning: "Detects duplicate rows by composite key (date + indicator + country). 2,400 duplicate records from overlapping source files.",
      },
      validity: {
        score: 0.85, total: 20000, passed: 17000, failed: 3000,
        reasoning: "Validates data types, ranges, and format rules. 3,000 records have type mismatches or out-of-range values.",
      },
      consistency: {
        score: 0.80, total: 20000, passed: 16000, failed: 4000,
        reasoning: "Cross-field logical rules (e.g. GDP per capita ≤ GDP). 4,000 records violate at least one consistency constraint.",
      },
    },
  },
  silver: {
    overall: 0.943,
    overallReasoning:
      "After cleaning, deduplication, and type casting. Silver layer applies automated quality rules, improving scores by ~8% over Bronze.",
    dimensions: {
      completeness: {
        score: 0.97, total: 19240, passed: 18663, failed: 577,
        reasoning: "After imputation via forward-fill and median strategies, only 577 records remain incomplete — mostly sparse optional metadata.",
      },
      uniqueness: {
        score: 0.95, total: 19240, passed: 18278, failed: 962,
        reasoning: "AI-assisted deduplication removed exact and fuzzy near-matches. 962 borderline records retained after confidence threshold check.",
      },
      validity: {
        score: 0.93, total: 19240, passed: 17893, failed: 1347,
        reasoning: "Type casting and format normalization resolved most issues. 1,347 edge cases remain: ambiguous date formats, locale-specific numbers.",
      },
      consistency: {
        score: 0.91, total: 19240, passed: 17508, failed: 1732,
        reasoning: "Auto-correction for unambiguous violations applied. 1,732 records have soft constraint violations (provisional vs final values).",
      },
    },
  },
  gold: {
    overall: 0.982,
    overallReasoning:
      "After feature engineering and final validation. Gold layer applies strict quality gates — only records passing all critical rules are promoted.",
    dimensions: {
      completeness: {
        score: 0.99, total: 19240, passed: 19047, failed: 193,
        reasoning: "Near-complete coverage after feature engineering filled remaining gaps. 193 records have missing derived features.",
      },
      uniqueness: {
        score: 0.99, total: 19240, passed: 19047, failed: 193,
        reasoning: "Final dedup pass with stricter thresholds. 193 records are intentionally retained near-duplicates representing valid temporal variations.",
      },
      validity: {
        score: 0.98, total: 19240, passed: 18855, failed: 385,
        reasoning: "Comprehensive schema validation against Gold contract. 385 records have minor derived feature precision deviations.",
      },
      consistency: {
        score: 0.97, total: 19240, passed: 18662, failed: 578,
        reasoning: "Final consistency check including cross-dataset referential integrity. 578 records have soft warnings for interpolation markers.",
      },
    },
  },
};

// Format data for radar chart
const radarData = QUALITY_DIMENSIONS.map((dim) => ({
  dimension: DIMENSION_LABELS[dim],
  bronze: QUALITY.bronze.dimensions[dim].score,
  silver: QUALITY.silver.dimensions[dim].score,
  gold: QUALITY.gold.dimensions[dim].score,
}));

// ── Dimension detail row with hover tooltip ──
function DimensionRow({ layer, dim }: { layer: string; dim: string }) {
  const data = QUALITY[layer].dimensions[dim];
  const pct = Math.round(data.score * 1000) / 10;
  const color = LAYER_COLORS[layer];

  return (
    <Tooltip>
      <TooltipTrigger render={<div />}>
        <div className="group flex items-center gap-3 rounded-md px-2 py-1.5 -mx-2 transition-colors hover:bg-muted/50 cursor-default">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{DIMENSION_LABELS[dim]}</span>
              <span className="tabular-nums font-semibold" style={{ color }}>
                {pct}%
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
          </div>
          <Info className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0" />
        </div>
      </TooltipTrigger>
      <TooltipContent side="left" className="max-w-sm text-left">
        <div className="space-y-1.5">
          <div className="font-semibold">{DIMENSION_LABELS[dim]} — {pct}%</div>
          <p className="text-[11px] leading-relaxed opacity-90">{data.reasoning}</p>
          <div className="flex items-center gap-3 text-[10px] pt-1 border-t border-white/20">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              {data.passed.toLocaleString()} passed
            </span>
            <span className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-red-400" />
              {data.failed.toLocaleString()} failed
            </span>
            <span className="opacity-60">of {data.total.toLocaleString()}</span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

// ── Layer score card with hover reasoning ──
function LayerScoreCard({ layer, label }: { layer: string; label: string }) {
  const data = QUALITY[layer];
  const pct = Math.round(data.overall * 1000) / 10;
  const color = LAYER_COLORS[layer];
  const prevLayer = layer === "silver" ? "bronze" : layer === "gold" ? "silver" : null;
  const improvement = prevLayer ? data.overall - QUALITY[prevLayer].overall : 0;
  const improvementPct = Math.round(improvement * 1000) / 10;

  return (
    <Tooltip>
      <TooltipTrigger render={<div />}>
        <div className="flex items-center justify-between group cursor-default">
          <div className="flex items-center gap-2">
            <Badge variant="outline" style={{ color, borderColor: color }}>{label}</Badge>
          </div>
          <div className="flex items-center gap-2">
            {improvementPct > 0 && (
              <span className="text-xs text-green-500">+{improvementPct}%</span>
            )}
            <span className="text-sm font-medium tabular-nums">{pct}%</span>
            <Info className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="left" className="max-w-sm text-left">
        <div className="space-y-1.5">
          <div className="font-semibold capitalize">{label} Layer — {pct}% Overall</div>
          <p className="text-[11px] leading-relaxed opacity-90">{data.overallReasoning}</p>
          <div className="text-[10px] pt-1 border-t border-white/20 space-y-0.5">
            {QUALITY_DIMENSIONS.map((dim) => (
              <div key={dim} className="flex justify-between">
                <span className="opacity-70">{DIMENSION_LABELS[dim]}</span>
                <span className="tabular-nums">{Math.round(data.dimensions[dim].score * 1000) / 10}%</span>
              </div>
            ))}
          </div>
          <div className="text-[10px] pt-1 border-t border-white/20 opacity-60">
            Formula: avg(completeness, uniqueness, validity, consistency)
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export default function QualityPage() {
  const { data: qualityData, isLoading } = useQuality("demo-dataset");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const goldOverall = Math.round(QUALITY.gold.overall * 1000) / 10;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Quality Dashboard</h1>
          <p className="text-muted-foreground">Monitor data quality progression across medallion layers. Hover any element for detailed reasoning.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Radar Chart */}
          <Card className="md:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Quality Dimensions</CardTitle>
                  <CardDescription>Comparison across layers (1.0 = perfect)</CardDescription>
                </div>
                <Tooltip>
                  <TooltipTrigger render={<div />}>
                    <Info className="h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-sm text-left">
                    <div className="space-y-1">
                      <div className="font-semibold">Radar Chart — Quality Dimensions</div>
                      <p className="text-[11px] leading-relaxed opacity-90">
                        Each axis represents a quality dimension scored 0.0–1.0. The area covered by each layer
                        shows its overall quality profile. Notice how Gold (yellow) nearly fills the chart,
                        while Bronze (brown) shows clear gaps in Consistency and Validity. Hover the chart
                        for exact per-dimension values.
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="dimension" />
                  <PolarRadiusAxis angle={30} domain={[0.6, 1.0]} tickCount={5} />
                  <Radar name="Bronze" dataKey="bronze" stroke={LAYER_COLORS.bronze} fill={LAYER_COLORS.bronze} fillOpacity={0.3} />
                  <Radar name="Silver" dataKey="silver" stroke={LAYER_COLORS.silver} fill={LAYER_COLORS.silver} fillOpacity={0.4} />
                  <Radar name="Gold" dataKey="gold" stroke={LAYER_COLORS.gold} fill={LAYER_COLORS.gold} fillOpacity={0.5} />
                  <Legend />
                  <RechartsTooltip
                    formatter={(value: any, name: any) => [
                      `${(Number(value) * 100).toFixed(1)}%`,
                      name,
                    ]}
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Right column: Overall + Layer Progression + Dimension Breakdown */}
          <div className="space-y-4">
            {/* Gold Layer Overall */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  Gold Layer Overall <ShieldCheck className="h-4 w-4 text-emerald-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tooltip>
                  <TooltipTrigger render={<div />}>
                    <div className="group cursor-default">
                      <div className="flex items-center gap-2">
                        <div className="text-3xl font-bold text-emerald-500">{goldOverall}%</div>
                        <Info className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Ready for AI embedding generation</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-sm text-left">
                    <div className="space-y-1.5">
                      <div className="font-semibold">Gold Layer — {goldOverall}% Overall Quality</div>
                      <p className="text-[11px] leading-relaxed opacity-90">{QUALITY.gold.overallReasoning}</p>
                      <div className="text-[10px] pt-1 border-t border-white/20 space-y-0.5">
                        {QUALITY_DIMENSIONS.map((dim) => (
                          <div key={dim} className="flex justify-between">
                            <span className="opacity-70">{DIMENSION_LABELS[dim]}</span>
                            <span className="tabular-nums">{Math.round(QUALITY.gold.dimensions[dim].score * 1000) / 10}%</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-[10px] pt-1 border-t border-white/20 opacity-60">
                        Threshold for AI readiness: ≥95%. Current score exceeds threshold ✓
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </CardContent>
            </Card>

            {/* Layer Progression */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Layer Progression</CardTitle>
                  <Tooltip>
                    <TooltipTrigger render={<div />}>
                      <Info className="h-3.5 w-3.5 text-muted-foreground/40 hover:text-muted-foreground cursor-help transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-sm text-left">
                      <div className="space-y-1">
                        <div className="font-semibold">Quality Progression</div>
                        <p className="text-[11px] leading-relaxed opacity-90">
                          Shows how data quality improves across the medallion layers.
                          Bronze → Silver sees the biggest jump (~8%) from automated cleaning.
                          Silver → Gold adds ~4% through strict validation and feature engineering.
                          Hover each layer for a detailed breakdown.
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <LayerScoreCard layer="bronze" label="Bronze" />
                <LayerScoreCard layer="silver" label="Silver" />
                <LayerScoreCard layer="gold" label="Gold" />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Per-Layer Dimension Breakdown */}
        <div className="grid gap-6 md:grid-cols-3">
          {(["bronze", "silver", "gold"] as const).map((layer) => {
            const data = QUALITY[layer];
            const overallPct = Math.round(data.overall * 1000) / 10;
            const color = LAYER_COLORS[layer];

            return (
              <Card key={layer}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium capitalize flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                      {layer} Layer
                    </CardTitle>
                    <Tooltip>
                      <TooltipTrigger render={<div />}>
                        <span className="text-lg font-bold tabular-nums cursor-default" style={{ color }}>
                          {overallPct}%
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-sm text-left">
                        <div className="space-y-1">
                          <div className="font-semibold capitalize">{layer} — {overallPct}% Overall</div>
                          <p className="text-[11px] leading-relaxed opacity-90">{data.overallReasoning}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <CardDescription className="text-xs">
                    {layer === "bronze" && "Raw ingestion quality before any transformations"}
                    {layer === "silver" && "After cleaning, deduplication, and type casting"}
                    {layer === "gold" && "Final quality after feature engineering and validation"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-0.5">
                    {QUALITY_DIMENSIONS.map((dim) => (
                      <DimensionRow key={dim} layer={layer} dim={dim} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}