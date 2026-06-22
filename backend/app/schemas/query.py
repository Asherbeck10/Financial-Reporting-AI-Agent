from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class QueryRequest(BaseModel):
    dataset_id: UUID
    question: str


class ChartDataPoint(BaseModel):
    label: str
    value: float


class ChartConfig(BaseModel):
    x_label: str | None = None
    y_label: str | None = None
    color_scheme: list[str] | None = None


class QueryResponse(BaseModel):
    query_id: UUID
    dataset_id: UUID
    question: str
    answer_text: str
    chart_type: str | None
    chart_title: str | None
    chart_data: list[ChartDataPoint] | None
    chart_config: ChartConfig | None
    summary_stats: dict | None
    created_at: datetime

    model_config = {"from_attributes": True}


class QueryListItem(BaseModel):
    query_id: UUID
    question: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
