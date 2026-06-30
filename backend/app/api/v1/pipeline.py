import uuid
from datetime import datetime
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, BackgroundTasks, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db, SessionLocal
from app.db.models import PipelineRun, PipelineStage, Dataset
from app.models.schemas import PipelineStatusResponse, PipelineHistoryResponse, PipelineStartRequest
from loguru import logger
import asyncio
import json

router = APIRouter()

active_connections = []

async def broadcast_status(run_id: str):
    for connection in active_connections:
        try:
            await connection.send_json({"type": "pipeline_update", "run_id": run_id})
        except:
            pass

async def simulate_pipeline(run_id: str, dataset_id: str):
    db = SessionLocal()
    try:
        run = db.query(PipelineRun).filter(PipelineRun.id == run_id).first()
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
        
        stages = ["bronze", "silver", "gold", "features", "embeddings"]
        for stage_name in stages:
            stage = db.query(PipelineStage).filter(PipelineStage.run_id == run_id, PipelineStage.name == stage_name).first()
            if not stage:
                continue
                
            # Update stage and run to running
            stage.status = "running"
            stage.started_at = datetime.now()
            run.current_stage = stage_name
            run.progress_pct = stages.index(stage_name) * 20
            db.commit()
            await broadcast_status(run_id)
            
            # Simulate work
            await asyncio.sleep(2)
            
            # Complete stage
            stage.status = "completed"
            stage.completed_at = datetime.now()
            stage.duration_s = (stage.completed_at - stage.started_at).total_seconds()
            
            if stage_name == "bronze":
                try:
                    from app.services.ingestion.seed_adls import seed_adls_mock
                    seed_adls_mock()
                except Exception as e:
                    logger.error(f"Failed to run seed_adls_mock: {e}")
                stage.row_count = 20000
                if dataset: dataset.bronze_count = 20000
            elif stage_name == "silver":
                stage.row_count = 19240
                if dataset: dataset.silver_count = 19240
            elif stage_name == "gold":
                stage.row_count = 19240
                if dataset: dataset.gold_count = 19240
            elif stage_name == "features":
                stage.feature_count = 76960
            elif stage_name == "embeddings":
                stage.chunk_count = 48100
            db.commit()
            await broadcast_status(run_id)

        run.status = "completed"
        run.progress_pct = 100
        run.completed_at = datetime.now()
        if dataset:
            dataset.status = "ready"
            dataset.last_pipeline_run = run_id
        db.commit()
        await broadcast_status(run_id)
    finally:
        db.close()


@router.post("/start")
async def start_pipeline(req: PipelineStartRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    run_id = f"run-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8]}"
    stages = req.stages or ["bronze", "silver", "gold", "features", "embeddings"]

    run = PipelineRun(
        id=run_id,
        dataset_id=req.dataset_id,
        status="running",
        current_stage="bronze"
    )
    db.add(run)
    db.commit()
    
    for s in stages:
        stage = PipelineStage(run_id=run_id, name=s, status="pending")
        db.add(stage)
    db.commit()
    
    background_tasks.add_task(simulate_pipeline, run_id, req.dataset_id)

    return {
        "run_id": run_id,
        "dataset_id": req.dataset_id,
        "status": "running",
        "stages": [{"name": s, "status": "pending"} for s in stages],
        "started_at": datetime.now().isoformat(),
    }

@router.get("/{run_id}/status", response_model=PipelineStatusResponse)
async def get_pipeline_status(run_id: str, db: Session = Depends(get_db)):
    run = db.query(PipelineRun).filter(PipelineRun.id == run_id).first()
    if not run:
        from app.core.exceptions import NotFoundError
        raise NotFoundError("Run not found")
        
    stages = db.query(PipelineStage).filter(PipelineStage.run_id == run_id).all()
    
    return PipelineStatusResponse(
        run_id=run.id,
        dataset_id=run.dataset_id,
        status=run.status,
        current_stage=run.current_stage,
        progress_pct=run.progress_pct,
        error=run.error,
        started_at=run.started_at,
        stages=[{
            "name": s.name,
            "status": s.status,
            "duration_s": s.duration_s,
            "row_count": s.row_count,
            "feature_count": s.feature_count,
            "chunk_count": s.chunk_count,
            "error": s.error
        } for s in stages]
    )

@router.get("/history")
async def get_pipeline_history(db: Session = Depends(get_db)):
    runs = db.query(PipelineRun).order_by(PipelineRun.started_at.desc()).all()
    history = []
    for r in runs:
        if r.status != "completed": continue
        
        stages = db.query(PipelineStage).filter(PipelineStage.run_id == r.id).all()
        bronze = next((s.row_count for s in stages if s.name == "bronze" and s.row_count), 0)
        silver = next((s.row_count for s in stages if s.name == "silver" and s.row_count), 0)
        gold = next((s.row_count for s in stages if s.name == "gold" and s.row_count), 0)
        chunks = next((s.chunk_count for s in stages if s.name == "embeddings" and s.chunk_count), 0)
        
        duration = 0
        if r.completed_at and r.started_at:
            duration = int((r.completed_at - r.started_at).total_seconds())
            
        history.append({
            "run_id": r.id,
            "dataset_id": r.dataset_id,
            "status": r.status,
            "duration_s": duration,
            "bronze_count": bronze,
            "silver_count": silver,
            "gold_count": gold,
            "chunk_count": chunks,
            "completed_at": r.completed_at or r.started_at
        })
        
    return {"runs": history}

@router.websocket("/ws")
async def pipeline_websocket(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_json({"type": "pong", "data": data})
    except WebSocketDisconnect:
        active_connections.remove(websocket)