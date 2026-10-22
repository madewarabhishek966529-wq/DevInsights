from fastapi import APIRouter, Response
from typing import Dict, Any
import io
import csv
import json
import datetime

from app.schemas.developer import ExportRequest
from app.services.github_service import github_client
from app.analytics.data_processor import process_languages, process_activity_events
from app.analytics.health_analyzer import calculate_repository_health
from app.analytics.portfolio_audit import run_portfolio_audit

router = APIRouter()

@router.post("/export")
async def export_developer_report(payload: ExportRequest):
    username = payload.username
    user_data = await github_client.get_user_profile(username)
    repos = await github_client.get_user_repositories(username)
    lang_stats = process_languages(repos)
    events = await github_client.get_user_events(username)
    activity = process_activity_events(events)
    audit = run_portfolio_audit(user_data, repos)

    now_str = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    if payload.format.lower() == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Metadata Header
        writer.writerow(["DevInsights Export Report"])
        writer.writerow(["Target Developer", username])
        writer.writerow(["Generated At", now_str])
        writer.writerow(["Source", "GitHub REST API via DevInsights Platform"])
        writer.writerow([])
        
        # Section 1: Developer Overview
        writer.writerow(["--- DEVELOPER OVERVIEW ---"])
        writer.writerow(["Name", user_data.get("name", "N/A")])
        writer.writerow(["Bio", user_data.get("bio", "N/A")])
        writer.writerow(["Public Repositories", user_data.get("public_repos", len(repos))])
        writer.writerow(["Followers", user_data.get("followers", 0)])
        writer.writerow(["Total Stars Earned", sum(r.get("stargazers_count", 0) for r in repos)])
        writer.writerow(["Portfolio Audit Score", f"{audit.overall_score}/100 (Grade: {audit.grade})"])
        writer.writerow([])

        # Section 2: Repositories
        if payload.include_repos:
            writer.writerow(["--- REPOSITORIES ---"])
            writer.writerow(["Name", "Language", "Stars", "Forks", "Open Issues", "Size (KB)", "Health Score", "License", "Last Updated", "URL"])
            for r in repos:
                health = calculate_repository_health(r)
                writer.writerow([
                    r.get("name"),
                    r.get("language") or "None",
                    r.get("stargazers_count", 0),
                    r.get("forks_count", 0),
                    r.get("open_issues_count", 0),
                    r.get("size", 0),
                    health.overall_score,
                    r.get("license", {}).get("name") if r.get("license") else "None",
                    r.get("updated_at", ""),
                    r.get("html_url", "")
                ])
            writer.writerow([])

        # Section 3: Languages
        if payload.include_languages:
            writer.writerow(["--- PROGRAMMING LANGUAGES ---"])
            writer.writerow(["Language", "Percentage", "Byte Count", "Repository Count"])
            for l in lang_stats:
                writer.writerow([l.name, f"{l.percentage}%", l.bytes, l.repo_count])
            writer.writerow([])

        csv_content = output.getvalue()
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=devinsights_{username}_report.csv"}
        )

    else:
        # JSON Export
        data = {
            "report_metadata": {
                "generated_at": now_str,
                "platform": "DevInsights",
                "source": "GitHub Public REST/GraphQL API",
                "disclaimer": "Metrics reflect publicly available data and do not infer working hours or engineering proficiency."
            },
            "developer": {
                "username": username,
                "name": user_data.get("name"),
                "bio": user_data.get("bio"),
                "public_repos": user_data.get("public_repos", len(repos)),
                "followers": user_data.get("followers", 0),
                "following": user_data.get("following", 0),
                "created_at": user_data.get("created_at"),
                "portfolio_audit": audit.model_dump()
            },
            "languages": [l.model_dump() for l in lang_stats] if payload.include_languages else [],
            "repositories": [
                {
                    "name": r.get("name"),
                    "language": r.get("language"),
                    "stars": r.get("stargazers_count", 0),
                    "forks": r.get("forks_count", 0),
                    "open_issues": r.get("open_issues_count", 0),
                    "health_score": calculate_repository_health(r).overall_score,
                    "updated_at": r.get("updated_at")
                }
                for r in repos
            ] if payload.include_repos else [],
            "activity_summary": {
                "total_recent_events": activity.total_recent_events,
                "weekend_percentage": activity.weekend_percentage,
                "by_day_of_week": activity.by_day_of_week
            } if payload.include_activity else {}
        }

        return Response(
            content=json.dumps(data, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=devinsights_{username}_report.json"}
        )
