from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ColumnInfo(BaseModel):
    name: str
    dtype: str
    sample_values: list
    null_count: int
    unique_count: int


class UploadResponse(BaseModel):
    upload_id: UUID
    dataset_id: UUID
    filename: str
    row_count: int
    columns: list[ColumnInfo]

    model_config = {"from_attributes": True}


class UploadDetail(BaseModel):
    id: UUID
    filename: str
    file_size: int
    mime_type: str
    status: str
    error_msg: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
