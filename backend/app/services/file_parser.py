import io
from dataclasses import dataclass, field

import pandas as pd
from fastapi import UploadFile, HTTPException


ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls"}
ALLOWED_MIME_TYPES = {
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/octet-stream",
}


@dataclass
class ColumnInfo:
    name: str
    dtype: str
    sample_values: list
    null_count: int
    unique_count: int


@dataclass
class ParsedData:
    filename: str
    rows: list[dict]
    columns: list[ColumnInfo]
    row_count: int
    sheet_name: str | None = None
    numeric_stats: dict = field(default_factory=dict)


def _infer_dtype(series: pd.Series) -> str:
    if pd.api.types.is_numeric_dtype(series):
        return "numeric"
    try:
        pd.to_datetime(series.dropna().head(20), infer_datetime_format=True)
        return "date"
    except Exception:
        return "text"


def _compute_column_info(df: pd.DataFrame) -> list[ColumnInfo]:
    infos = []
    for col in df.columns:
        series = df[col]
        dtype = _infer_dtype(series)
        sample = [v for v in series.dropna().head(5).tolist() if v is not None]
        infos.append(ColumnInfo(
            name=str(col),
            dtype=dtype,
            sample_values=sample,
            null_count=int(series.isna().sum()),
            unique_count=int(series.nunique()),
        ))
    return infos


def _compute_numeric_stats(df: pd.DataFrame) -> dict:
    stats = {}
    for col in df.select_dtypes(include="number").columns:
        stats[col] = {
            "min": float(df[col].min()) if not pd.isna(df[col].min()) else None,
            "max": float(df[col].max()) if not pd.isna(df[col].max()) else None,
            "mean": float(df[col].mean()) if not pd.isna(df[col].mean()) else None,
            "sum": float(df[col].sum()) if not pd.isna(df[col].sum()) else None,
        }
    return stats


def _clean_rows(df: pd.DataFrame) -> list[dict]:
    rows = []
    for record in df.to_dict(orient="records"):
        cleaned = {}
        for k, v in record.items():
            if pd.isna(v) if not isinstance(v, (list, dict)) else False:
                cleaned[str(k)] = None
            elif isinstance(v, float) and v != v:
                cleaned[str(k)] = None
            else:
                try:
                    import math
                    cleaned[str(k)] = None if (isinstance(v, float) and math.isnan(v)) else v
                except Exception:
                    cleaned[str(k)] = str(v)
        rows.append(cleaned)
    return rows


async def parse(file: UploadFile) -> ParsedData:
    import os
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Only CSV and Excel files are accepted.",
        )

    content = await file.read()
    buf = io.BytesIO(content)
    sheet_name = None

    try:
        if ext == ".csv":
            df = pd.read_csv(buf, low_memory=False)
        else:
            xl = pd.ExcelFile(buf)
            sheet_name = xl.sheet_names[0]
            df = xl.parse(sheet_name)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Could not parse file: {exc}")

    df.columns = [str(c).strip() for c in df.columns]
    df = df.where(pd.notnull(df), None)

    columns = _compute_column_info(df)
    numeric_stats = _compute_numeric_stats(df)
    rows = _clean_rows(df)

    return ParsedData(
        filename=file.filename or "upload",
        rows=rows,
        columns=columns,
        row_count=len(rows),
        sheet_name=sheet_name,
        numeric_stats=numeric_stats,
    )
