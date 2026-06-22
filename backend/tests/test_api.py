"""
HTTP-layer tests. Firebase auth and service functions are mocked so
no database or external API is needed.
"""
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest


# ── /health ───────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_health(client):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


# ── auth enforcement ──────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_datasets_no_auth_header_returns_422(anon_client):
    resp = await anon_client.get("/api/datasets")
    assert resp.status_code == 422  # FastAPI: required Header missing


@pytest.mark.asyncio
async def test_datasets_invalid_token_returns_401(anon_client):
    from app.firebase import verify_token
    verify_token.side_effect = Exception("bad token")
    resp = await anon_client.get(
        "/api/datasets",
        headers={"Authorization": "Bearer invalid-token"},
    )
    assert resp.status_code == 401
    verify_token.side_effect = None


# ── GET /api/datasets ─────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_list_datasets_empty(client):
    with patch("app.routers.datasets.dataset_service.list_datasets", new=AsyncMock(return_value=[])):
        resp = await client.get("/api/datasets")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_list_datasets_returns_user_datasets(client):
    ds = MagicMock()
    ds.id = uuid4()
    ds.name = "Q1_sales.csv"
    ds.row_count = 120
    ds.columns = [
        {"name": "month", "dtype": "text", "sample_values": ["Jan"], "null_count": 0, "unique_count": 12}
    ]
    ds.created_at = datetime.now(timezone.utc)

    with patch("app.routers.datasets.dataset_service.list_datasets", new=AsyncMock(return_value=[ds])):
        resp = await client.get("/api/datasets")

    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["name"] == "Q1_sales.csv"
    assert data[0]["row_count"] == 120


# ── GET /api/datasets/{id} ────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_dataset_not_found(client):
    with patch("app.routers.datasets.dataset_service.get_dataset", new=AsyncMock(return_value=None)):
        resp = await client.get(f"/api/datasets/{uuid4()}")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_get_dataset_found(client):
    ds = MagicMock()
    ds.id = uuid4()
    ds.name = "revenue.csv"
    ds.row_count = 50
    ds.columns = []
    ds.created_at = datetime.now(timezone.utc)

    with patch("app.routers.datasets.dataset_service.get_dataset", new=AsyncMock(return_value=ds)):
        resp = await client.get(f"/api/datasets/{ds.id}")

    assert resp.status_code == 200
    assert resp.json()["name"] == "revenue.csv"


# ── POST /api/uploads — validation paths ─────────────────────────────────────

@pytest.mark.asyncio
async def test_upload_unsupported_extension(client):
    with patch("app.routers.uploads.file_parser.parse", new=AsyncMock(side_effect=__import__("fastapi").HTTPException(400, "Unsupported file type"))):
        resp = await client.post(
            "/api/uploads",
            files={"file": ("notes.txt", b"hello world", "text/plain")},
        )
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_upload_file_too_large(client):
    large = b"x" * (21 * 1024 * 1024)  # 21 MB
    resp = await client.post(
        "/api/uploads",
        files={"file": ("big.csv", large, "text/csv")},
    )
    assert resp.status_code == 413


# ── POST /api/queries ─────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_submit_query_dataset_not_found(client):
    with patch("app.routers.queries.query_service.run_query", new=AsyncMock(side_effect=ValueError("Dataset not found"))):
        resp = await client.post(
            "/api/queries",
            json={"dataset_id": str(uuid4()), "question": "What is revenue?"},
        )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_submit_query_success(client):
    q = MagicMock()
    q.id = uuid4()
    q.dataset_id = uuid4()
    q.question = "What is total revenue?"
    q.created_at = datetime.now(timezone.utc)

    r = MagicMock()
    r.answer_text = "Total revenue is $500k."
    r.chart_type = "bar"
    r.chart_title = "Revenue"
    r.chart_data = [{"label": "Jan", "value": 500000.0}]
    r.chart_config = None
    r.summary_stats = {"total": 500000}
    q.result = r

    with patch("app.routers.queries.query_service.run_query", new=AsyncMock(return_value=q)):
        resp = await client.post(
            "/api/queries",
            json={"dataset_id": str(q.dataset_id), "question": q.question},
        )

    assert resp.status_code == 200
    data = resp.json()
    assert data["answer_text"] == "Total revenue is $500k."
    assert data["chart_type"] == "bar"
    assert data["chart_data"][0]["value"] == 500000.0
