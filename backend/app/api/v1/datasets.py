import uuid
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Form, Depends
from typing import Optional
from loguru import logger
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Dataset
from app.models.schemas import DatasetListResponse, DatasetResponse, DatasetUploadResponse
import json

router = APIRouter()

@router.get("", response_model=DatasetListResponse)
async def list_datasets(db: Session = Depends(get_db)):
    datasets = db.query(Dataset).all()
    res = []
    for d in datasets:
        res.append(DatasetResponse(
            id=d.id,
            file_name=d.file_name,
            size_bytes=d.size_bytes,
            row_count=d.row_count,
            columns=d.columns if d.columns else [],
            status=d.status,
            uploaded_at=d.uploaded_at,
            bronze_count=d.bronze_count,
            silver_count=d.silver_count,
            gold_count=d.gold_count
        ))
    return {"datasets": res, "total": len(res)}

@router.post("/upload", response_model=DatasetUploadResponse)
async def upload_dataset(
    file: UploadFile = File(...),
    name: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".csv"):
        from app.core.exceptions import ValidationError
        raise ValidationError("Only CSV files are supported")

    content = await file.read()
    if len(content) > 50 * 1024 * 1024:
        from app.core.exceptions import ValidationError
        raise ValidationError("File size exceeds 50MB limit")

    dataset_id = f"d-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8]}"
    logger.info(f"Uploading dataset {dataset_id}: {file.filename} ({len(content)} bytes)")

    # Parse preview
    text = content.decode('utf-8', errors='ignore')
    lines = [line.strip() for line in text.split('\\n') if line.strip()]
    columns = []
    if lines:
        columns = [c.strip().replace('"', '') for c in lines[0].split(',')]

    db_dataset = Dataset(
        id=dataset_id,
        file_name=file.filename,
        size_bytes=len(content),
        row_count=len(lines) - 1 if len(lines) > 0 else 0,
        columns=columns,
        status="uploaded",
        storage_path=f"abfss://raw-zone@/datasets/{dataset_id}/"
    )
    db.add(db_dataset)
    db.commit()

    return {
        "dataset_id": dataset_id,
        "file_name": file.filename,
        "size_bytes": len(content),
        "status": "uploaded",
        "storage_path": db_dataset.storage_path,
        "preview": {
            "row_count": db_dataset.row_count,
            "column_count": len(columns),
            "columns": columns,
            "sample_rows": [],
        },
    }

@router.delete("/{dataset_id}")
async def delete_dataset(dataset_id: str, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if dataset:
        db.delete(dataset)
        db.commit()
    return {
        "message": "Dataset deleted",
        "deleted_artifacts": {
            "bronze_rows": 0,
            "silver_rows": 0,
            "gold_rows": 0,
            "chunks": 0,
            "embeddings": 0,
        },
    }