from fastapi import APIRouter, Query, HTTPException
from typing import Dict, Any, List, Optional
import asyncio

from app.services.github_service import github_client
from app.analytics.insights_engine import generate_smart_insights
from app.analytics.data_processor import process_languages, process_activity_events

router = APIRouter()

# 1. GET /api/github/users/{username}
@router.get("/users/{username}")
async def get_github_user(username: str):
    clean_user = username.strip().lstrip("@")
    return await github_client.get_user_profile(clean_user)

# 2. GET /api/github/users/{username}/repos
@router.get("/users/{username}/repos")
async def get_github_user_repos(
    username: str,
    sort: str = Query("updated", description="created, updated, pushed, full_name"),
    per_page: int = Query(100, ge=1, le=100)
):
    clean_user = username.strip().lstrip("@")
    return await github_client.get_user_repositories(clean_user, sort=sort, per_page=per_page)

# 3. GET /api/github/users/{username}/insights
@router.get("/users/{username}/insights")
async def get_github_user_insights(username: str):
    clean_user = username.strip().lstrip("@")
    user_task = github_client.get_user_profile(clean_user)
    repos_task = github_client.get_user_repositories(clean_user)
    events_task = github_client.get_user_events(clean_user)

    user_data, repos, events = await asyncio.gather(
        user_task, repos_task, events_task
    )

    languages = [l.model_dump() for l in process_languages(repos)]
    activity_analytics = process_activity_events(events)

    insights = generate_smart_insights(
        user=user_data,
        repos=repos,
        languages=languages,
        activity_stats=activity_analytics.model_dump()
    )
    return insights

# 4. GET /api/github/repos/{owner}/{repo}
@router.get("/repos/{owner}/{repo}")
async def get_github_repo(owner: str, repo: str):
    return await github_client.get_repository_details(owner, repo)

# 5. GET /api/github/repos/{owner}/{repo}/commits
@router.get("/repos/{owner}/{repo}/commits")
async def get_github_repo_commits(owner: str, repo: str, per_page: int = Query(30, ge=1, le=100)):
    return await github_client.get_repository_commits(owner, repo, per_page=per_page)

# 6. GET /api/github/repos/{owner}/{repo}/pulls
@router.get("/repos/{owner}/{repo}/pulls")
async def get_github_repo_pulls(
    owner: str,
    repo: str,
    state: str = Query("all", pattern="^(all|open|closed)$"),
    per_page: int = Query(30, ge=1, le=100)
):
    return await github_client.get_repository_pulls(owner, repo, state=state, per_page=per_page)

# 7. GET /api/github/repos/{owner}/{repo}/issues
@router.get("/repos/{owner}/{repo}/issues")
async def get_github_repo_issues(
    owner: str,
    repo: str,
    state: str = Query("all", pattern="^(all|open|closed)$"),
    per_page: int = Query(30, ge=1, le=100)
):
    raw_issues = await github_client.get_repository_issues(owner, repo, state=state, per_page=per_page)
    return [i for i in raw_issues if "pull_request" not in i]

# 8. GET /api/github/search/users
@router.get("/search/users")
async def search_github_users(
    q: str = Query(..., min_length=1),
    per_page: int = Query(20, ge=1, le=50)
):
    return await github_client.search_users(query=q.strip(), per_page=per_page)

# 9. GET /api/github/search/repos
@router.get("/search/repos")
async def search_github_repos(
    q: str = Query(..., min_length=1),
    sort: str = Query("stars"),
    order: str = Query("desc"),
    per_page: int = Query(20, ge=1, le=50)
):
    return await github_client.search_repositories(query=q.strip(), sort=sort, order=order, per_page=per_page)
