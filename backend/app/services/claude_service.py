import json
import re

import anthropic

from app.config import settings
from app.models.dataset import Dataset, DataRow

SYSTEM_PROMPT = """You are a financial data analyst assistant. You receive structured financial data and a natural-language question from an analyst.

Respond ONLY with a valid JSON object — no prose before or after, no markdown fences. Use this exact schema:

{
  "answer_text": "<2-5 sentence plain-English explanation grounded in the data>",
  "chart_type": "<bar|line|pie|table|null>",
  "chart_title": "<string or null>",
  "chart_data": [{"label": "<string>", "value": <number>}] or null,
  "chart_config": {"x_label": "<string>", "y_label": "<string>", "color_scheme": ["<hex>", ...]} or null,
  "summary_stats": {"<metric>": <number or string>} or null
}

Rules:
- chart_type: line for trends over time, bar for comparisons, pie for proportions, table for multi-column breakdowns, null if no chart helps.
- chart_data values must be numbers. Never use strings as values.
- answer_text must be factual and grounded in the data. Never invent numbers.
- summary_stats: up to 5 key metrics.
- If the question cannot be answered from the data, set chart_type and chart_data to null and explain in answer_text."""


def _build_user_message(dataset: Dataset, rows: list[DataRow], question: str) -> str:
    col_lines = "\n".join(
        f"  - {c['name']} ({c['dtype']}): {c['unique_count']} unique, "
        f"{c['null_count']} nulls, sample: {c['sample_values'][:3]}"
        for c in dataset.columns
    )

    headers = [c["name"] for c in dataset.columns]
    csv_lines = [",".join(headers)]
    for row in rows[:settings.DATA_ROWS_IN_PROMPT]:
        csv_lines.append(",".join(str(row.data.get(h, "")) for h in headers))
    data_block = "\n".join(csv_lines)

    return (
        f"Dataset: {dataset.name}\n"
        f"Total rows: {dataset.row_count}\n\n"
        f"Column metadata:\n{col_lines}\n\n"
        f"Data (first {len(rows)} rows):\n```\n{data_block}\n```\n\n"
        f"Question: {question}"
    )


def _parse_response(raw: str) -> dict:
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip(), flags=re.MULTILINE).strip()
    data = json.loads(text)

    if "answer_text" not in data:
        raise ValueError("Claude response missing 'answer_text'")

    if data.get("chart_data"):
        for point in data["chart_data"]:
            point["value"] = float(point["value"])

    return data


client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)


async def ask(dataset: Dataset, rows: list[DataRow], question: str) -> tuple[dict, int]:
    user_message = _build_user_message(dataset, rows, question)

    message = await client.messages.create(
        model=settings.CLAUDE_MODEL,
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}],
    )

    raw = message.content[0].text
    tokens_used = message.usage.input_tokens + message.usage.output_tokens

    parsed = _parse_response(raw)
    parsed["_raw"] = raw
    parsed["_tokens"] = tokens_used
    return parsed, tokens_used
