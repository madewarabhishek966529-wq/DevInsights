from fastapi import APIRouter
from app.services.github_service import github_client
from app.schemas.developer import HealthScoreBreakdown
from app.analytics.health_analyzer import calculate_repository_health

router = APIRouter()

@router.get("/{owner}/{repo}/health", response_model=HealthScoreBreakdown)
async def get_repository_health(owner: str, repo: str):
    repo_data = await github_client.get_repository_details(owner, repo)
    return calculate_repository_health(repo_data)
