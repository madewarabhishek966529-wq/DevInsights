from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from app.services.github_service import github_client
from app.schemas.developer import (
    DeveloperOverview, RepositorySummary, LanguageAnalytics,
    ContributionData, ActivityAnalytics, PortfolioAuditResult, SmartInsight
)
from app.analytics.data_processor import process_languages, process_activity_events, generate_contribution_heatmap
from app.analytics.health_analyzer import calculate_repository_health
from app.analytics.portfolio_audit import run_portfolio_audit
from app.analytics.insights_engine import generate_smart_insights

router = APIRouter()

@router.get("/{username}/overview", response_model=DeveloperOverview)
async def get_developer_overview(username: str):
    user_data = await github_client.get_user_profile(username)
    repos = await github_client.get_user_repositories(username)
    
    total_stars = sum(r.get("stargazers_count", 0) for r in repos)
    total_forks = sum(r.get("forks_count", 0) for r in repos)
    
    # Identify primary language
    lang_counts = {}
    for r in repos:
        lang = r.get("language")
        if lang:
            lang_counts[lang] = lang_counts.get(lang, 0) + 1
    
    primary_lang = max(lang_counts.items(), key=lambda x: x[1])[0] if lang_counts else None

    return DeveloperOverview(
        username=user_data.get("login", username),
        name=user_data.get("name"),
        avatar_url=user_data.get("avatar_url", ""),
        bio=user_data.get("bio"),
        location=user_data.get("location"),
        company=user_data.get("company"),
        blog=user_data.get("blog"),
        twitter_username=user_data.get("twitter_username"),
        html_url=user_data.get("html_url", f"https://github.com/{username}"),
        public_repos=user_data.get("public_repos", len(repos)),
        public_gists=user_data.get("public_gists", 0),
        followers=user_data.get("followers", 0),
        following=user_data.get("following", 0),
        created_at=user_data.get("created_at", ""),
        total_stars=total_stars,
        total_forks=total_forks,
        primary_language=primary_lang,
        is_hireable=user_data.get("hireable")
    )

@router.get("/{username}/repositories", response_model=List[RepositorySummary])
async def get_developer_repositories(
    username: str,
    sort: str = Query("updated", pattern="^(updated|stars|forks|size|name)$"),
    order: str = Query("desc", pattern="^(asc|desc)$"),
    language: Optional[str] = None,
    include_forks: bool = True,
    limit: int = Query(100, ge=1, le=100)
):
    repos = await github_client.get_user_repositories(username, sort="updated", per_page=100)
    
    filtered_repos = []
    for r in repos:
        if not include_forks and r.get("fork", False):
            continue
        if language and r.get("language") and r.get("language").lower() != language.lower():
            continue
        
        # Calculate health score
        health = calculate_repository_health(r)

        filtered_repos.append(RepositorySummary(
            id=r.get("id"),
            name=r.get("name"),
            full_name=r.get("full_name"),
            description=r.get("description"),
            html_url=r.get("html_url"),
            language=r.get("language"),
            stargazers_count=r.get("stargazers_count", 0),
            forks_count=r.get("forks_count", 0),
            open_issues_count=r.get("open_issues_count", 0),
            size_kb=r.get("size", 0),
            created_at=r.get("created_at", ""),
            updated_at=r.get("updated_at", ""),
            pushed_at=r.get("pushed_at"),
            is_fork=r.get("fork", False),
            is_archived=r.get("archived", False),
            license_name=r.get("license", {}).get("name") if r.get("license") else None,
            default_branch=r.get("default_branch", "main"),
            topics=r.get("topics", []),
            health_score=health.overall_score
        ))

    # Sorting
    reverse = (order == "desc")
    if sort == "stars":
        filtered_repos.sort(key=lambda x: x.stargazers_count, reverse=reverse)
    elif sort == "forks":
        filtered_repos.sort(key=lambda x: x.forks_count, reverse=reverse)
    elif sort == "size":
        filtered_repos.sort(key=lambda x: x.size_kb, reverse=reverse)
    elif sort == "name":
        filtered_repos.sort(key=lambda x: x.name.lower(), reverse=reverse)
    else: # updated
        filtered_repos.sort(key=lambda x: x.updated_at, reverse=reverse)

    return filtered_repos[:limit]

@router.get("/{username}/languages", response_model=LanguageAnalytics)
async def get_developer_languages(username: str):
    repos = await github_client.get_user_repositories(username)
    stats = process_languages(repos)
    total_bytes = sum(s.bytes for s in stats)
    
    return LanguageAnalytics(
        languages=stats,
        total_bytes=total_bytes,
        total_repos_analyzed=len(repos)
    )

@router.get("/{username}/activity", response_model=ActivityAnalytics)
async def get_developer_activity(username: str):
    events = await github_client.get_user_events(username, per_page=100)
    return process_activity_events(events)

@router.get("/{username}/contributions", response_model=ContributionData)
async def get_developer_contributions(username: str, year: Optional[int] = None):
    # Try GraphQL first if token exists
    gql_cal = await github_client.get_user_contributions_graphql(username)
    events = await github_client.get_user_events(username, per_page=100)
    repos = await github_client.get_user_repositories(username)
    
    return generate_contribution_heatmap(events, repos, gql_calendar=gql_cal, year=year)

@router.get("/{username}/portfolio-audit", response_model=PortfolioAuditResult)
async def get_developer_portfolio_audit(username: str):
    user_data = await github_client.get_user_profile(username)
    repos = await github_client.get_user_repositories(username)
    return run_portfolio_audit(user_data, repos)

@router.get("/{username}/insights", response_model=List[SmartInsight])
async def get_developer_insights(username: str):
    user_data = await github_client.get_user_profile(username)
    repos = await github_client.get_user_repositories(username)
    lang_stats = [l.model_dump() for l in process_languages(repos)]
    events = await github_client.get_user_events(username, per_page=100)
    act_analytics = process_activity_events(events)
    
    return generate_smart_insights(user_data, repos, lang_stats, act_analytics.model_dump())
