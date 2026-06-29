export interface Dataset {
  id: string;
  file_name: string;
  size_bytes: number;
  row_count: number | null;
  columns: string[];
  status: "uploaded" | "processing" | "ready" | "error";
  uploaded_at: string;
  last_pipeline_run: string | null;
  bronze_count: number | null;
  silver_count: number | null;
  gold_count: number | null;
}

export interface DatasetListResponse {
  datasets: Dataset[];
  total: number;
}

export interface DatasetUploadResponse {
  dataset_id: string;
  file_name: string;
  status: string;
  storage_path: string;
  preview: {
    row_count: number;
    column_count: number;
    columns: string[];
    sample_rows: Record<string, string | number>[];
  };
}

export interface PipelineRun {
  run_id: string;
  dataset_id: string;
  status: "queued" | "running" | "completed" | "failed";
  stages: PipelineStage[];
  progress_pct: number;
  started_at: string;
}

export interface PipelineStage {
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  duration_s?: number;
  row_count?: number;
  feature_count?: number;
  chunk_count?: number;
  error?: string;
}

export interface PipelineHistory {
  runs: PipelineHistoryRun[];
}

export interface PipelineHistoryRun {
  run_id: string;
  dataset_id: string;
  status: string;
  duration_s: number;
  bronze_count: number;
  silver_count: number;
  gold_count: number;
  chunk_count: number;
  completed_at: string;
}

export interface QualityResponse {
  dataset_id: string;
  pipeline_run_id?: string;
  layers: Record<string, LayerQuality>;
}

export interface LayerQuality {
  overall: number;
  dimensions: Record<string, DimensionScore>;
}

export interface DimensionScore {
  score: number;
  total: number;
  passed: number;
  failed: number;
}

export interface EmbeddingStats {
  dataset_id: string;
  total_chunks: number;
  embedding_model: string;
  dimensions: number;
  avg_tokens_per_chunk: number;
  pipeline_run_id?: string;
}

export interface ArchitectureState {
  stages: ArchitectureStage[];
  connections: ArchitectureConnection[];
  active_run_id: string | null;
  overall_status: string;
}

export interface ArchitectureStage {
  id: string;
  label: string;
  status: "idle" | "running" | "completed" | "failed";
  type: "frontend" | "azure" | "databricks" | "ai";
  metrics?: Record<string, number>;
}

export interface ArchitectureConnection {
  from: string;
  to: string;
}

export interface ChatRequest {
  question: string;
  dataset_id?: string;
  top_k?: number;
  include_context?: boolean;
  include_prompt?: boolean;
}

export interface ChatResponse {
  answer: string;
  citations: Citation[];
  context: string[];
  prompt?: string;
  token_usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  latency_ms: number;
}

export interface Citation {
  chunk_id: string;
  text: string;
  score: number;
  metadata: Record<string, string>;
}