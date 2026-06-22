from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.schemas.dataset import DatasetSummary, DataTableResponse
from app.schemas.upload import ColumnInfo
from app.services import dataset_service

router = APIRouter()


@router.get("", response_model=list[DatasetSummary])
async def list_datasets(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    datasets = await dataset_service.list_datasets(db, current_user["uid"])
    return [
        DatasetSummary(
            id=d.id,
            name=d.name,
            row_count=d.row_count,
            columns=[ColumnInfo(**c) for c in d.columns],
            created_at=d.created_at,
        )
        for d in datasets
    ]


@router.get("/{dataset_id}", response_model=DatasetSummary)
async def get_dataset(
    dataset_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    dataset = await dataset_service.get_dataset(db, dataset_id, user_id=current_user["uid"])
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")
    return DatasetSummary(
        id=dataset.id,
        name=dataset.name,
        row_count=dataset.row_count,
        columns=[ColumnInfo(**c) for c in dataset.columns],
        created_at=dataset.created_at,
    )


@router.get("/{dataset_id}/rows", response_model=DataTableResponse)
async def get_rows(
    dataset_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    dataset = await dataset_service.get_dataset(db, dataset_id, user_id=current_user["uid"])
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    rows, total = await dataset_service.get_paginated_rows(db, dataset_id, page, page_size)
    return DataTableResponse(rows=rows, total=total, page=page, page_size=page_size)
