from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter()


@router.get("/{dataset_id}")
async def get_quality_scores(dataset_id: str):
    return {
        "dataset_id": dataset_id,
        "layers": {
            "bronze": {
                "overall": 0.86,
                "dimensions": {
                    "completeness": {"score": 0.92, "total": 20000, "passed": 18400, "failed": 1600},
                    "uniqueness": {"score": 0.88, "total": 20000, "passed": 17600, "failed": 2400},
                    "validity": {"score": 0.85, "total": 20000, "passed": 17000, "failed": 3000},
                    "consistency": {"score": 0.80, "total": 20000, "passed": 16000, "failed": 4000}
                }
            },
            "silver": {
                "overall": 0.94,
                "dimensions": {
                    "completeness": {"score": 0.97, "total": 19240, "passed": 18662, "failed": 578},
                    "uniqueness": {"score": 0.95, "total": 19240, "passed": 18278, "failed": 962},
                    "validity": {"score": 0.93, "total": 19240, "passed": 17893, "failed": 1347},
                    "consistency": {"score": 0.91, "total": 19240, "passed": 17508, "failed": 1732}
                }
            },
            "gold": {
                "overall": 0.98,
                "dimensions": {
                    "completeness": {"score": 0.99, "total": 19240, "passed": 19047, "failed": 193},
                    "uniqueness": {"score": 0.99, "total": 19240, "passed": 19047, "failed": 193},
                    "validity": {"score": 0.98, "total": 19240, "passed": 18855, "failed": 385},
                    "consistency": {"score": 0.97, "total": 19240, "passed": 18662, "failed": 578}
                }
            },
        },
    }


@router.get("/{dataset_id}/failed-rows")
async def get_failed_rows(
    dataset_id: str,
    layer: str = Query("silver"),
    dimension: Optional[str] = None,
    limit: int = Query(50, le=100),
):
    return {"rows": [], "total": 0, "layer": layer}