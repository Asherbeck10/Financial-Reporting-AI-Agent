"""
Stub Firebase Admin SDK before any app module is imported.
This prevents app.firebase from trying to load a service account file.
"""
import os
import sys
from unittest.mock import MagicMock
import types

# ── required settings before app modules load ──────────────────────────────────
os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://test:test@localhost/test")
os.environ.setdefault("ANTHROPIC_API_KEY", "test-key")

# ── stub asyncpg so SQLAlchemy engine creation doesn't crash ───────────────────
sys.modules.setdefault("asyncpg", MagicMock())

# ── stub firebase_admin so app.firebase doesn't need a service account file ───
sys.modules.setdefault("firebase_admin", MagicMock())
sys.modules.setdefault("firebase_admin.credentials", MagicMock())
sys.modules.setdefault("firebase_admin.auth", MagicMock())

_firebase_mod = types.ModuleType("app.firebase")
_firebase_mod.verify_token = MagicMock(return_value={"uid": "stub-uid"})
sys.modules["app.firebase"] = _firebase_mod

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.dependencies import get_db, get_current_user

TEST_USER = {"uid": "test-uid-001", "email": "tester@example.com"}


class _FakeSession:
    """Minimal async session stub — just enough for router code that does
    add/flush/commit without needing real DB round-trips."""

    def add(self, obj):
        pass

    async def flush(self):
        pass

    async def commit(self):
        pass

    async def refresh(self, obj):
        pass


async def _fake_db():
    yield _FakeSession()


@pytest_asyncio.fixture
async def client():
    app.dependency_overrides[get_db] = _fake_db
    app.dependency_overrides[get_current_user] = lambda: TEST_USER
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def anon_client():
    """Client with no auth override — uses the real get_current_user dependency."""
    app.dependency_overrides[get_db] = _fake_db
    app.dependency_overrides.pop(get_current_user, None)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
