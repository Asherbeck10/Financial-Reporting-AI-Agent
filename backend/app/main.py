from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import uploads, datasets, queries


def create_app() -> FastAPI:
    app = FastAPI(title="Financial Reporting AI Agent", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(uploads.router, prefix="/api/uploads", tags=["uploads"])
    app.include_router(datasets.router, prefix="/api/datasets", tags=["datasets"])
    app.include_router(queries.router, prefix="/api/queries", tags=["queries"])

    return app


app = create_app()
