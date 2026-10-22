import pytest
from app.analytics.health_analyzer import calculate_repository_health
from app.analytics.portfolio_audit import run_portfolio_audit
from app.analytics.insights_engine import generate_smart_insights
from app.analytics.data_processor import process_languages, process_activity_events, generate_contribution_heatmap

def test_repository_health_active():
    active_repo = {
        "name": "super-project",
        "description": "An awesome enterprise web application framework",
        "pushed_at": "2026-10-20T12:00:00Z",
        "archived": False,
        "license": {"name": "MIT License", "spdx_id": "MIT"},
        "topics": ["react", "fastapi", "typescript"],
        "homepage": "https://example.com",
        "has_issues": True,
        "open_issues_count": 2,
        "stargazers_count": 150,
        "forks_count": 30,
        "size": 500
    }
    health = calculate_repository_health(active_repo)
    assert health.overall_score >= 80
    assert health.grade in ("A", "A+")
    assert len(health.reasons) > 0

def test_repository_health_stale_and_archived():
    stale_repo = {
        "name": "abandoned-lib",
        "description": "",
        "pushed_at": "2020-01-01T00:00:00Z",
        "archived": True,
        "license": None,
        "topics": [],
        "homepage": None,
        "has_issues": False,
        "open_issues_count": 0,
        "stargazers_count": 0,
        "forks_count": 0,
        "size": 10
    }
    health = calculate_repository_health(stale_repo)
    assert health.overall_score < 50
    assert health.grade in ("D", "F")
    assert any("archived" in r.lower() for r in health.reasons)

def test_portfolio_audit_complete():
    user = {
        "login": "octodev",
        "name": "Octo Developer",
        "avatar_url": "https://avatars.githubusercontent.com/u/123",
        "bio": "Full-stack cloud architect passionate about developer tooling and open source systems.",
        "location": "San Francisco, CA",
        "company": "Acme Corp",
        "blog": "https://octodev.io",
        "public_repos": 10,
        "followers": 250
    }
    repos = [
        {
            "name": "flagship-tool",
            "description": "A robust CLI tool for cloud infrastructure deployments",
            "license": {"name": "Apache-2.0"},
            "topics": ["cli", "cloud"],
            "stargazers_count": 80,
            "forks_count": 15
        },
        {
            "name": "web-starter",
            "description": "Next.js and Tailwind production starter kit",
            "license": {"name": "MIT"},
            "topics": ["react", "nextjs"],
            "stargazers_count": 45,
            "forks_count": 8
        }
    ]
    audit = run_portfolio_audit(user, repos)
    assert audit.overall_score >= 70
    assert audit.grade in ("A+", "A", "B")
    assert len(audit.findings) >= 4

def test_language_processing():
    repos = [
        {"name": "repo1", "language": "TypeScript", "size": 1000},
        {"name": "repo2", "language": "TypeScript", "size": 500},
        {"name": "repo3", "language": "Python", "size": 500},
    ]
    stats = process_languages(repos)
    assert len(stats) == 2
    ts = next(s for s in stats if s.name == "TypeScript")
    py = next(s for s in stats if s.name == "Python")
    assert ts.percentage > py.percentage
    assert ts.repo_count == 2
    assert py.repo_count == 1

def test_activity_events_and_heatmap():
    events = [
        {
            "id": "1",
            "type": "PushEvent",
            "created_at": "2026-10-15T14:30:00Z",
            "repo": {"name": "octodev/flagship-tool"},
            "payload": {"commits": [{"message": "fix: resolve memory leak in pipeline"}]}
        },
        {
            "id": "2",
            "type": "PullRequestEvent",
            "created_at": "2026-10-16T18:00:00Z",
            "repo": {"name": "octodev/web-starter"},
            "payload": {"action": "opened", "pull_request": {"title": "feat: add dark mode support"}}
        }
    ]
    analytics = process_activity_events(events)
    assert analytics.total_recent_events == 2
    assert len(analytics.recent_events) == 2

    heatmap = generate_contribution_heatmap(events, [])
    assert len(heatmap.days) == 365
    assert heatmap.total_contributions >= 2
