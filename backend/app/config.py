import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "NHAA AI Stress & Trauma Assessment Module (14566)"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "sqlite:///./nhaa_stress.db"
    
    # Security & Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "sih-2026-nhaa-14566-super-secret-key-for-demo-purposes-only")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day for demo
    
    # AI Engine Settings
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "deterministic")  # "deterministic" or "llm"
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # CORS Origins
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

    class Config:
        case_sensitive = True

settings = Settings()
