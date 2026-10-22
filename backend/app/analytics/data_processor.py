import pandas as pd
import datetime
from typing import List, Dict, Any, Tuple, Optional
from app.schemas.developer import LanguageStat, HeatmapDay, ContributionData, ActivityAnalytics, CommitActivityEvent

# Curated palette for programming languages
LANGUAGE_COLORS: Dict[str, str] = {
    "TypeScript": "#3178c6",
    "JavaScript": "#f1e05a",
    "Python": "#3572A5",
    "Rust": "#dea584",
    "Go": "#00ADD8",
    "C++": "#f34b7d",
    "C": "#555555",
    "C#": "#178600",
    "Java": "#b07219",
    "HTML": "#e34c26",
    "CSS": "#563d7c",
    "Ruby": "#701516",
    "PHP": "#4F5D95",
    "Swift": "#F05138",
    "Kotlin": "#A97BFF",
    "Dart": "#00B4AB",
    "Shell": "#89e051",
    "Vue": "#41b883",
    "Jupyter Notebook": "#DA5B0B",
    "Solidity": "#AA6746",
    "R": "#198CE7",
    "Scala": "#c22d40",
    "Elixir": "#6e4a7e",
    "Lua": "#000080"
}

FALLBACK_COLORS = [
    "#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", 
    "#8b5cf6", "#14b8a6", "#f97316", "#84cc16", "#a855f7"
]

def process_languages(repos: List[Dict[str, Any]], repo_lang_map: Optional[Dict[str, Dict[str, int]]] = None) -> List[LanguageStat]:
    """
    Computes language distribution stats from repositories and language byte breakdowns.
    """
    lang_bytes: Dict[str, int] = {}
    lang_repos: Dict[str, int] = {}

    if repo_lang_map:
        for repo_name, langs in repo_lang_map.items():
            for lang, byte_count in langs.items():
                lang_bytes[lang] = lang_bytes.get(lang, 0) + byte_count
                lang_repos[lang] = lang_repos.get(lang, 0) + 1
    else:
        # Fallback to primary repo language with repo size as proxy byte weight
        for r in repos:
            lang = r.get("language")
            if lang:
                size_bytes = (r.get("size", 100) or 100) * 1024
                lang_bytes[lang] = lang_bytes.get(lang, 0) + size_bytes
                lang_repos[lang] = lang_repos.get(lang, 0) + 1

    total_bytes = sum(lang_bytes.values())
    if total_bytes == 0:
        return []

    # Sort descending by byte count
    sorted_langs = sorted(lang_bytes.items(), key=lambda x: x[1], reverse=True)
    
    result: List[LanguageStat] = []
    color_idx = 0
    for lang, byte_count in sorted_langs:
        pct = round((byte_count / total_bytes) * 100.0, 1)
        color = LANGUAGE_COLORS.get(lang)
        if not color:
            color = FALLBACK_COLORS[color_idx % len(FALLBACK_COLORS)]
            color_idx += 1
        
        result.append(LanguageStat(
            name=lang,
            bytes=byte_count,
            percentage=pct,
            repo_count=lang_repos.get(lang, 1),
            color=color
        ))

    return result

def process_activity_events(events: List[Dict[str, Any]]) -> ActivityAnalytics:
    """
    Calculates day-of-week, hourly, monthly trends, and parsed events using Pandas.
    """
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    dow_counts = {d: 0 for d in days}
    hour_counts = {f"{h:02d}": 0 for h in range(24)}
    
    records = []
    recent_events_parsed: List[CommitActivityEvent] = []

    for ev in events:
        created_at_str = ev.get("created_at")
        if not created_at_str:
            continue
        try:
            dt = datetime.datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
            ev_type = ev.get("type", "UnknownEvent")
            repo_name = ev.get("repo", {}).get("name", "repository")
            
            # Format message
            msg = None
            payload = ev.get("payload", {})
            if ev_type == "PushEvent":
                commits = payload.get("commits", [])
                if commits:
                    msg = commits[0].get("message", "Pushed commits")
                else:
                    msg = f"Pushed {payload.get('size', 1)} commit(s)"
            elif ev_type == "PullRequestEvent":
                action = payload.get("action", "opened")
                pr_title = payload.get("pull_request", {}).get("title", "")
                msg = f"{action.capitalize()} PR: {pr_title}"
            elif ev_type == "IssuesEvent":
                action = payload.get("action", "opened")
                issue_title = payload.get("issue", {}).get("title", "")
                msg = f"{action.capitalize()} Issue: {issue_title}"
            elif ev_type == "WatchEvent":
                msg = "Starred repository"
            elif ev_type == "ForkEvent":
                msg = "Forked repository"
            elif ev_type == "CreateEvent":
                ref_type = payload.get("ref_type", "branch/tag")
                msg = f"Created {ref_type} {payload.get('ref', '')}".strip()

            records.append({
                "timestamp": dt,
                "dow": days[dt.weekday()],
                "hour": f"{dt.hour:02d}",
                "month": dt.strftime("%Y-%m"),
                "is_weekend": dt.weekday() in (5, 6)
            })

            if len(recent_events_parsed) < 20:
                recent_events_parsed.append(CommitActivityEvent(
                    id=str(ev.get("id", len(recent_events_parsed))),
                    type=ev_type,
                    repo_name=repo_name,
                    created_at=dt.strftime("%Y-%m-%d %H:%M UTC"),
                    message=msg or ev_type,
                    author=ev.get("actor", {}).get("login"),
                    url=f"https://github.com/{repo_name}"
                ))

        except Exception:
            continue

    if not records:
        return ActivityAnalytics(
            by_day_of_week=dow_counts,
            by_hour=hour_counts,
            monthly_trend=[],
            recent_events=[],
            total_recent_events=0,
            weekend_percentage=0.0
        )

    df = pd.DataFrame(records)
    
    # Day of week
    dow_series = df["dow"].value_counts().to_dict()
    for d in days:
        dow_counts[d] = int(dow_series.get(d, 0))

    # Hours
    hour_series = df["hour"].value_counts().to_dict()
    for h in range(24):
        key = f"{h:02d}"
        hour_counts[key] = int(hour_series.get(key, 0))

    # Monthly trends
    month_counts = df["month"].value_counts().sort_index().to_dict()
    monthly_trend = [{"month": m, "events": int(cnt)} for m, cnt in month_counts.items()]

    # Weekend percentage
    weekend_events = int(df["is_weekend"].sum())
    total_events = len(df)
    weekend_pct = round((weekend_events / total_events) * 100.0, 1) if total_events > 0 else 0.0

    return ActivityAnalytics(
        by_day_of_week=dow_counts,
        by_hour=hour_counts,
        monthly_trend=monthly_trend,
        recent_events=recent_events_parsed,
        total_recent_events=total_events,
        weekend_percentage=weekend_pct
    )

def generate_contribution_heatmap(
    events: List[Dict[str, Any]],
    repos: List[Dict[str, Any]],
    gql_calendar: Optional[Dict[str, Any]] = None,
    year: Optional[int] = None
) -> ContributionData:
    """
    Builds a 365-day contribution calendar matrix.
    If GraphQL calendar is available, uses official GitHub calendar data.
    Otherwise, synthesizes activity counts from public events and repo commits.
    """
    now = datetime.datetime.now(datetime.timezone.utc).date()
    target_year = year if year else now.year

    if gql_calendar and "weeks" in gql_calendar:
        days_list: List[HeatmapDay] = []
        total_c = gql_calendar.get("totalContributions", 0)
        
        for w in gql_calendar.get("weeks", []):
            for d in w.get("contributionDays", []):
                cnt = d.get("contributionCount", 0)
                lvl = 0
                if cnt >= 10:
                    lvl = 4
                elif cnt >= 6:
                    lvl = 3
                elif cnt >= 3:
                    lvl = 2
                elif cnt >= 1:
                    lvl = 1
                
                days_list.append(HeatmapDay(
                    date=d.get("date"),
                    count=cnt,
                    level=lvl,
                    day_of_week=d.get("weekday", 0)
                ))
        
        active_days = sum(1 for d in days_list if d.count > 0)
        return ContributionData(
            total_contributions=total_c,
            active_days=active_days,
            current_streak=calculate_streak(days_list)[0],
            longest_streak=calculate_streak(days_list)[1],
            year=target_year,
            days=days_list,
            measurement_period=f"GitHub Contributions Calendar ({target_year})"
        )

    # Date range: 365 days ending today
    end_date = now
    start_date = end_date - datetime.timedelta(days=364)
    
    # Map of date string -> count
    activity_map: Dict[str, int] = {}

    # Extract from events
    for ev in events:
        c_at = ev.get("created_at")
        if c_at:
            try:
                dt_str = c_at[:10]
                # Weigh push commits
                count = 1
                if ev.get("type") == "PushEvent":
                    count = max(1, len(ev.get("payload", {}).get("commits", [])))
                activity_map[dt_str] = activity_map.get(dt_str, 0) + count
            except Exception:
                pass

    # Extract push dates from repos
    for r in repos:
        pushed_at = r.get("pushed_at")
        if pushed_at:
            dt_str = pushed_at[:10]
            activity_map[dt_str] = activity_map.get(dt_str, 0) + 1

    days_list = []
    curr = start_date
    while curr <= end_date:
        d_str = curr.strftime("%Y-%m-%d")
        cnt = activity_map.get(d_str, 0)
        
        # Level mapping
        if cnt >= 10:
            lvl = 4
        elif cnt >= 6:
            lvl = 3
        elif cnt >= 3:
            lvl = 2
        elif cnt >= 1:
            lvl = 1
        else:
            lvl = 0

        # Python weekday: Mon=0, Sun=6. GitHub Heatmap convention: Sun=0, Sat=6
        gh_dow = (curr.weekday() + 1) % 7

        days_list.append(HeatmapDay(
            date=d_str,
            count=cnt,
            level=lvl,
            day_of_week=gh_dow
        ))
        curr += datetime.timedelta(days=1)

    total_contributions = sum(d.count for d in days_list)
    active_days = sum(1 for d in days_list if d.count > 0)
    current_streak, longest_streak = calculate_streak(days_list)

    return ContributionData(
        total_contributions=total_contributions,
        active_days=active_days,
        current_streak=current_streak,
        longest_streak=longest_streak,
        year=target_year,
        days=days_list,
        measurement_period=f"Trailing 365 Days ({start_date.strftime('%b %Y')} - {end_date.strftime('%b %Y')})"
    )

def calculate_streak(days: List[HeatmapDay]) -> Tuple[int, int]:
    longest = 0
    current = 0
    running = 0

    for d in days:
        if d.count > 0:
            running += 1
            if running > longest:
                longest = running
        else:
            running = 0

    # Current streak (looking backwards from last day)
    for d in reversed(days):
        if d.count > 0:
            current += 1
        else:
            break

    return current, longest
