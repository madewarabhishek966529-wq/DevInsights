from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
import asyncio

from app.services.github_service import github_client
from app.schemas.developer import (
    HealthScoreBreakdown,
    RepositoryDetailExtended,
    CommitDetailItem,
    PullRequestDetailItem,
    IssueDetailItem,
    ContributorDetailItem,
    ReleaseDetailItem,
    BranchDetailItem,
    RepositoryComparisonResponse,
    RepositoryComparisonItem,
)
from app.analytics.health_analyzer import calculate_repository_health

router = APIRouter()

def _map_commit(c: Dict[str, Any]) -> CommitDetailItem:
    commit_data = c.get("commit") or {}
    author_data = commit_data.get("author") or {}
    msg = commit_data.get("message", "")
    short_msg = msg.split("\n")[0] if msg else "No commit message"
    return CommitDetailItem(
        sha=c.get("sha", "")[:7],
        author_name=author_data.get("name", "Unknown"),
        author_date=author_data.get("date", ""),
        message=short_msg,
        html_url=c.get("html_url", "")
    )

def _map_pull(p: Dict[str, Any]) -> PullRequestDetailItem:
    return PullRequestDetailItem(
        id=p.get("id", 0),
        number=p.get("number", 0),
        title=p.get("title", "Untitled PR"),
        state=p.get("state", "open"),
        created_at=p.get("created_at", ""),
        merged_at=p.get("merged_at"),
        closed_at=p.get("closed_at"),
        html_url=p.get("html_url", ""),
        user_login=(p.get("user") or {}).get("login", "unknown")
    )

def _map_issue(i: Dict[str, Any]) -> IssueDetailItem:
    return IssueDetailItem(
        id=i.get("id", 0),
        number=i.get("number", 0),
        title=i.get("title", "Untitled Issue"),
        state=i.get("state", "open"),
        created_at=i.get("created_at", ""),
        closed_at=i.get("closed_at"),
        comments_count=i.get("comments", 0),
        html_url=i.get("html_url", ""),
        user_login=(i.get("user") or {}).get("login", "unknown")
    )

def _map_contributor(c: Dict[str, Any]) -> ContributorDetailItem:
    return ContributorDetailItem(
        login=c.get("login", "unknown"),
        avatar_url=c.get("avatar_url", ""),
        contributions=c.get("contributions", 0),
        html_url=c.get("html_url", "")
    )

def _map_release(r: Dict[str, Any]) -> ReleaseDetailItem:
    return ReleaseDetailItem(
        id=r.get("id", 0),
        tag_name=r.get("tag_name", "v0.0"),
        name=r.get("name") or r.get("tag_name", ""),
        published_at=r.get("published_at"),
        prerelease=r.get("prerelease", False),
        html_url=r.get("html_url", "")
    )

def _map_branch(b: Dict[str, Any]) -> BranchDetailItem:
    commit_sha = (b.get("commit") or {}).get("sha", "")[:7]
    return BranchDetailItem(
        name=b.get("name", "main"),
        commit_sha=commit_sha,
        protected=b.get("protected", False)
    )

# 1. Search Repositories
@router.get("/search")
async def search_repositories(
    q: str = Query(..., min_length=1, description="Repository search query"),
    sort: str = Query("stars", description="stars, forks, or updated"),
    order: str = Query("desc", description="asc or desc"),
    per_page: int = Query(20, ge=1, le=50)
):
    clean_q = q.strip()
    return await github_client.search_repositories(query=clean_q, sort=sort, order=order, per_page=per_page)

# 2. Compare Repositories (side-by-side comparison)
@router.get("/compare", response_model=RepositoryComparisonResponse)
async def compare_repositories(
    repos: str = Query(..., description="Comma-separated repository full names, e.g. facebook/react,vuejs/vue")
):
    repo_list = [r.strip() for r in repos.split(",") if r.strip()]
    if len(repo_list) < 2:
        raise HTTPException(status_code=400, detail="Repository comparison requires at least 2 repositories.")
    if len(repo_list) > 4:
        raise HTTPException(status_code=400, detail="Repository comparison supports a maximum of 4 repositories at once.")

    comparison_items: List[RepositoryComparisonItem] = []

    for full_name in repo_list:
        parts = full_name.split("/")
        if len(parts) != 2:
            raise HTTPException(status_code=400, detail=f"Invalid repository format '{full_name}'. Expected 'owner/repo'.")
        owner, repo = parts[0], parts[1]

        try:
            repo_data, commits_data, pulls_data = await asyncio.gather(
                github_client.get_repository_details(owner, repo),
                github_client.get_repository_commits(owner, repo, per_page=30),
                github_client.get_repository_pulls(owner, repo, state="all", per_page=30),
                return_exceptions=True
            )

            if isinstance(repo_data, Exception):
                raise repo_data

            commits = commits_data if isinstance(commits_data, list) else []
            pulls = pulls_data if isinstance(pulls_data, list) else []

            health = calculate_repository_health(repo_data)
            open_prs = sum(1 for p in pulls if p.get("state") == "open")
            closed_prs = sum(1 for p in pulls if p.get("state") == "closed")

            item = RepositoryComparisonItem(
                name=repo_data.get("name", repo),
                full_name=repo_data.get("full_name", full_name),
                stars=repo_data.get("stargazers_count", 0),
                forks=repo_data.get("forks_count", 0),
                open_issues=repo_data.get("open_issues_count", 0),
                language=repo_data.get("language"),
                health_score=health.overall_score,
                size_kb=repo_data.get("size", 0),
                updated_at=repo_data.get("updated_at", ""),
                pushed_at=repo_data.get("pushed_at"),
                open_prs_count=open_prs,
                closed_prs_count=closed_prs,
                recent_commit_count=len(commits)
            )
            comparison_items.append(item)

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch data for repository '{full_name}': {str(e)}")

    metrics_matrix = [
        {"metric": "Stars", **{item.name: item.stars for item in comparison_items}},
        {"metric": "Forks", **{item.name: item.forks for item in comparison_items}},
        {"metric": "Open Issues", **{item.name: item.open_issues for item in comparison_items}},
        {"metric": "Health Score", **{item.name: item.health_score for item in comparison_items}},
        {"metric": "Recent Commits Sampled", **{item.name: item.recent_commit_count for item in comparison_items}},
        {"metric": "Primary Language", **{item.name: item.language or "None" for item in comparison_items}},
    ]

    return RepositoryComparisonResponse(
        repositories=comparison_items,
        metrics_matrix=metrics_matrix
    )

# 3. Repository Health
@router.get("/{owner}/{repo}/health", response_model=HealthScoreBreakdown)
async def get_repository_health(owner: str, repo: str):
    repo_data = await github_client.get_repository_details(owner, repo)
    return calculate_repository_health(repo_data)

# 4. Repository Commits
@router.get("/{owner}/{repo}/commits", response_model=List[CommitDetailItem])
async def get_repository_commits(owner: str, repo: str, per_page: int = Query(30, ge=1, le=100)):
    raw_commits = await github_client.get_repository_commits(owner, repo, per_page=per_page)
    return [_map_commit(c) for c in raw_commits]

# 5. Repository Pull Requests
@router.get("/{owner}/{repo}/pulls", response_model=List[PullRequestDetailItem])
async def get_repository_pulls(owner: str, repo: str, state: str = Query("all", pattern="^(all|open|closed)$"), per_page: int = Query(30, ge=1, le=100)):
    raw_pulls = await github_client.get_repository_pulls(owner, repo, state=state, per_page=per_page)
    return [_map_pull(p) for p in raw_pulls]

# 6. Repository Issues
@router.get("/{owner}/{repo}/issues", response_model=List[IssueDetailItem])
async def get_repository_issues(owner: str, repo: str, state: str = Query("all", pattern="^(all|open|closed)$"), per_page: int = Query(30, ge=1, le=100)):
    raw_issues = await github_client.get_repository_issues(owner, repo, state=state, per_page=per_page)
    # Filter out pull requests which GitHub includes in issues API
    clean_issues = [i for i in raw_issues if "pull_request" not in i]
    return [_map_issue(i) for i in clean_issues]

# 7. Repository Contributors
@router.get("/{owner}/{repo}/contributors", response_model=List[ContributorDetailItem])
async def get_repository_contributors(owner: str, repo: str, per_page: int = Query(30, ge=1, le=100)):
    raw = await github_client.get_repository_contributors(owner, repo, per_page=per_page)
    return [_map_contributor(c) for c in raw]

# 8. Repository Releases
@router.get("/{owner}/{repo}/releases", response_model=List[ReleaseDetailItem])
async def get_repository_releases(owner: str, repo: str, per_page: int = Query(15, ge=1, le=50)):
    raw = await github_client.get_repository_releases(owner, repo, per_page=per_page)
    return [_map_release(r) for r in raw]

# 9. Repository Branches
@router.get("/{owner}/{repo}/branches", response_model=List[BranchDetailItem])
async def get_repository_branches(owner: str, repo: str, per_page: int = Query(30, ge=1, le=100)):
    raw = await github_client.get_repository_branches(owner, repo, per_page=per_page)
    return [_map_branch(b) for b in raw]

# 10. Repository Full Extended Detail
@router.get("/{owner}/{repo}", response_model=RepositoryDetailExtended)
async def get_repository_detail_extended(owner: str, repo: str):
    repo_data = await github_client.get_repository_details(owner, repo)
    health = calculate_repository_health(repo_data)

    # Concurrently gather sub-resources with grace on failures
    commits_task = github_client.get_repository_commits(owner, repo, per_page=15)
    pulls_task = github_client.get_repository_pulls(owner, repo, state="all", per_page=15)
    issues_task = github_client.get_repository_issues(owner, repo, state="all", per_page=15)
    contributors_task = github_client.get_repository_contributors(owner, repo, per_page=12)
    releases_task = github_client.get_repository_releases(owner, repo, per_page=5)
    branches_task = github_client.get_repository_branches(owner, repo, per_page=10)
    languages_task = github_client.get_repository_languages(owner, repo)

    results = await asyncio.gather(
        commits_task,
        pulls_task,
        issues_task,
        contributors_task,
        releases_task,
        branches_task,
        languages_task,
        return_exceptions=True
    )

    commits_raw = results[0] if isinstance(results[0], list) else []
    pulls_raw = results[1] if isinstance(results[1], list) else []
    issues_raw = results[2] if isinstance(results[2], list) else []
    contribs_raw = results[3] if isinstance(results[3], list) else []
    releases_raw = results[4] if isinstance(results[4], list) else []
    branches_raw = results[5] if isinstance(results[5], list) else []
    languages_raw = results[6] if isinstance(results[6], dict) else {}

    clean_issues = [i for i in issues_raw if "pull_request" not in i]

    license_info = repo_data.get("license") or {}

    return RepositoryDetailExtended(
        id=repo_data.get("id", 0),
        name=repo_data.get("name", repo),
        full_name=repo_data.get("full_name", f"{owner}/{repo}"),
        owner=owner,
        description=repo_data.get("description"),
        html_url=repo_data.get("html_url", f"https://github.com/{owner}/{repo}"),
        language=repo_data.get("language"),
        stargazers_count=repo_data.get("stargazers_count", 0),
        forks_count=repo_data.get("forks_count", 0),
        open_issues_count=repo_data.get("open_issues_count", 0),
        watchers_count=repo_data.get("watchers_count", 0),
        size_kb=repo_data.get("size", 0),
        default_branch=repo_data.get("default_branch", "main"),
        license_name=license_info.get("name") or license_info.get("spdx_id"),
        created_at=repo_data.get("created_at", ""),
        updated_at=repo_data.get("updated_at", ""),
        pushed_at=repo_data.get("pushed_at"),
        topics=repo_data.get("topics", []),
        health_score=health.overall_score,
        languages_breakdown=languages_raw,
        recent_commits=[_map_commit(c) for c in commits_raw],
        recent_pulls=[_map_pull(p) for p in pulls_raw],
        recent_issues=[_map_issue(i) for i in clean_issues],
        contributors=[_map_contributor(c) for c in contribs_raw],
        releases=[_map_release(r) for r in releases_raw],
        branches=[_map_branch(b) for b in branches_raw]
    )
