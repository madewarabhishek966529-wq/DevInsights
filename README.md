# DevInsights
> **“Understand Your Code. Visualize Your Growth.”**

DevInsights is a modern, responsive, data-driven developer activity analytics and visualization platform. It empowers software engineers, recruiters, and open-source maintainers to understand their coding activity, productivity patterns, GitHub repository health, programming language composition, and public contributions through interactive, high-fidelity visualizations.

---

## 🌟 Key Features

### 1. Developer Overview Dashboard
- Aggregates public repository counts, total stars received, external forks, and follower metrics.
- Profile header featuring avatar, bio, location, company, website, and join date.
- Date-range filters (*All Time, 1 Year, 6 Months, 30 Days*) and refresh controls.
- Explicit distinction between public repository metrics and private activity.

### 2. GitHub-Style Contribution Calendar Heatmap
- 365-day activity matrix with month and weekday labels.
- Daily activity levels (0 to 4) with hover inspection showing date and activity count.
- Dynamic streak tracking (*Current Streak*, *Longest Streak*, *Active Days*).
- Multi-year timeline selector (*2026, 2025, 2024*).

### 3. Programming Language Analytics
- Interactive Recharts Donut chart and comparative horizontal bars.
- Precise byte-level code composition breakdown with color tagging.
- Transparent disclaimer: *GitHub repository language statistics estimate code byte composition across repository default branches, not time spent programming or coding hours.*

### 4. Searchable & Sortable Repository Explorer
- Search repositories by title, description, or keyword.
- Filter by programming language, toggle upstream forks, and sort by *Stars*, *Forks*, *Recent Updates*, *Size*, or *Name*.
- Repository health score tags (*0 to 100 with Letter Grades A+ to F*).
- Drill-down modal for comprehensive repository diagnostic inspection.

### 5. Commit & Activity Distribution Analytics
- Day of week activity radar/bars (*Monday through Sunday*).
- Hourly event distribution (*00:00 to 23:00 UTC*).
- Weekend vs weekday activity ratio.
- Live public commit and event stream (*PushEvent, PullRequestEvent, IssuesEvent*).

### 6. Rules-Based Repository Health Analyzer
- Algorithmic, transparent 0-100 diagnostic score:
  - **Maintenance Freshness** (30 pts max)
  - **Documentation Coverage** (25 pts max)
  - **Issue & PR Health** (20 pts max)
  - **Community Adoption** (15 pts max)
  - **Packaging & Releases** (10 pts max)
- Provides diagnostic reasons and actionable improvement recommendations.

### 7. Recruiter Portfolio Audit
- Comprehensive readiness evaluation for recruiters and hiring managers.
- Subscores for *Profile Completeness*, *Repository Hygiene*, and *Licensing*.
- Categorized findings (*Pass*, *Warning*, *Fail*) and prioritized actionable checklist (*High*, *Medium*, *Low* priority).

### 8. Deterministic Smart Insights
- Natural-language pattern detection derived directly from calculated metrics:
  - Flagship project star concentration
  - Polyglot vs single-language focus
  - Dormant/stale repository warnings (>180 days inactive)
  - Weekend warrior vs structured weekday schedules
  - Open-source licensing gaps
- **100% deterministic:** Works without any paid AI API.

### 9. Developer Comparison Suite
- Benchmark 2 to 4 public GitHub profiles side-by-side.
- Comparative metrics matrix (*Stars, Forks, Repositories, Followers, Primary Language*).
- Shared programming languages detection.
- Visual comparative ratio bar chart.

### 10. Growth Milestones & Snapshots
- Capture metric snapshots into a local SQLite database.
- Track progression over time with delta indicators ($\Delta$ stars, $\Delta$ repositories).
- Add custom milestone notes.

### 11. Multi-Format Data Export & PDF Reports
- Download filtered repository catalogs as formatted **CSV** spreadsheets.
- Export comprehensive analytics summaries as **JSON**.
- Generate print-ready **PDF** reports with clean print stylesheets.
- One-click shareable profile URL copying.

### 12. Personalized Dashboard & Themes
- Toggle visibility of individual dashboard modules.
- Choose between **Comfort** (spacious) and **Compact** (high-density) layouts.
- Sleek dark theme default with responsive light mode support.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Recharts, Lucide React, React Router 7 |
| **Backend** | Python 3.12, FastAPI, Pydantic v2, HTTPX, Pandas, SQLAlchemy 2.0 (Async), aiosqlite |
| **Database** | SQLite (development/local) with support for PostgreSQL |
| **Testing** | Pytest, Pytest-Asyncio, Vitest, React Testing Library, JSDOM |

---

## 🚀 Quick Start

### 1. Start Backend API
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate       # On Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```
API will run at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### 2. Start Frontend Client
```bash
cd frontend
npm install
npm run dev
```
Client will run at `http://localhost:5173`.

---

## 🧪 Running Automated Tests

### Backend Tests (Pytest)
```bash
cd backend
.\venv\Scripts\pytest -v
```
*Executes unit and integration tests for repository health calculation, portfolio audit heuristics, language parsing, activity distributions, and FastAPI endpoints.*

### Frontend Tests (Vitest)
```bash
cd frontend
npm test
```
*Executes React Testing Library test suites for interactive components.*

---

## 🔒 Security, Privacy & Rate Limits

1. **GitHub Rate Limits:**
   - Unauthenticated API calls: 60 requests/hour per IP.
   - To raise limits to **5,000 requests/hour**, provide a standard personal access token in `.env`:
     ```env
     GITHUB_TOKEN=ghp_your_token_here
     ```
2. **Built-in TTL Caching:** All GitHub responses are cached in memory for 15 minutes, drastically reducing API consumption.
3. **Privacy First:** Only publicly accessible GitHub data is fetched. No private repositories or user tokens are exposed to client browsers.

---

## 📚 Documentation
- [System Architecture](docs/architecture.md)
- [API Reference](docs/api_reference.md)
- [Health Scoring & Audit Rules](docs/health_scoring_rules.md)
- [Deployment Guide](docs/deployment.md)

---

## 📄 License
MIT License. Open source and built for developers.
