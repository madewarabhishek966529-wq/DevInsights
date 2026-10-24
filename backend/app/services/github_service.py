import httpx
import logging
import datetime
from typing import Dict, Any, List, Optional
from fastapi import HTTPException
from app.core.config import settings
from app.services.cache_service import cache

logger = logging.getLogger(__name__)

GITHUB_API_BASE = "https://api.github.com"

class GitHubClient:
    def __init__(self):
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "DevInsights-Analytics-Platform"
        }
        if settings.GITHUB_TOKEN:
            self.headers["Authorization"] = f"Bearer {settings.GITHUB_TOKEN}"

    def _get_headers(self) -> Dict[str, str]:
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "DevInsights-Analytics-Platform"
        }
        if settings.GITHUB_TOKEN:
            headers["Authorization"] = f"Bearer {settings.GITHUB_TOKEN}"
        return headers

    async def _fetch(self, endpoint: str, params: Optional[Dict[str, Any]] = None, ttl: int = 900) -> Any:
        cache_key = f"gh:{endpoint}:{str(params or {})}"
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return cached_data

        url = f"{GITHUB_API_BASE}{endpoint}" if not endpoint.startswith("http") else endpoint
        
        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                response = await client.get(url, headers=self._get_headers(), params=params)
                
                # Check rate limit headers
                remaining = response.headers.get("x-ratelimit-remaining")
                if remaining:
                    logger.info(f"GitHub Rate Limit Remaining: {remaining}")
                
                if response.status_code == 404:
                    raise HTTPException(
                        status_code=404, 
                        detail=f"Requested GitHub resource '{endpoint}' was not found."
                    )
                
                if response.status_code in (403, 429):
                    reset_time = response.headers.get("x-ratelimit-reset")
                    msg = "GitHub API rate limit exceeded."
                    if reset_time:
                        reset_dt = datetime.datetime.fromtimestamp(int(reset_time))
                        msg += f" Rate limit resets at {reset_dt.strftime('%H:%M:%S UTC')}."
                    msg += " To increase limits to 5,000 req/hr, add GITHUB_TOKEN to backend/.env."
                    raise HTTPException(status_code=429, detail=msg)
                
                response.raise_for_status()
                data = response.json()
                cache.set(cache_key, data, ttl=ttl)
                return data

            except httpx.TimeoutException:
                raise HTTPException(status_code=504, detail="GitHub API request timed out. Please try again.")
            except httpx.HTTPStatusError as e:
                raise HTTPException(status_code=e.response.status_code, detail=f"GitHub API error: {str(e)}")
            except HTTPException:
                raise
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Unexpected error communicating with GitHub: {str(e)}")

    async def get_user_profile(self, username: str) -> Dict[str, Any]:
        return await self._fetch(f"/users/{username}")

    async def get_user_repositories(self, username: str, sort: str = "updated", per_page: int = 100) -> List[Dict[str, Any]]:
        return await self._fetch(f"/users/{username}/repos", params={"sort": sort, "per_page": per_page, "type": "all"})

    async def get_user_events(self, username: str, per_page: int = 100) -> List[Dict[str, Any]]:
        # Public events API
        return await self._fetch(f"/users/{username}/events/public", params={"per_page": per_page}, ttl=300)

    async def get_repository_languages(self, owner: str, repo: str) -> Dict[str, int]:
        return await self._fetch(f"/repos/{owner}/{repo}/languages", ttl=1800)

    async def get_repository_details(self, owner: str, repo: str) -> Dict[str, Any]:
        return await self._fetch(f"/repos/{owner}/{repo}")

    async def get_repository_commits(self, owner: str, repo: str, per_page: int = 30) -> List[Dict[str, Any]]:
        try:
            return await self._fetch(f"/repos/{owner}/{repo}/commits", params={"per_page": per_page}, ttl=600)
        except HTTPException as e:
            if e.status_code in (404, 409): # Empty repo or no commits
                return []
            raise

    async def get_repository_pulls(self, owner: str, repo: str, state: str = "all", per_page: int = 30) -> List[Dict[str, Any]]:
        try:
            return await self._fetch(f"/repos/{owner}/{repo}/pulls", params={"state": state, "per_page": per_page}, ttl=600)
        except HTTPException as e:
            if e.status_code in (404, 409):
                return []
            raise

    async def get_repository_issues(self, owner: str, repo: str, state: str = "all", per_page: int = 30) -> List[Dict[str, Any]]:
        try:
            # GitHub issues endpoint includes pull requests; we will filter them in the caller if needed
            return await self._fetch(f"/repos/{owner}/{repo}/issues", params={"state": state, "per_page": per_page}, ttl=600)
        except HTTPException as e:
            if e.status_code in (404, 409):
                return []
            raise

    async def get_repository_contributors(self, owner: str, repo: str, per_page: int = 30) -> List[Dict[str, Any]]:
        try:
            return await self._fetch(f"/repos/{owner}/{repo}/contributors", params={"per_page": per_page}, ttl=1800)
        except HTTPException as e:
            if e.status_code in (404, 409):
                return []
            raise

    async def get_repository_releases(self, owner: str, repo: str, per_page: int = 10) -> List[Dict[str, Any]]:
        try:
            return await self._fetch(f"/repos/{owner}/{repo}/releases", params={"per_page": per_page}, ttl=1800)
        except HTTPException as e:
            if e.status_code in (404, 409):
                return []
            raise

    async def get_repository_branches(self, owner: str, repo: str, per_page: int = 30) -> List[Dict[str, Any]]:
        try:
            return await self._fetch(f"/repos/{owner}/{repo}/branches", params={"per_page": per_page}, ttl=1800)
        except HTTPException as e:
            if e.status_code in (404, 409):
                return []
            raise

    async def search_repositories(self, query: str, sort: str = "stars", order: str = "desc", per_page: int = 30) -> Dict[str, Any]:
        return await self._fetch("/search/repositories", params={"q": query, "sort": sort, "order": order, "per_page": per_page}, ttl=300)

    async def search_users(self, query: str, per_page: int = 20) -> Dict[str, Any]:
        return await self._fetch("/search/users", params={"q": query, "per_page": per_page}, ttl=300)

    async def get_rate_limit(self) -> Dict[str, Any]:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(f"{GITHUB_API_BASE}/rate_limit", headers=self._get_headers())
                if res.status_code == 200:
                    return res.json()
        except Exception:
            pass
        return {"resources": {"core": {"limit": 60, "remaining": 60, "reset": 0}}}

    async def get_user_contributions_graphql(self, username: str, from_date: Optional[str] = None, to_date: Optional[str] = None) -> Optional[Dict[str, Any]]:
        if not settings.GITHUB_TOKEN:
            return None # GraphQL requires an authorized GitHub token
        
        query = """
        query($username: String!) {
          user(login: $username) {
            contributionsCollection {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    contributionCount
                    date
                    weekday
                  }
                }
              }
            }
          }
        }
        """
        cache_key = f"gh_gql_contrib:{username}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                res = await client.post(
                    "https://api.github.com/graphql",
                    json={"query": query, "variables": {"username": username}},
                    headers=self._get_headers()
                )
                if res.status_code == 200:
                    data = res.json()
                    if "data" in data and data["data"] and data["data"].get("user"):
                        cache.set(cache_key, data["data"]["user"]["contributionsCollection"]["contributionCalendar"], ttl=1800)
                        return data["data"]["user"]["contributionsCollection"]["contributionCalendar"]
            except Exception as e:
                logger.warning(f"GraphQL contributions fetch failed: {e}")
        return None

github_client = GitHubClient()
