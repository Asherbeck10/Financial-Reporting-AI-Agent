import os
from typing import AsyncGenerator, Optional

from fastapi import Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import AsyncSessionLocal
from app.firebase import verify_token

_E2E = os.getenv("E2E_BYPASS_AUTH") == "1"


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session


async def get_current_user(authorization: Optional[str] = Header(default=None)) -> dict:
    if _E2E:
        return {"uid": "e2e-test-uid", "email": "e2e@test.com"}
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization[len("Bearer "):]
    try:
        return verify_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
