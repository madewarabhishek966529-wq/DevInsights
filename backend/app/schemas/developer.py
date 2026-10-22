from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

class DeveloperOverview(BaseModel):
    username: str
    name: Optional[str] = None
    avatar_url: str
    bio: Optional[str] = None
    location: Optional[str] = None
    company: Optional[str] = None
    blog: Optional[str] = None
    twitter_username: Optional[str] = None
    html_url: str
    public_repos: int = 0
    public_gists: int = 0
    followers: int = 0
    following: int = 0
    created_at: str
    total_stars: int = 0
    total_forks: int = 0
    primary_language: Optional[str] = None
    is_hireable: Optional[bool] = None
    measurement_period: str = "All public repository data available via GitHub API"
    data_disclaimer: str = "Metrics reflect publicly accessible GitHub repositories and events only. Private activity is excluded unless authorized."

class RepositorySummary(BaseModel):
    id: int
    name: str
    full_name: str
    description: Optional[str] = None
    html_url: str
    language: Optional[str] = None
    stargazers_count: int = 0
    forks_count: int = 0
    open_issues_count: int = 0
    size_kb: int = 0
    created_at: str
    updated_at: str
    pushed_at: Optional[str] = None
    is_fork: bool = False
    is_archived: bool = False
    license_name: Optional[str] = None
    default_branch: str = "main"
    topics: List[str] = []
    health_score: Optional[float] = None

class LanguageStat(BaseModel):
    name: str
    bytes: int
    percentage: float
    repo_count: int
    color: str

class LanguageAnalytics(BaseModel):
    languages: List[LanguageStat]
    total_bytes: int
    total_repos_analyzed: int
    disclaimer: str = "GitHub repository language statistics estimate code byte composition across repository default branches, not hours worked or time spent coding."

class HeatmapDay(BaseModel):
    date: str # YYYY-MM-DD
    count: int
    level: int # 0 to 4
    day_of_week: int # 0 = Sunday, 6 = Saturday

class ContributionData(BaseModel):
    total_contributions: int
    active_days: int
    current_streak: int
    longest_streak: int
    year: int
    days: List[HeatmapDay]
    measurement_period: str
    disclaimer: str = "Aggregated from public push events, commits, and pull requests accessible via GitHub Public API for the selected timeframe."

class CommitActivityEvent(BaseModel):
    id: str
    type: str # PushEvent, PullRequestEvent, IssuesEvent, CreateEvent, etc.
    repo_name: str
    created_at: str
    message: Optional[str] = None
    author: Optional[str] = None
    url: Optional[str] = None

class ActivityAnalytics(BaseModel):
    by_day_of_week: Dict[str, int] # e.g. {"Mon": 12, "Tue": 15...}
    by_hour: Dict[str, int] # e.g. {"00": 2, "01": 0, ... "23": 5}
    monthly_trend: List[Dict[str, Any]] # [{"month": "2024-01", "events": 25}, ...]
    recent_events: List[CommitActivityEvent]
    total_recent_events: int
    weekend_percentage: float
    disclaimer: str = "Activity timestamps reflect commit author dates and public GitHub event records. Do not infer actual working hours, effort, or developer productivity solely from timestamp distribution."

class HealthScoreBreakdown(BaseModel):
    repo_name: str
    overall_score: float # 0 to 100
    grade: str # A+, A, B, C, D, F
    maintenance_score: float
    documentation_score: float
    issue_score: float
    community_score: float
    release_score: float
    reasons: List[str]
    suggestions: List[str]
    disclaimer: str = "DevInsights Repository Health is an algorithmic, rules-based diagnostic score calculated from public maintenance indicators, documentation checks, and issue activity. It is not an official GitHub rating or a definitive measure of software quality."

class PortfolioAuditFinding(BaseModel):
    id: str
    category: str # "Profile", "Documentation", "Repository Quality", "Licensing"
    status: str # "pass", "warning", "fail"
    title: str
    description: str
    impact: str # "High", "Medium", "Low"

class PortfolioAuditResult(BaseModel):
    username: str
    overall_score: float
    grade: str
    completeness_score: float
    repository_hygiene_score: float
    licensing_score: float
    findings: List[PortfolioAuditFinding]
    action_items: List[Dict[str, str]]
    disclaimer: str = "Portfolio audit generates heuristic recommendations based on recruiter readability and open-source best practices. It does not predict employment outcomes or job suitability."

class SmartInsight(BaseModel):
    id: str
    type: str # "growth", "stagnation", "language_trend", "anomaly", "best_practice"
    severity: str # "positive", "info", "warning"
    title: str
    description: str
    metric_source: str

class DeveloperComparison(BaseModel):
    developers: List[DeveloperOverview]
    shared_languages: List[str]
    metrics_matrix: List[Dict[str, Any]]
    disclaimer: str = "Developer comparisons measure public repository counts, stars, forks, and detected languages. Metrics do not measure overall skill, code quality, or engineering competence."

class SnapshotCreate(BaseModel):
    username: str
    note: Optional[str] = None

class SnapshotResponse(BaseModel):
    id: int
    username: str
    captured_at: str
    followers: int
    public_repos: int
    total_stars: int
    total_forks: int
    health_score: float
    audit_score: float
    note: Optional[str] = None

class UserPreferenceUpdate(BaseModel):
    theme: Optional[str] = None
    layout_mode: Optional[str] = None
    visible_widgets: Optional[List[str]] = None
    widget_order: Optional[List[str]] = None
    pinned_developers: Optional[List[str]] = None

class UserPreferenceResponse(BaseModel):
    user_key: str
    theme: str
    layout_mode: str
    visible_widgets: List[str]
    widget_order: List[str]
    pinned_developers: List[str]
    updated_at: str

class ExportRequest(BaseModel):
    username: str
    format: str = "csv" # "csv", "json"
    include_repos: bool = True
    include_languages: bool = True
    include_activity: bool = True
