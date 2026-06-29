"use client";

import { useQuality } from "@/hooks/use-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LAYER_COLORS } from "@/lib/constants";
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function QualityPage() {
  const { data: qualityData, isLoading } = useQuality("demo-dataset");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Format data for radar chart
  const radarData = [
    { dimension: "Completeness", bronze: 0.92, silver: 0.97, gold: 0.99 },
    { dimension: "Uniqueness", bronze: 0.88, silver: 0.95, gold: 0.99 },
    { dimension: "Validity", bronze: 0.85, silver: 0.93, gold: 0.98 },
    { dimension: "Consistency", bronze: 0.80, silver: 0.91, gold: 0.97 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Quality Dashboard</h1>
        <p className="text-muted-foreground">Monitor data quality progression across medallion layers.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Quality Dimensions</CardTitle>
            <CardDescription>Comparison across layers (1.0 = perfect)</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="dimension" />
                <PolarRadiusAxis angle={30} domain={[0.6, 1.0]} />
                <Radar name="Bronze" dataKey="bronze" stroke={LAYER_COLORS.bronze} fill={LAYER_COLORS.bronze} fillOpacity={0.3} />
                <Radar name="Silver" dataKey="silver" stroke={LAYER_COLORS.silver} fill={LAYER_COLORS.silver} fillOpacity={0.4} />
                <Radar name="Gold" dataKey="gold" stroke={LAYER_COLORS.gold} fill={LAYER_COLORS.gold} fillOpacity={0.5} />
                <Legend />
                <Tooltip formatter={(value: number) => [(value * 100).toFixed(1) + '%']} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Gold Layer Overall <ShieldCheck className="h-4 w-4 text-emerald-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-500">98.2%</div>
              <p className="text-xs text-muted-foreground mt-1">Ready for AI embedding generation</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Layer Progression</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" style={{ color: LAYER_COLORS.bronze, borderColor: LAYER_COLORS.bronze }}>Bronze</Badge>
                <span className="text-sm font-medium">86.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" style={{ color: LAYER_COLORS.silver, borderColor: LAYER_COLORS.silver }}>Silver</Badge>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-500">+8.1%</span>
                  <span className="text-sm font-medium">94.3%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" style={{ color: LAYER_COLORS.gold, borderColor: LAYER_COLORS.gold }}>Gold</Badge>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-500">+3.9%</span>
                  <span className="text-sm font-medium">98.2%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}