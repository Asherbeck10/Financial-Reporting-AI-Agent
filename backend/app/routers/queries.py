from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.query import QueryRequest, QueryResponse, ChartDataPoint, ChartConfig
from app.services import query_service

router = APIRouter()


def _to_response(query) -> QueryResponse:
    r = query.result
    chart_data = None
    if r and r.chart_data:
        chart_data = [ChartDataPoint(**p) for p in r.chart_data]

    chart_config = None
    if r and r.chart_config:
        chart_config = ChartConfig(**r.chart_config)

    return QueryResponse(
        query_id=query.id,
        dataset_id=query.dataset_id,
        question=query.question,
        answer_text=r.answer_text if r else "",
        chart_type=r.chart_type if r else None,
        chart_title=r.chart_title if r else None,
        chart_data=chart_data,
        chart_config=chart_config,
        summary_stats=r.summary_stats if r else None,
        created_at=query.created_at,
    )


@router.post("", response_model=QueryResponse)
async def submit_query(body: QueryRequest, db: AsyncSession = Depends(get_db)):
    try:
        query = await query_service.run_query(db, body.dataset_id, body.question)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Query failed: {exc}")
    return _to_response(query)


@router.get("", response_model=list[QueryResponse])
async def list_queries(dataset_id: UUID, db: AsyncSession = Depends(get_db)):
    queries = await query_service.list_queries(db, dataset_id)
    return [_to_response(q) for q in queries if q.result]


@router.get("/{query_id}", response_model=QueryResponse)
async def get_query(query_id: UUID, db: AsyncSession = Depends(get_db)):
    query = await query_service.get_query(db, query_id)
    if not query:
        raise HTTPException(status_code=404, detail="Query not found.")
    return _to_response(query)
