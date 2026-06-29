"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Upload, FileText, CheckCircle2, AlertCircle, XCircle,
  Table2, ArrowRight, FileSpreadsheet,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { formatBytes, cn } from "@/lib/utils";

export default function UploadPage() {
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewColumns, setPreviewColumns] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<any>(null);

  const parsePreview = useCallback((f: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter(Boolean);
      if (lines.length < 2) { setError("File must contain at least a header and one data row"); return; }
      const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
      const rows = lines.slice(1, 6).map((l) => l.split(",").map((c) => c.trim().replace(/"/g, "")));
      setPreviewColumns(headers);
      setPreviewRows(rows);
      setError(null);
    };
    reader.readAsText(f);
  }, []);

  const handleFile = (f: File) => {
    setUploaded(null);
    if (!f.name.endsWith(".csv")) { setError("Only CSV files are supported"); setFile(null); return; }
    if (f.size > 50 * 1024 * 1024) { setError("File exceeds 50MB limit"); setFile(null); return; }
    setFile(f);
    setError(null);
    parsePreview(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(10);
    try {
      const formData = new FormData();
      formData.append("file", file);
      setUploadProgress(50);
      const res = await apiClient.post("/api/v1/datasets/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadProgress(100);
      setUploaded(res.data);
      await new Promise((r) => setTimeout(r, 600));
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null); setUploaded(null); setError(null);
    setUploadProgress(0); setPreviewColumns([]); setPreviewRows([]);
  };

  if (uploaded && !uploading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Upload Dataset</h1>
          <p className="text-sm text-muted-foreground">Upload a CSV file with macroeconomic indicators</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-medium">Upload Successful</h3>
            <p className="text-sm text-muted-foreground mt-1">{file?.name}</p>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <span>{uploaded.preview?.row_count ?? "?"} rows</span>
              <span>{uploaded.preview?.column_count ?? previewColumns.length} columns</span>
              <span>{formatBytes(file?.size ?? 0)}</span>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={() => router.push(`/pipeline?dataset=${uploaded.dataset_id}`)}>
                <ArrowRight className="mr-2 h-4 w-4" />Start Pipeline
              </Button>
              <Button variant="outline" onClick={handleReset}>Upload Another</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload Dataset</h1>
        <p className="text-sm text-muted-foreground">Upload a CSV file with macroeconomic indicators to begin the AI-ready pipeline</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4" />{error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>File Upload</CardTitle>
          <CardDescription>CSV files up to 50MB. First 5 rows previewed below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer",
              dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
            )}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input id="file-input" type="file" accept=".csv" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <p className="font-medium mb-1">{file ? file.name : "Drop CSV here or click to browse"}</p>
            {file && <p className="text-sm text-muted-foreground">{formatBytes(file.size)}</p>}
          </div>

          {uploading && <Progress value={uploadProgress} className="h-2" />}

          {file && !uploading && (
            <Button onClick={handleUpload} className="w-full">
              <FileSpreadsheet className="mr-2 h-4 w-4" />Upload & Process Dataset
            </Button>
          )}
        </CardContent>
      </Card>

      {previewColumns.length > 0 && !uploading && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Table2 className="h-4 w-4" />File Preview
            </CardTitle>
            <CardDescription>{previewColumns.length} columns detected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {previewColumns.map((col) => (
                <Badge key={col} variant="secondary" className="text-[11px]">{col}</Badge>
              ))}
            </div>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    {previewColumns.map((col) => (
                      <th key={col} className="px-3 py-2 text-left font-medium whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                      {row.slice(0, 7).map((cell, j) => (
                        <td key={j} className="px-3 py-1.5 text-muted-foreground whitespace-nowrap max-w-[140px] truncate">
                          {cell}
                        </td>
                      ))}
                      {previewColumns.length > 7 && (
                        <td className="px-3 py-1.5 text-muted-foreground italic">+{previewColumns.length - 7} more</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}