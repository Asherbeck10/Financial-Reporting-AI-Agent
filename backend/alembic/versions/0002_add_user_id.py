"""add user_id for Firebase auth

Revision ID: 0002
Revises: 0001
Create Date: 2026-06-22
"""

from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("uploads", sa.Column("user_id", sa.String(128), nullable=True))
    op.create_index("ix_uploads_user_id", "uploads", ["user_id"])

    op.add_column("datasets", sa.Column("user_id", sa.String(128), nullable=True))
    op.create_index("ix_datasets_user_id", "datasets", ["user_id"])

    op.add_column("queries", sa.Column("user_id", sa.String(128), nullable=True))
    op.create_index("ix_queries_user_id", "queries", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_queries_user_id", "queries")
    op.drop_column("queries", "user_id")

    op.drop_index("ix_datasets_user_id", "datasets")
    op.drop_column("datasets", "user_id")

    op.drop_index("ix_uploads_user_id", "uploads")
    op.drop_column("uploads", "user_id")
