import os
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    PROJECT_NAME: str = "DevInsights"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # GitHub API Configuration
    GITHUB_TOKEN: Optional[str] = os.getenv("GITHUB_TOKEN", None)
    GITHUB_API_URL: str = "https://api.github.com"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./devinsights.db")
    
    # Cache TTL in seconds (15 minutes default)
    CACHE_TTL_SECONDS: int = int(os.getenv("CACHE_TTL_SECONDS", "900"))
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

settings = Settings()
