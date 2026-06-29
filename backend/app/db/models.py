from sqlalchemy import Column, String, Integer, Float, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from app.db.database import Base

class Dataset(Base):
    __tablename__ = "datasets"
    id = Column(String, primary_key=True)
    file_name = Column(String)
    size_bytes = Column(Integer)
    row_count = Column(Integer, nullable=True)
    columns = Column(JSON)
    status = Column(String, default="uploaded")
    uploaded_at = Column(DateTime, default=func.now())
    storage_path = Column(String, nullable=True)
    bronze_count = Column(Integer, nullable=True)
    silver_count = Column(Integer, nullable=True)
    gold_count = Column(Integer, nullable=True)

class PipelineRun(Base):
    __tablename__ = "pipeline_runs"
    id = Column(String, primary_key=True)
    dataset_id = Column(String, ForeignKey("datasets.id"))
    status = Column(String)
    current_stage = Column(String, nullable=True)
    progress_pct = Column(Integer, default=0)
    error = Column(String, nullable=True)
    started_at = Column(DateTime, default=func.now())
    completed_at = Column(DateTime, nullable=True)

class PipelineStage(Base):
    __tablename__ = "pipeline_stages"
    id = Column(Integer, primary_key=True, autoincrement=True)
    run_id = Column(String, ForeignKey("pipeline_runs.id"))
    name = Column(String)
    status = Column(String, default="pending")
    duration_s = Column(Float, nullable=True)
    row_count = Column(Integer, nullable=True)
    feature_count = Column(Integer, nullable=True)
    chunk_count = Column(Integer, nullable=True)
    error = Column(String, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

class QualityScore(Base):
    __tablename__ = "quality_scores"
    id = Column(Integer, primary_key=True, autoincrement=True)
    dataset_id = Column(String, ForeignKey("datasets.id"))
    run_id = Column(String, ForeignKey("pipeline_runs.id"), nullable=True)
    layer = Column(String)
    dimension = Column(String)
    score = Column(Float)
    total = Column(Integer)
    passed = Column(Integer)
    failed = Column(Integer)
    created_at = Column(DateTime, default=func.now())

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    id = Column(String, primary_key=True)
    dataset_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.now())

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(String, primary_key=True)
    session_id = Column(String, ForeignKey("chat_sessions.id"))
    role = Column(String)
    content = Column(String)
    citations = Column(JSON, nullable=True)
    context = Column(JSON, nullable=True)
    prompt = Column(String, nullable=True)
    token_usage = Column(JSON, nullable=True)
    latency_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=func.now())
