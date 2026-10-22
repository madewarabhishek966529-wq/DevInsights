from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict, Any
import asyncio
from app.services.github_service import github_client
from app.schemas.developer import DeveloperComparison, DeveloperOverview
from app.analytics.data_processor import process_languages

router = APIRouter()

@router.get("/compare", response_model=DeveloperComparison)
async def compare_developers(usernames: str = Query(..., description="Comma-separated list of 2 to 4 GitHub usernames")):
    user_list = [u.strip() for u in usernames.split(",") if u.strip()]
    if len(user_list) < 2:
        raise HTTPException(status_code=400, detail="Please provide at least 2 GitHub usernames to compare.")
    if len(user_list) > 4:
        raise HTTPException(status_code=400, detail="A maximum of 4 developers can be compared simultaneously.")

    async def fetch_dev(uname: str):
        user_data = await github_client.get_user_profile(uname)
        repos = await github_client.get_user_repositories(uname)
        total_stars = sum(r.get("stargazers_count", 0) for r in repos)
        total_forks = sum(r.get("forks_count", 0) for r in repos)
        lang_stats = process_languages(repos)
        primary_lang = lang_stats[0].name if lang_stats else None

        overview = DeveloperOverview(
            username=user_data.get("login", uname),
            name=user_data.get("name"),
            avatar_url=user_data.get("avatar_url", ""),
            bio=user_data.get("bio"),
            location=user_data.get("location"),
            company=user_data.get("company"),
            blog=user_data.get("blog"),
            twitter_username=user_data.get("twitter_username"),
            html_url=user_data.get("html_url", f"https://github.com/{uname}"),
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
        return overview, [l.name for l in lang_stats]

    dev_results = []
    dev_langs_list = []
    for uname in user_list:
        try:
            overview, langs = await fetch_dev(uname)
            dev_results.append(overview)
            dev_langs_list.append(set(langs))
        except Exception as e:
            raise HTTPException(status_code=404, detail=f"Could not load data for developer '{uname}': {str(e)}")

    # Shared languages across all compared profiles
    shared_langs = list(set.intersection(*dev_langs_list)) if dev_langs_list else []

    # Build metrics comparison matrix
    metrics = [
        {"metric": "Public Repositories", "key": "public_repos"},
        {"metric": "Total Stars Received", "key": "total_stars"},
        {"metric": "Total Forks Received", "key": "total_forks"},
        {"metric": "Followers", "key": "followers"},
        {"metric": "Primary Language", "key": "primary_language"}
    ]

    metrics_matrix = []
    for m in metrics:
        row = {"metric": m["metric"]}
        for dev in dev_results:
            row[dev.username] = getattr(dev, m["key"])
        metrics_matrix.append(row)

    return DeveloperComparison(
        developers=dev_results,
        shared_languages=shared_langs,
        metrics_matrix=metrics_matrix
    )
