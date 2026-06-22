from datetime import datetime
from uuid import UUID, uuid4
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, func, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB

from app.database import Base

if TYPE_CHECKING:
    from app.models.query import Query


class Result(Base):
    __tablename__ = "results"

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    query_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("queries.id", ondelete="CASCADE"), nullable=False, unique=True)
    answer_text: Mapped[str] = mapped_column(Text, nullable=False)
    chart_type: Mapped[str | None] = mapped_column(Text, nullable=True)
    chart_title: Mapped[str | None] = mapped_column(Text, nullable=True)
    chart_data: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    chart_config: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    summary_stats: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    raw_response: Mapped[str] = mapped_column(Text, nullable=False)
    tokens_used: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now())

    query: Mapped["Query"] = relationship("Query", back_populates="result")
