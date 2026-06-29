"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useArchitecture } from "@/hooks/use-api";
import { PIPELINE_STAGES } from "@/lib/constants";

export default function ArchitecturePage() {
  const { data: archData } = useArchitecture();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Architecture</h1>
        <p className="text-muted-foreground">Medallion Architecture Pipeline Flow</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Data Pipeline Stages</CardTitle>
            <CardDescription>From raw ingestion to AI-ready embeddings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 relative py-8">
              {/* Connecting line */}
              <div className="absolute left-6 top-8 bottom-8 w-1 bg-muted rounded-full z-0" />
              
              {PIPELINE_STAGES.map((stage, i) => (
                <div key={stage.id} className="relative z-10 flex items-start gap-6">
                  <div 
                    className="w-12 h-12 rounded-full border-4 border-background flex items-center justify-center shrink-0 shadow-md"
                    style={{ backgroundColor: stage.color }}
                  >
                    <span className="text-white font-bold">{i + 1}</span>
                  </div>
                  
                  <Card className="flex-1 overflow-hidden transition-all hover:shadow-md">
                    <div className="p-4 flex justify-between items-center bg-muted/30">
                      <div>
                        <h3 className="font-semibold text-lg">{stage.label}</h3>
                        <p className="text-sm text-muted-foreground">{stage.description}</p>
                      </div>
                      <Badge variant="outline" style={{ borderColor: stage.color, color: stage.color }}>
                        {stage.id.toUpperCase()}
                      </Badge>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}