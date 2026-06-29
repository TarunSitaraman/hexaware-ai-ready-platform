from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class DatasetUploadResponse(BaseModel):
    dataset_id: str
    file_name: str
    status: str
    storage_path: str
    preview: dict

class DatasetResponse(BaseModel):
    id: str
    file_name: str
    size_bytes: int
    row_count: Optional[int]
    columns: List[str]
    status: str
    uploaded_at: datetime
    last_pipeline_run: Optional[str] = None
    bronze_count: Optional[int] = None
    silver_count: Optional[int] = None
    gold_count: Optional[int] = None

class DatasetListResponse(BaseModel):
    datasets: List[DatasetResponse]
    total: int

class PipelineStageResponse(BaseModel):
    name: str
    status: str
    duration_s: Optional[float] = None
    row_count: Optional[int] = None
    feature_count: Optional[int] = None
    chunk_count: Optional[int] = None
    error: Optional[str] = None

class PipelineStatusResponse(BaseModel):
    run_id: str
    dataset_id: str
    status: str
    current_stage: Optional[str] = None
    progress_pct: int = 0
    stages: List[PipelineStageResponse] = []
    error: Optional[str] = None
    started_at: Optional[datetime] = None

class PipelineHistoryRunResponse(BaseModel):
    run_id: str
    dataset_id: str
    status: str
    duration_s: int
    bronze_count: int
    silver_count: int
    gold_count: int
    chunk_count: int
    completed_at: datetime

class PipelineHistoryResponse(BaseModel):
    runs: List[PipelineHistoryRunResponse]

class PipelineStartRequest(BaseModel):
    dataset_id: str
    stages: Optional[List[str]] = None
    start_from: Optional[str] = None
