from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import List

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=True)

    APP_NAME: str = "EcoPilot"
    PROJECT_NAME: str = "EcoPilot"
    TAGLINE: str = "Enterprise ESG Management Platform"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/ecopilot"

    JWT_SECRET_KEY: str = "super_secret_jwt_signing_key_for_ecopilot_development_only_12345"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    OPENROUTER_API_KEY: str = ""
    OPENROUTER_MODEL: str = "google/gemma-4-26b-a4b-it:free"
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    OPENROUTER_TEMPERATURE: float = 0.7
    OPENROUTER_MAX_TOKENS: int = 1500
    OPENROUTER_TIMEOUT: int = 30

settings = Settings()
if settings.APP_NAME:
    settings.PROJECT_NAME = settings.APP_NAME
