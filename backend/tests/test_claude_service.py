import json
from unittest.mock import MagicMock

import pytest

from app.services.claude_service import _parse_response, _build_user_message


# ── _parse_response ───────────────────────────────────────────────────────────

def _make_payload(**overrides) -> str:
    base = {
        "answer_text": "Revenue grew 15% YoY.",
        "chart_type": "bar",
        "chart_title": "Monthly Revenue",
        "chart_data": [{"label": "Jan", "value": 1000}, {"label": "Feb", "value": 1200}],
        "chart_config": {"x_label": "Month", "y_label": "USD", "color_scheme": ["#6366F1"]},
        "summary_stats": {"total": 2200},
    }
    base.update(overrides)
    return json.dumps(base)


def test_parse_response_valid():
    result = _parse_response(_make_payload())
    assert result["answer_text"] == "Revenue grew 15% YoY."
    assert result["chart_type"] == "bar"
    assert len(result["chart_data"]) == 2


def test_parse_response_strips_markdown_fences():
    raw = f"```json\n{_make_payload()}\n```"
    result = _parse_response(raw)
    assert result["answer_text"] == "Revenue grew 15% YoY."


def test_parse_response_strips_plain_fences():
    raw = f"```\n{_make_payload()}\n```"
    result = _parse_response(raw)
    assert "answer_text" in result


def test_parse_response_missing_answer_text_raises():
    payload = json.dumps({"chart_type": "bar"})
    with pytest.raises(ValueError, match="answer_text"):
        _parse_response(payload)


def test_parse_response_coerces_chart_values_to_float():
    payload = json.dumps({
        "answer_text": "ok",
        "chart_data": [{"label": "Q1", "value": "500"}],
    })
    result = _parse_response(payload)
    assert result["chart_data"][0]["value"] == 500.0
    assert isinstance(result["chart_data"][0]["value"], float)


def test_parse_response_null_chart_is_fine():
    payload = json.dumps({
        "answer_text": "No chart available.",
        "chart_type": None,
        "chart_data": None,
    })
    result = _parse_response(payload)
    assert result["chart_type"] is None
    assert result["chart_data"] is None


def test_parse_response_invalid_json_raises():
    with pytest.raises(json.JSONDecodeError):
        _parse_response("not json at all")


# ── _build_user_message ───────────────────────────────────────────────────────

def _make_dataset():
    ds = MagicMock()
    ds.name = "sales_2024.csv"
    ds.row_count = 500
    ds.columns = [
        {"name": "month", "dtype": "text", "unique_count": 12, "null_count": 0, "sample_values": ["Jan", "Feb"]},
        {"name": "revenue", "dtype": "numeric", "unique_count": 500, "null_count": 2, "sample_values": [1000, 2000]},
    ]
    return ds


def _make_row(month: str, revenue: int):
    row = MagicMock()
    row.data = {"month": month, "revenue": revenue}
    return row


def test_build_user_message_contains_question():
    msg = _build_user_message(
        _make_dataset(),
        [_make_row("Jan", 1000), _make_row("Feb", 1200)],
        "What is the total revenue?",
    )
    assert "What is the total revenue?" in msg


def test_build_user_message_contains_dataset_name():
    msg = _build_user_message(_make_dataset(), [], "anything")
    assert "sales_2024.csv" in msg


def test_build_user_message_includes_column_metadata():
    msg = _build_user_message(_make_dataset(), [], "anything")
    assert "month" in msg
    assert "revenue" in msg
