from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    ANTHROPIC_API_KEY: str
    CLAUDE_MODEL: str = "claude-sonnet-4-6"
    MAX_UPLOAD_BYTES: int = 20 * 1024 * 1024
    DATA_ROWS_IN_PROMPT: int = 100
    UPLOAD_DIR: str = "/app/uploads"
    environment: str = "development"
    allowed_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def parse_origins(cls, v: object) -> object:
        if isinstance(v, str):
            return [o.strip() for o in v.split(",") if o.strip()]
        return v

    model_config = {"env_file": ".env"}


settings = Settings()
