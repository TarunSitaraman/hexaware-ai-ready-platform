import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { apiClient } from "@/lib/api-client";
import type {
  DatasetListResponse,
  DatasetUploadResponse,
  PipelineRun,
  PipelineHistory,
  QualityResponse,
  EmbeddingStats,
  ArchitectureState,
} from "@/types";

const fetcher = (url: string) => apiClient.get(url).then((r) => r.data);

export function useDatasets() {
  return useSWR<DatasetListResponse>("/api/v1/datasets", fetcher, { refreshInterval: 10000 });
}

export function useUploadDataset() {
  return useSWRMutation("/api/v1/datasets/upload", async (url, { arg }: { arg: FormData }) => {
    const res = await apiClient.post<DatasetUploadResponse>(url, arg, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  });
}

export function useDeleteDataset() {
  return useSWRMutation("/api/v1/datasets", async (url, { arg }: { arg: string }) => {
    return apiClient.delete(`${url}/${arg}`).then((r) => r.data);
  });
}

export function usePipelineStatus(runId: string | null) {
  return useSWR<PipelineRun>(
    runId ? `/api/v1/pipeline/${runId}/status` : null,
    fetcher,
    { refreshInterval: runId ? 3000 : 0 }
  );
}

export function usePipelineHistory() {
  return useSWR<PipelineHistory>("/api/v1/pipeline/history", fetcher, { refreshInterval: 10000 });
}

export function useStartPipeline() {
  return useSWRMutation("/api/v1/pipeline/start", async (url, { arg }: { arg: { dataset_id: string } }) => {
    return apiClient.post(url, arg).then((r) => r.data);
  });
}

export function useQuality(datasetId: string | null) {
  return useSWR<QualityResponse>(
    datasetId ? `/api/v1/quality/${datasetId}` : null,
    fetcher,
    { refreshInterval: 15000 }
  );
}

export function useArchitecture() {
  return useSWR<ArchitectureState>("/api/v1/architecture", fetcher, { refreshInterval: 5000 });
}

export function useEmbeddingStats(datasetId: string | null) {
  return useSWR<EmbeddingStats>(
    datasetId ? `/api/v1/embeddings/${datasetId}` : null,
    fetcher
  );
}

export function useSearchEmbeddings(datasetId: string | null, query: string) {
  return useSWR(
    datasetId && query ? `/api/v1/embeddings/${datasetId}/search?query=${encodeURIComponent(query)}&top_k=10` : null,
    fetcher
  );
}