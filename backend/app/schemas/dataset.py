from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.schemas.upload import ColumnInfo


class DatasetSummary(BaseModel):
    id: UUID
    name: str
    row_count: int
    columns: list[ColumnInfo]
    created_at: datetime

    model_config = {"from_attributes": True}


class DataTableResponse(BaseModel):
    rows: list[dict]
    total: int
    page: int
    page_size: int
