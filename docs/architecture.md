# DevInsights System Architecture

## 1. High-Level Architecture

DevInsights is built with a clear separation of concerns between data ingestion, data analytics, persistence, and reactive client rendering.

```
+---------------------------------------------------------------------------------+
|                                Frontend (Vite + React + TS)                     |
|  - Tailwind CSS + Lucide Icons + Framer Motion                                  |
|  - Recharts for Interactive Visualizations                                      |
|  - Pages: Landing, Dashboard, Repo Explorer, Activity, Health, Audit, Compare    |
|  - Features: PDF/CSV/JSON Export, Snapshot History, Customizable Widgets        |
+---------------------------------------------------------------------------------+
                                       |
                              HTTP / REST API (Port 8000)
                                       v
+---------------------------------------------------------------------------------+
|                                Backend (FastAPI + Python 3.12)                  |
|  - Routers: developers, repositories, analytics, reports, snapshots, health    |
|  - Services: GitHubClient (REST + GraphQL + Event Stream) with Caching & Limiting|
|  - Analytics Engine: Pandas & NumPy metric calculations, Health Scoring, Audit   |
|  - Insight Engine: Deterministic natural-language insight generation           |
|  - Database: SQLite (SQLAlchemy async) for snapshots & user preferences        |
+---------------------------------------------------------------------------------+
                                       |
                                       v
                    GitHub REST & GraphQL API (w/ optional Token)
```

## 2. Component Breakdown

### Frontend Layer
- **Landing Page (`LandingPage.tsx`)**: Hero banner, animated search, sample developer quick pills, interactive feature cards, engineering stack overview.
- **Developer Dashboard (`DashboardPage.tsx`)**: Orchestrates concurrent data loading, date-range filtering, and coordinates individual analytic widgets.
- **Contribution Heatmap (`ContributionHeatmap.tsx`)**: 365-day grid with hover inspection, weekday/month labels, streak tracking, and year toggles.
- **Language Analytics (`LanguageCharts.tsx`)**: Recharts Donut chart, comparative horizontal bars, and explicit code composition disclaimers.
- **Repository Explorer (`RepositoryExplorer.tsx`)**: Filterable, searchable repository catalog with sorting by stars, forks, size, and health diagnostics modal.
- **Portfolio Audit (`PortfolioAuditView.tsx`)**: Recruiter-focused audit view with scorecards, categorized findings, and actionable prioritized checklists.
- **Smart Insights (`SmartInsightsPanel.tsx`)**: Deterministic heuristic observations analyzing flagship concentrations, stale code, and temporal habits.
- **Developer Comparison (`ComparePage.tsx`)**: Side-by-side benchmarking of 2 to 4 developers with shared language detection and ratio charts.
- **Data Export (`ExportModal.tsx`)**: CSV, JSON, and print-ready PDF export generator.

### Backend Layer
- **Async GitHub Client (`github_service.py`)**: Built on HTTPX with exponential backoff, rate limit header detection, and fallback support.
- **In-Memory TTL Cache (`cache_service.py`)**: 15-minute sliding TTL cache with hit/miss analytics to conserve GitHub API quota.
- **Repository Health Diagnostic (`health_analyzer.py`)**: Rules-based 0-100 scoring engine with transparent subscores and actionable suggestions.
- **Portfolio Recruiter Audit (`portfolio_audit.py`)**: Evaluates profile completeness, README coverage, licensing, and community validation.
- **Deterministic Insight Engine (`insights_engine.py`)**: Natural-language heuristic generator without any external or paid AI dependencies.
- **Async Database Layer (`database.py` & `models/`)**: SQLAlchemy 2.0 async engine with SQLite/PostgreSQL support.
