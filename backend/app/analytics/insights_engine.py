from typing import List, Dict, Any
from app.schemas.developer import SmartInsight

def generate_smart_insights(
    user: Dict[str, Any],
    repos: List[Dict[str, Any]],
    languages: List[Dict[str, Any]],
    activity_stats: Dict[str, Any]
) -> List[SmartInsight]:
    insights: List[SmartInsight] = []
    
    total_repos = len(repos)
    if total_repos == 0:
        insights.append(SmartInsight(
            id="empty_repos",
            type="anomaly",
            severity="info",
            title="Clean Slate",
            description="No public repositories detected yet. Publishing code is the fastest way to showcase technical competence.",
            metric_source="Public Repositories Count (0)"
        ))
        return insights

    # 1. Primary Language Dominance
    if languages:
        top_lang = languages[0]
        if top_lang.get("percentage", 0) >= 50.0:
            insights.append(SmartInsight(
                id="lang_dominance",
                type="language_trend",
                severity="positive",
                title=f"Core Specialization in {top_lang['name']}",
                description=f"{top_lang['name']} represents {top_lang['percentage']}% of total repository code composition across {top_lang['repo_count']} repositories.",
                metric_source=f"GitHub Language Analytics ({top_lang['percentage']}%)"
            ))
        elif len(languages) >= 4:
            insights.append(SmartInsight(
                id="polyglot_stack",
                type="language_trend",
                severity="positive",
                title="Versatile Polyglot Profile",
                description=f"Active code spread across {len(languages)} distinct programming languages ({', '.join(l['name'] for l in languages[:4])}).",
                metric_source=f"Detected Languages ({len(languages)} languages)"
            ))

    # 2. Flagship Project Star Concentration
    total_stars = sum(r.get("stargazers_count", 0) for r in repos)
    if total_stars > 0 and len(repos) > 1:
        sorted_by_stars = sorted(repos, key=lambda r: r.get("stargazers_count", 0), reverse=True)
        top_repo = sorted_by_stars[0]
        top_repo_stars = top_repo.get("stargazers_count", 0)
        star_ratio = top_repo_stars / total_stars
        
        if star_ratio >= 0.6 and top_repo_stars >= 5:
            insights.append(SmartInsight(
                id="flagship_concentration",
                type="growth",
                severity="positive",
                title=f"Flagship Project: {top_repo['name']}",
                description=f"'{top_repo['name']}' drives {int(star_ratio * 100)}% ({top_repo_stars}/{total_stars}) of all repository stars received.",
                metric_source=f"Stargazer Distribution ({int(star_ratio * 100)}% in top repo)"
            ))

    # 3. Stale Repositories Check
    stale_count = 0
    import datetime
    now = datetime.datetime.now(datetime.timezone.utc)
    for r in repos:
        pushed = r.get("pushed_at") or r.get("updated_at")
        if pushed:
            try:
                dt = datetime.datetime.fromisoformat(pushed.replace("Z", "+00:00"))
                if (now - dt).days > 180:
                    stale_count += 1
            except Exception:
                pass

    if stale_count >= 3:
        insights.append(SmartInsight(
            id="stale_repos_warning",
            type="stagnation",
            severity="warning",
            title=f"{stale_count} Inactive Repositories Detected",
            description=f"{stale_count} out of {total_repos} repositories have had no commits or pushes in over 6 months. Consider updating dependencies or archiving dormant projects.",
            metric_source=f"Push Timestamps (>180 days inactive: {stale_count})"
        ))

    # 4. Temporal Rhythm (Weekend vs Weekday)
    weekend_pct = activity_stats.get("weekend_percentage", 0.0)
    if weekend_pct >= 35.0:
        insights.append(SmartInsight(
            id="weekend_warrior",
            type="best_practice",
            severity="info",
            title="High Weekend Activity Rhythm",
            description=f"{weekend_pct}% of recorded commit events occurred on Saturdays or Sundays, suggesting active open-source passion outside typical work hours.",
            metric_source=f"Recent Event Timestamps ({weekend_pct}% weekend activity)"
        ))
    elif weekend_pct <= 10.0 and activity_stats.get("total_recent_events", 0) >= 10:
        insights.append(SmartInsight(
            id="weekday_focus",
            type="best_practice",
            severity="info",
            title="Structured Weekday Schedule",
            description=f"Activity is predominantly concentrated during Monday to Friday ({100.0 - weekend_pct:.1f}% weekday events).",
            metric_source="Recent Event Timestamps"
        ))

    # 5. Open Source Contribution / Fork Ratio
    forked_repos = sum(1 for r in repos if r.get("fork", False))
    original_repos = total_repos - forked_repos
    if original_repos / total_repos >= 0.8:
        insights.append(SmartInsight(
            id="creator_mindset",
            type="best_practice",
            severity="positive",
            title="Strong Independent Creation Focus",
            description=f"{int((original_repos / total_repos) * 100)}% of repositories are original authored software rather than downstream forks.",
            metric_source=f"Fork vs Author Breakdown ({original_repos} original / {forked_repos} forks)"
        ))

    # 6. Licensing Hygiene
    licensed = sum(1 for r in repos if r.get("license"))
    if total_repos >= 3 and (licensed / total_repos) < 0.4:
        insights.append(SmartInsight(
            id="licensing_gap",
            type="anomaly",
            severity="warning",
            title="Open-Source License Gap",
            description=f"Only {licensed} of {total_repos} repositories have an explicit license. Adding MIT or Apache 2.0 encourages others to legally adopt and cite your work.",
            metric_source=f"License File Coverage ({licensed}/{total_repos})"
        ))

    return insights
