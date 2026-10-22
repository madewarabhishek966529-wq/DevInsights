from fastapi import APIRouter
from app.services.github_service import github_client
from app.services.cache_service import cache
from app.core.config import settings

router = APIRouter()

@router.get("/health")
async def health_check():
    gh_limits = await github_client.get_rate_limit()
    core_limit = gh_limits.get("resources", {}).get("core", {})
    
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "environment": settings.ENVIRONMENT,
        "github_api": {
            "rate_limit": core_limit.get("limit", 60),
            "rate_limit_remaining": core_limit.get("remaining", 60),
            "authenticated": bool(settings.GITHUB_TOKEN)
        },
        "cache": cache.get_stats()
    }
