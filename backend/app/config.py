from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    ANTHROPIC_API_KEY: str
    FIREBASE_PROJECT_ID: str = ""
    CLAUDE_MODEL: str = "claude-sonnet-4-6"
    MAX_UPLOAD_BYTES: int = 20 * 1024 * 1024
    DATA_ROWS_IN_PROMPT: int = 100
    UPLOAD_DIR: str = "/app/uploads"
    environment: str = "development"
    # Comma-separated list of allowed CORS origins
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"

    model_config = {"env_file": ".env"}


settings = Settings()
