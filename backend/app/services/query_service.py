from datetime import datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.query import Query
from app.models.result import Result
from app.services import dataset_service, claude_service
from app.config import settings


async def run_query(db: AsyncSession, dataset_id: UUID, question: str, user_id: str) -> Query:
    dataset = await dataset_service.get_dataset(db, dataset_id, user_id=user_id)
    if dataset is None:
        raise ValueError(f"Dataset {dataset_id} not found")

    query = Query(dataset_id=dataset_id, question=question, status="running", user_id=user_id)
    db.add(query)
    await db.flush()

    try:
        rows = await dataset_service.get_rows_for_prompt(db, dataset_id, settings.DATA_ROWS_IN_PROMPT)
        parsed, tokens = await claude_service.ask(dataset, rows, question)

        result = Result(
            query_id=query.id,
            answer_text=parsed.get("answer_text", ""),
            chart_type=parsed.get("chart_type"),
            chart_title=parsed.get("chart_title"),
            chart_data=parsed.get("chart_data"),
            chart_config=parsed.get("chart_config"),
            summary_stats=parsed.get("summary_stats"),
            raw_response=parsed.get("_raw", ""),
            tokens_used=tokens,
        )
        db.add(result)
        query.status = "done"
        query.completed_at = datetime.utcnow()
    except Exception as exc:
        query.status = "failed"
        await db.commit()
        raise exc

    await db.commit()

    refreshed = await db.execute(
        select(Query)
        .where(Query.id == query.id)
        .options(selectinload(Query.result))
    )
    return refreshed.scalar_one()


async def get_query(db: AsyncSession, query_id: UUID) -> Query | None:
    result = await db.execute(
        select(Query).where(Query.id == query_id).options(selectinload(Query.result))
    )
    return result.scalar_one_or_none()


async def list_queries(db: AsyncSession, dataset_id: UUID) -> list[Query]:
    result = await db.execute(
        select(Query)
        .where(Query.dataset_id == dataset_id)
        .options(selectinload(Query.result))
        .order_by(Query.created_at.asc())
    )
    return list(result.scalars().all())
