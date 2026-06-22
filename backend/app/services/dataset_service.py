from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dataset import Dataset, DataRow
from app.models.upload import Upload
from app.services.file_parser import ParsedData


async def create_dataset(db: AsyncSession, parsed: ParsedData, upload: Upload, user_id: str) -> Dataset:
    dataset = Dataset(
        upload_id=upload.id,
        user_id=user_id,
        name=parsed.filename,
        row_count=parsed.row_count,
        columns=[
            {
                "name": c.name,
                "dtype": c.dtype,
                "sample_values": c.sample_values,
                "null_count": c.null_count,
                "unique_count": c.unique_count,
            }
            for c in parsed.columns
        ],
        sheet_name=parsed.sheet_name,
    )
    db.add(dataset)
    await db.flush()

    if parsed.rows:
        db.add_all(
            DataRow(dataset_id=dataset.id, row_index=i, data=row)
            for i, row in enumerate(parsed.rows)
        )

    await db.commit()
    await db.refresh(dataset)
    return dataset


async def list_datasets(db: AsyncSession, user_id: str) -> list[Dataset]:
    result = await db.execute(
        select(Dataset)
        .where(Dataset.user_id == user_id)
        .order_by(Dataset.created_at.desc())
    )
    return list(result.scalars().all())


async def get_dataset(db: AsyncSession, dataset_id: UUID, user_id: str | None = None) -> Dataset | None:
    query = select(Dataset).where(Dataset.id == dataset_id)
    if user_id is not None:
        query = query.where(Dataset.user_id == user_id)
    result = await db.execute(query)
    return result.scalar_one_or_none()


async def get_rows_for_prompt(db: AsyncSession, dataset_id: UUID, limit: int) -> list[DataRow]:
    result = await db.execute(
        select(DataRow)
        .where(DataRow.dataset_id == dataset_id)
        .order_by(DataRow.row_index)
        .limit(limit)
    )
    return list(result.scalars().all())


async def get_paginated_rows(
    db: AsyncSession, dataset_id: UUID, page: int, page_size: int
) -> tuple[list[dict], int]:
    total_result = await db.execute(
        select(func.count()).select_from(DataRow).where(DataRow.dataset_id == dataset_id)
    )
    total = total_result.scalar_one()

    offset = (page - 1) * page_size
    rows_result = await db.execute(
        select(DataRow)
        .where(DataRow.dataset_id == dataset_id)
        .order_by(DataRow.row_index)
        .offset(offset)
        .limit(page_size)
    )
    rows = [r.data for r in rows_result.scalars().all()]
    return rows, total
