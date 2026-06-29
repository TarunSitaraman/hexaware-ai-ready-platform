export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

export const PIPELINE_STAGES = [
  { id: "bronze", label: "Bronze Layer", description: "Raw ingestion & schema inference", icon: "Database", color: "#CD7F32" },
  { id: "silver", label: "Silver Layer", description: "Cleaning, dedup & type casting", icon: "Filter", color: "#A8A8A8" },
  { id: "gold", label: "Gold Layer", description: "Feature engineering & chunking", icon: "Sparkles", color: "#FFD700" },
  { id: "features", label: "Feature Engineering", description: "Time-series features & indicators", icon: "TrendingUp", color: "#6366F1" },
  { id: "embeddings", label: "Embeddings & Index", description: "Vector generation & AI Search sync", icon: "Brain", color: "#22C55E" },
] as const;

export const QUALITY_DIMENSIONS = ["completeness", "uniqueness", "validity", "consistency"] as const;

export const DIMENSION_LABELS: Record<string, string> = {
  completeness: "Completeness",
  uniqueness: "Uniqueness",
  validity: "Validity",
  consistency: "Consistency",
  timeliness: "Timeliness",
};

export const LAYER_COLORS: Record<string, string> = {
  bronze: "#CD7F32",
  silver: "#A8A8A8",
  gold: "#FFD700",
};

export const LAYER_BG: Record<string, string> = {
  bronze: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300",
  silver: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
  gold: "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300",
};

export const TYPE_BG = {
  frontend: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300",
  azure: "bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300",
  databricks: "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300",
  ai: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300",
} as Record<string, string>;

export const STATUS_BADGES: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  running: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  completed: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  failed: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
  queued: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
};