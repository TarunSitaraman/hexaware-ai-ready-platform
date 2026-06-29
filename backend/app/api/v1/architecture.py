from fastapi import APIRouter

router = APIRouter()


@router.get("")
async def get_architecture():
    return {
        "stages": [
            {"id": "upload", "label": "Upload", "status": "idle", "type": "frontend"},
            {"id": "ingest", "label": "Raw Ingestion", "status": "idle", "type": "azure"},
            {"id": "bronze", "label": "Bronze Layer", "status": "idle", "type": "databricks"},
            {"id": "silver", "label": "Silver Layer", "status": "idle", "type": "databricks"},
            {"id": "gold", "label": "Gold Layer", "status": "idle", "type": "databricks"},
            {"id": "features", "label": "Feature Engineering", "status": "idle", "type": "databricks"},
            {"id": "embeddings", "label": "Embeddings", "status": "idle", "type": "ai"},
            {"id": "search", "label": "Vector Search", "status": "idle", "type": "azure"},
            {"id": "chat", "label": "AI Chatbot", "status": "idle", "type": "ai"},
        ],
        "connections": [
            {"from": "upload", "to": "ingest"},
            {"from": "ingest", "to": "bronze"},
            {"from": "bronze", "to": "silver"},
            {"from": "silver", "to": "gold"},
            {"from": "gold", "to": "features"},
            {"from": "features", "to": "embeddings"},
            {"from": "embeddings", "to": "search"},
            {"from": "search", "to": "chat"},
        ],
        "active_run_id": None,
        "overall_status": "idle",
    }