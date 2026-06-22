import io
import textwrap
from unittest.mock import AsyncMock, MagicMock

import pandas as pd
import pytest
from fastapi import HTTPException

from app.services.file_parser import (
    _infer_dtype,
    _compute_column_info,
    _compute_numeric_stats,
    _clean_rows,
    parse,
)


def _upload_file(content: bytes, filename: str, content_type: str = "text/csv"):
    mock = MagicMock()
    mock.filename = filename
    mock.content_type = content_type
    mock.size = len(content)
    mock.read = AsyncMock(return_value=content)
    return mock


# ── dtype inference ────────────────────────────────────────────────────────────

def test_infer_dtype_numeric():
    assert _infer_dtype(pd.Series([1, 2, 3, 4])) == "numeric"


def test_infer_dtype_float():
    assert _infer_dtype(pd.Series([1.1, 2.2, None])) == "numeric"


def test_infer_dtype_date():
    assert _infer_dtype(pd.Series(["2024-01-01", "2024-02-01", "2024-03-01"])) == "date"


def test_infer_dtype_text():
    assert _infer_dtype(pd.Series(["apple", "banana", "cherry"])) == "text"


# ── column info ───────────────────────────────────────────────────────────────

def test_compute_column_info_basic():
    df = pd.DataFrame({"revenue": [100, 200, None], "region": ["North", "South", "East"]})
    cols = _compute_column_info(df)
    assert len(cols) == 2
    rev = next(c for c in cols if c.name == "revenue")
    assert rev.dtype == "numeric"
    assert rev.null_count == 1
    assert rev.unique_count == 2


def test_compute_column_info_sample_values_capped():
    df = pd.DataFrame({"x": range(20)})
    (col,) = _compute_column_info(df)
    assert len(col.sample_values) <= 5


# ── numeric stats ─────────────────────────────────────────────────────────────

def test_compute_numeric_stats():
    df = pd.DataFrame({"sales": [10.0, 20.0, 30.0]})
    stats = _compute_numeric_stats(df)
    assert stats["sales"]["min"] == 10.0
    assert stats["sales"]["max"] == 30.0
    assert stats["sales"]["sum"] == 60.0


def test_compute_numeric_stats_skips_text_columns():
    df = pd.DataFrame({"name": ["a", "b"], "amount": [5.0, 10.0]})
    stats = _compute_numeric_stats(df)
    assert "name" not in stats
    assert "amount" in stats


# ── row cleaning ──────────────────────────────────────────────────────────────

def test_clean_rows_replaces_nan_with_none():
    df = pd.DataFrame({"a": [1, None], "b": ["x", None]})
    rows = _clean_rows(df)
    assert rows[1]["a"] is None
    assert rows[1]["b"] is None


def test_clean_rows_preserves_zero():
    df = pd.DataFrame({"v": [0, 1]})
    rows = _clean_rows(df)
    assert rows[0]["v"] == 0


# ── parse() ───────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_parse_csv_basic():
    csv_bytes = b"month,revenue\nJan,1000\nFeb,2000\nMar,1500\n"
    result = await parse(_upload_file(csv_bytes, "sales.csv"))
    assert result.filename == "sales.csv"
    assert result.row_count == 3
    assert len(result.columns) == 2
    assert result.rows[0]["month"] == "Jan"


@pytest.mark.asyncio
async def test_parse_csv_with_missing_values():
    csv_bytes = b"a,b\n1,\n2,3\n"
    result = await parse(_upload_file(csv_bytes, "data.csv"))
    assert result.rows[0]["b"] is None
    assert result.rows[1]["b"] == 3


@pytest.mark.asyncio
async def test_parse_unsupported_extension_raises_400():
    with pytest.raises(HTTPException) as exc_info:
        await parse(_upload_file(b"hello", "data.txt"))
    assert exc_info.value.status_code == 400


@pytest.mark.asyncio
async def test_parse_malformed_excel_raises_422():
    # Random bytes with .xlsx extension — pandas ExcelFile will reject them
    junk = b"this is definitely not a valid excel file"
    with pytest.raises(HTTPException) as exc_info:
        await parse(_upload_file(junk, "bad.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
    assert exc_info.value.status_code == 422
