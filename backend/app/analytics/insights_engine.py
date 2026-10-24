import datetime
from typing import List, Dict, Any
from app.schemas.developer import SmartInsight

def generate_smart_insights(
    user: Dict[str, Any],
    repos: List[Dict[str, Any]],
    languages: List[Dict[str, Any]],
    activity_stats: Dict[str, Any]
) -> List[SmartInsight]:
    """
    Deterministic Developer Insights Engine.
    Evaluates real GitHub public data against transparent, explainable heuristic models.
    Every insight provides 5 mandatory audit fields:
    - observation
    - supporting_metrics
    - calculation_method
    - period_analyzed
    - data_limitations
    """
    insights: List[SmartInsight] = []
    now = datetime.datetime.now(datetime.timezone.utc)
    total_repos = len(repos)

    if total_repos == 0:
        insights.append(SmartInsight(
            id="empty_repos",
            type="anomaly",
            severity="info",
            title="No Public Repositories Detected",
            description="No accessible public repositories found for this account. Publishing public code allows automated analysis.",
            observation="Zero public repositories were returned by the GitHub REST API for this username.",
            supporting_metrics="public_repos: 0",
            calculation_method="Count of items in GET /users/{username}/repos",
            period_analyzed="Current profile state",
            data_limitations="Private repositories, organization repositories where user lacks read permissions, and repositories created after the last sync are excluded.",
            metric_source="GitHub Public Repositories Count"
        ))
        return insights

    # 1. Primary Language Dominance & Multi-language Stack
    if languages:
        top_lang = languages[0]
        top_pct = top_lang.get("percentage", 0.0)
        if top_pct >= 50.0:
            insights.append(SmartInsight(
                id="lang_dominance",
                type="language_trend",
                severity="positive",
                title=f"Core Specialization in {top_lang['name']}",
                description=f"{top_lang['name']} constitutes {top_pct}% of total repository primary language distribution across {top_lang.get('repo_count', 0)} repositories.",
                observation=f"{top_lang['name']} is the dominant primary language among public repositories.",
                supporting_metrics=f"Primary language share: {top_pct}%, Repositories using {top_lang['name']}: {top_lang.get('repo_count', 0)} of {total_repos}",
                calculation_method="Count of repositories where repository 'language' field matches target language / total non-null language repositories * 100",
                period_analyzed="All accessible public repositories at current timestamp",
                data_limitations="Based on repository primary language tagged by GitHub Linguist; does not parse line-by-line file extensions in secondary languages unless deep scan is run.",
                metric_source=f"GitHub Repository Language API ({top_pct}%)"
            ))
        elif len(languages) >= 4:
            lang_names = [l.get("name", "") for l in languages[:4]]
            insights.append(SmartInsight(
                id="polyglot_stack",
                type="language_trend",
                severity="positive",
                title="Versatile Polyglot Profile",
                description=f"Active code spread across {len(languages)} distinct programming languages ({', '.join(lang_names)}).",
                observation=f"Codebase spans {len(languages)} distinct programming languages, indicating broad technical versatility.",
                supporting_metrics=f"Distinct languages: {len(languages)}, Top 4: {', '.join(lang_names)}",
                calculation_method="Cardinality of unique non-null primary languages across all discovered public repositories",
                period_analyzed="All accessible public repositories at current timestamp",
                data_limitations="Language tags represent the primary language detected by GitHub Linguist per repository.",
                metric_source=f"Detected Languages ({len(languages)} languages)"
            ))

    # 2. Flagship Project & Star Concentration
    total_stars = sum(r.get("stargazers_count", 0) for r in repos)
    if total_stars > 0 and len(repos) > 1:
        sorted_by_stars = sorted(repos, key=lambda r: r.get("stargazers_count", 0), reverse=True)
        top_repo = sorted_by_stars[0]
        top_stars = top_repo.get("stargazers_count", 0)
        star_ratio = top_stars / total_stars

        if star_ratio >= 0.5 and top_stars >= 5:
            pct_int = int(round(star_ratio * 100))
            insights.append(SmartInsight(
                id="flagship_concentration",
                type="growth",
                severity="positive",
                title=f"Flagship Project: {top_repo.get('name')}",
                description=f"'{top_repo.get('name')}' accounts for {pct_int}% ({top_stars} of {total_stars}) of all repository stars received across this account.",
                observation=f"A single project ('{top_repo.get('name')}') drives the majority of public developer attention and bookmarks.",
                supporting_metrics=f"Top repo stars: {top_stars}, Total account stars: {total_stars}, Ratio: {star_ratio:.2f} ({pct_int}%)",
                calculation_method="(top_repo.stargazers_count / sum(all_repos.stargazers_count)) * 100",
                period_analyzed="All accessible public repositories at current timestamp",
                data_limitations="Stars reflect cumulative public bookmarks over the repository's lifetime; they do not measure active usage or current maintenance.",
                metric_source=f"Stargazer Distribution ({pct_int}% in top repository)"
            ))

    # 3. Active Focal Project (Most Recent Push/Commit Activity)
    repos_with_push = [r for r in repos if r.get("pushed_at") or r.get("updated_at")]
    if repos_with_push:
        sorted_by_recency = sorted(
            repos_with_push,
            key=lambda r: r.get("pushed_at") or r.get("updated_at") or "",
            reverse=True
        )
        active_repo = sorted_by_recency[0]
        pushed_raw = active_repo.get("pushed_at") or active_repo.get("updated_at")
        days_ago = None
        if pushed_raw:
            try:
                dt = datetime.datetime.fromisoformat(pushed_raw.replace("Z", "+00:00"))
                days_ago = max(0, (now - dt).days)
            except Exception:
                pass

        if days_ago is not None and days_ago <= 14:
            insights.append(SmartInsight(
                id="focal_active_repo",
                type="growth",
                severity="positive",
                title=f"Active Development: {active_repo.get('name')}",
                description=f"Latest code push was committed to '{active_repo.get('name')}' {days_ago} day(s) ago ({active_repo.get('pushed_at', '')[:10]}).",
                observation=f"Recent engineering activity is actively concentrated on '{active_repo.get('name')}'.",
                supporting_metrics=f"Repository: {active_repo.get('name')}, Last push: {days_ago} days ago, Open issues: {active_repo.get('open_issues_count', 0)}",
                calculation_method="min(current_utc_time - repository.pushed_at) across all public repositories",
                period_analyzed="Last 14 days",
                data_limitations="Pushed timestamps update on any branch push or pull request merge; specific commit messages require inspecting repository commit feeds.",
                metric_source="Repository Push Timestamps"
            ))

    # 4. Dormant / Stagnant Repositories (>90 and >180 days)
    stale_90 = []
    stale_180 = []
    for r in repos:
        pushed = r.get("pushed_at") or r.get("updated_at")
        if pushed:
            try:
                dt = datetime.datetime.fromisoformat(pushed.replace("Z", "+00:00"))
                diff_days = (now - dt).days
                if diff_days > 180:
                    stale_180.append(r)
                elif diff_days > 90:
                    stale_90.append(r)
            except Exception:
                pass

    if len(stale_180) >= 3:
        insights.append(SmartInsight(
            id="stale_repos_warning",
            type="stagnation",
            severity="warning",
            title=f"{len(stale_180)} Inactive Repositories (>6 Months)",
            description=f"{len(stale_180)} out of {total_repos} repositories have had no code pushed in over 180 days. Consider archiving completed projects or refreshing dependencies.",
            observation=f"A noticeable portion of repositories ({len(stale_180)}/{total_repos}) has not received updates for over 6 months.",
            supporting_metrics=f"Repositories >180 days dormant: {len(stale_180)}, Total repositories: {total_repos}, Dormant ratio: {len(stale_180)/total_repos:.2f}",
            calculation_method="Count of repositories where (current_utc_time - pushed_at) > 180 days",
            period_analyzed="Past 180 days to present",
            data_limitations="Does not differentiate between feature-complete stable libraries and abandoned repositories.",
            metric_source=f"Push Timestamps (>180 days inactive: {len(stale_180)})"
        ))

    # 5. Issue Backlog with Low Recent Activity
    backlog_repos = []
    for r in repos:
        issues = r.get("open_issues_count", 0)
        pushed = r.get("pushed_at") or r.get("updated_at")
        if issues >= 5 and pushed:
            try:
                dt = datetime.datetime.fromisoformat(pushed.replace("Z", "+00:00"))
                if (now - dt).days > 60:
                    backlog_repos.append(r)
            except Exception:
                pass

    if backlog_repos:
        top_backlog = sorted(backlog_repos, key=lambda r: r.get("open_issues_count", 0), reverse=True)[0]
        insights.append(SmartInsight(
            id="issue_backlog_dormant",
            type="anomaly",
            severity="warning",
            title=f"Issue Backlog on Inactive Repo: {top_backlog.get('name')}",
            description=f"'{top_backlog.get('name')}' has {top_backlog.get('open_issues_count', 0)} open issues but no pushes recorded in over 60 days.",
            observation=f"Community or bug inquiries are accumulating without recent repository updates on '{top_backlog.get('name')}'.",
            supporting_metrics=f"Open issues: {top_backlog.get('open_issues_count', 0)}, Last update: {top_backlog.get('pushed_at', '')[:10]}",
            calculation_method="Filter: open_issues_count >= 5 AND (current_utc_time - pushed_at) > 60 days",
            period_analyzed="Past 60 days",
            data_limitations="GitHub includes open pull requests in the open_issues_count counter. Some issues may be questions or feature wishlists rather than unresolved defects.",
            metric_source="GitHub Repository Issues Counter & Push Recency"
        ))

    # 6. Temporal Activity Cadence (Weekend vs Weekday Rhythm)
    weekend_pct = activity_stats.get("weekend_percentage", 0.0)
    total_events = activity_stats.get("total_recent_events", 0)
    if total_events >= 5:
        if weekend_pct >= 35.0:
            insights.append(SmartInsight(
                id="weekend_warrior",
                type="best_practice",
                severity="info",
                title="Weekend Activity Rhythm",
                description=f"{weekend_pct:.1f}% of recorded events occurred on Saturdays or Sundays, suggesting open-source engagement outside conventional weekday hours.",
                observation="A significant portion of recent contributions occurs during weekends.",
                supporting_metrics=f"Weekend percentage: {weekend_pct:.1f}%, Total recent events analyzed: {total_events}",
                calculation_method="(weekend_event_count / total_recent_event_count) * 100",
                period_analyzed="Up to 100 recent public events (~last 90 days)",
                data_limitations="Events API only includes public actions. Private enterprise contributions are omitted by GitHub API unless user is authenticated with private scope.",
                metric_source=f"Recent Event Timestamps ({weekend_pct:.1f}% weekend)"
            ))
        elif weekend_pct <= 10.0 and total_events >= 10:
            weekday_pct = 100.0 - weekend_pct
            insights.append(SmartInsight(
                id="weekday_focus",
                type="best_practice",
                severity="info",
                title="Structured Weekday Schedule",
                description=f"Public contributions are concentrated almost entirely during weekdays ({weekday_pct:.1f}% Monday-Friday).",
                observation="Development rhythm aligns with standard Monday-to-Friday business hours.",
                supporting_metrics=f"Weekday percentage: {weekday_pct:.1f}%, Weekend percentage: {weekend_pct:.1f}%, Events: {total_events}",
                calculation_method="((total_events - weekend_events) / total_events) * 100",
                period_analyzed="Up to 100 recent public events (~last 90 days)",
                data_limitations="Limited to public GitHub events API records. Timezones are normalized to UTC.",
                metric_source="Recent Event Timestamps (Weekday concentration)"
            ))

    # 7. Independent Creation vs Downstream Forks
    forked_count = sum(1 for r in repos if r.get("fork", False))
    original_count = total_repos - forked_count
    orig_ratio = original_count / total_repos
    if orig_ratio >= 0.8:
        pct_orig = int(round(orig_ratio * 100))
        insights.append(SmartInsight(
            id="creator_mindset",
            type="best_practice",
            severity="positive",
            title="High Independent Authorship Ratio",
            description=f"{pct_orig}% ({original_count}/{total_repos}) of public repositories are original authored software rather than forks.",
            observation="Profile demonstrates predominantly self-initiated repositories rather than downstream mirrors.",
            supporting_metrics=f"Original repositories: {original_count}, Forked repositories: {forked_count}, Ratio: {orig_ratio:.2f}",
            calculation_method="((total_repos - forked_repos) / total_repos) * 100",
            period_analyzed="All accessible public repositories at current timestamp",
            data_limitations="Fork flag denotes repositories created via GitHub 'Fork' button. Code copied via git clone/push or template creation appears as original.",
            metric_source=f"Fork vs Original Breakdown ({original_count} original / {forked_count} forks)"
        ))

    # 8. Open Source Licensing Hygiene
    licensed_count = sum(1 for r in repos if r.get("license"))
    if total_repos >= 3:
        lic_ratio = licensed_count / total_repos
        if lic_ratio < 0.4:
            insights.append(SmartInsight(
                id="licensing_gap",
                type="anomaly",
                severity="warning",
                title="Open Source Licensing Gap",
                description=f"Only {licensed_count} of {total_repos} public repositories include an explicit open-source license.",
                observation="Over 60% of public repositories lack an open-source license file.",
                supporting_metrics=f"Licensed repos: {licensed_count}, Total repos: {total_repos}, Unlicensed: {total_repos - licensed_count}",
                calculation_method="(count(repos with license != null) / total_repos) * 100",
                period_analyzed="All accessible public repositories at current timestamp",
                data_limitations="GitHub detects licenses located in root LICENSE or COPYING files recognized by SPDX. Custom in-file headers are not counted.",
                metric_source=f"SPDX License File Coverage ({licensed_count}/{total_repos})"
            ))

    return insights
