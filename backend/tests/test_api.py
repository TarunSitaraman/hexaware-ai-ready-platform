from fastapi.testclient import TestClient
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_list_datasets():
    response = client.get("/api/v1/datasets")
    assert response.status_code == 200


def test_architecture():
    response = client.get("/api/v1/architecture")
    assert response.status_code == 200
    assert "stages" in response.json()