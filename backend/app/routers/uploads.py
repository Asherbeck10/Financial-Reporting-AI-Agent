from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.models.upload import Upload
from app.schemas.upload import UploadResponse, ColumnInfo
from app.services import file_parser, dataset_service
from app.config import settings

router = APIRouter()


@router.post("", response_model=UploadResponse)
async def create_upload(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    if file.size and file.size > settings.MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds 20 MB limit.")

    upload = Upload(
        filename=file.filename or "upload",
        file_size=file.size or 0,
        mime_type=file.content_type or "application/octet-stream",
        status="processing",
    )
    db.add(upload)
    await db.flush()

    try:
        parsed = await file_parser.parse(file)
        dataset = await dataset_service.create_dataset(db, parsed, upload)
        upload.status = "done"
        await db.commit()
    except HTTPException:
        upload.status = "failed"
        await db.commit()
        raise
    except Exception as exc:
        upload.status = "failed"
        upload.error_msg = str(exc)
        await db.commit()
        raise HTTPException(status_code=500, detail=f"Processing failed: {exc}")

    return UploadResponse(
        upload_id=upload.id,
        dataset_id=dataset.id,
        filename=upload.filename,
        row_count=dataset.row_count,
        columns=[ColumnInfo(**c) for c in dataset.columns],
    )
