import datetime
from typing import Dict, Any, List
from app.schemas.developer import HealthScoreBreakdown

def calculate_repository_health(repo: Dict[str, Any]) -> HealthScoreBreakdown:
    reasons: List[str] = []
    suggestions: List[str] = []
    
    # 1. Maintenance Score (Max 30)
    maintenance_score = 0.0
    pushed_at_str = repo.get("pushed_at") or repo.get("updated_at")
    is_archived = repo.get("archived", False)
    
    if is_archived:
        maintenance_score = 5.0
        reasons.append("Repository is archived and marked read-only.")
        suggestions.append("If this project is still maintained elsewhere, clarify deprecation status in the README.")
    elif pushed_at_str:
        try:
            # Parse ISO date (e.g. 2024-03-15T12:00:00Z)
            pushed_dt = datetime.datetime.fromisoformat(pushed_at_str.replace("Z", "+00:00"))
            now = datetime.datetime.now(datetime.timezone.utc)
            days_inactive = (now - pushed_dt).days
            
            if days_inactive <= 14:
                maintenance_score = 30.0
                reasons.append(f"Highly active maintenance: last pushed {days_inactive} days ago.")
            elif days_inactive <= 30:
                maintenance_score = 25.0
                reasons.append(f"Recent maintenance: pushed within the last {days_inactive} days.")
            elif days_inactive <= 90:
                maintenance_score = 18.0
                reasons.append(f"Moderate activity: pushed {days_inactive} days ago.")
                suggestions.append("Review pending dependencies or open issues to keep repository fresh.")
            elif days_inactive <= 180:
                maintenance_score = 10.0
                reasons.append(f"Slow maintenance: no commits for {days_inactive} days.")
                suggestions.append("Check for security advisories or consider archiving if inactive.")
            else:
                maintenance_score = 4.0
                reasons.append(f"Stale codebase: no commits in over {days_inactive} days.")
                suggestions.append("Perform maintenance updates or tag a stable archive release.")
        except Exception:
            maintenance_score = 15.0
    else:
        maintenance_score = 10.0

    # 2. Documentation Score (Max 25)
    doc_score = 0.0
    description = repo.get("description")
    if description and len(description.strip()) > 15:
        doc_score += 8.0
        reasons.append("Contains a clear repository description.")
    elif description:
        doc_score += 4.0
        reasons.append("Short description provided.")
        suggestions.append("Expand the repository description with key use cases and tech stack.")
    else:
        suggestions.append("Add a concise description explaining what this repository does.")

    license_info = repo.get("license")
    if license_info and license_info.get("spdx_id") != "NOASSERTION":
        doc_score += 9.0
        reasons.append(f"Open-source license detected ({license_info.get('name', 'Licensed')}).")
    else:
        suggestions.append("Add an open-source license (e.g., MIT, Apache 2.0) to clarify reuse terms.")

    topics = repo.get("topics", [])
    if len(topics) >= 3:
        doc_score += 4.0
        reasons.append(f"Good topic tagging ({len(topics)} topics).")
    elif len(topics) > 0:
        doc_score += 2.0
    else:
        suggestions.append("Add GitHub topics/tags to improve project discoverability.")

    homepage = repo.get("homepage")
    if homepage and homepage.startswith("http"):
        doc_score += 4.0
        reasons.append("Includes a live website or documentation URL.")
    else:
        suggestions.append("Add a live demo or documentation URL in repository settings.")

    # 3. Issue and PR Responsiveness (Max 20)
    issue_score = 0.0
    has_issues = repo.get("has_issues", True)
    open_issues = repo.get("open_issues_count", 0)
    
    if has_issues:
        issue_score += 8.0
        if open_issues == 0:
            issue_score += 12.0
            reasons.append("Zero unaddressed open issues.")
        elif open_issues <= 5:
            issue_score += 10.0
            reasons.append(f"Manageable issue queue ({open_issues} open issues).")
        elif open_issues <= 20:
            issue_score += 7.0
            reasons.append(f"{open_issues} open issues.")
        else:
            issue_score += 4.0
            reasons.append(f"Large backlog of {open_issues} open issues.")
            suggestions.append("Triage older issues and apply milestone or stale bot labels.")
    else:
        issue_score = 10.0
        reasons.append("GitHub Issues are disabled for this repository.")

    # 4. Community Engagement (Max 15)
    comm_score = 0.0
    stars = repo.get("stargazers_count", 0)
    forks = repo.get("forks_count", 0)
    
    if stars >= 100:
        comm_score += 8.0
        reasons.append(f"Strong community adoption ({stars} stars).")
    elif stars >= 20:
        comm_score += 5.0
        reasons.append(f"Growing interest ({stars} stars).")
    elif stars > 0:
        comm_score += 2.0
    
    if forks >= 25:
        comm_score += 7.0
        reasons.append(f"Substantial external forks ({forks} forks).")
    elif forks >= 5:
        comm_score += 4.0
    elif forks > 0:
        comm_score += 2.0

    # 5. Release Activity & Size (Max 10)
    release_score = 6.0
    size_kb = repo.get("size", 0)
    if size_kb > 50:
        release_score += 4.0
    else:
        release_score += 2.0

    total_score = round(min(100.0, maintenance_score + doc_score + issue_score + comm_score + release_score), 1)

    # Grade scale
    if total_score >= 90:
        grade = "A+"
    elif total_score >= 80:
        grade = "A"
    elif total_score >= 70:
        grade = "B"
    elif total_score >= 60:
        grade = "C"
    elif total_score >= 50:
        grade = "D"
    else:
        grade = "F"

    return HealthScoreBreakdown(
        repo_name=repo.get("name", "Unknown"),
        overall_score=total_score,
        grade=grade,
        maintenance_score=round(maintenance_score, 1),
        documentation_score=round(doc_score, 1),
        issue_score=round(issue_score, 1),
        community_score=round(comm_score, 1),
        release_score=round(release_score, 1),
        reasons=reasons,
        suggestions=suggestions
    )
