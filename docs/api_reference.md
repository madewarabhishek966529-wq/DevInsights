# DevInsights API Reference

## Base URL
`/api`

## Endpoints

### 1. System Health
`GET /api/health`
- **Description:** Returns system status, version, GitHub API rate limit status, and cache efficiency metrics.
- **Response:**
```json
{
  "status": "healthy",
  "service": "DevInsights",
  "version": "1.0.0",
  "environment": "development",
  "github_api": {
    "rate_limit": 60,
    "rate_limit_remaining": 58,
    "authenticated": false
  },
  "cache": {
    "total_items": 4,
    "hits": 12,
    "misses": 4,
    "hit_ratio": 0.75
  }
}
```

### 2. Developer Overview
`GET /api/developers/{username}/overview`
- **Description:** Returns developer bio, star aggregate, fork aggregate, followers, and primary programming language.

### 3. Developer Repositories
`GET /api/developers/{username}/repositories`
- **Query Parameters:**
  - `sort`: `updated` | `stars` | `forks` | `size` | `name` (default: `updated`)
  - `order`: `asc` | `desc` (default: `desc`)
  - `language`: string (optional filter)
  - `include_forks`: boolean (default: `true`)
  - `limit`: integer (1-100, default: 100)
- **Response:** List of repositories with calculated health scores.

### 4. Programming Languages
`GET /api/developers/{username}/languages`
- **Description:** Byte-weighted language composition across repositories, percentage share, repo counts, and hex color tags.

### 5. Commit & Activity Distribution
`GET /api/developers/{username}/activity`
- **Description:** Day of week distribution (Mon-Sun), hourly distribution (00:00 - 23:00 UTC), monthly trends, weekend percentage, and recent public event stream.

### 6. Contribution Heatmap
`GET /api/developers/{username}/contributions`
- **Query Parameters:**
  - `year`: integer (optional)
- **Description:** 365-day matrix cells with dates, activity levels (0-4), weekday tags, active days, current streak, and longest streak.

### 7. Portfolio Audit
`GET /api/developers/{username}/portfolio-audit`
- **Description:** Recruiter-oriented evaluation including profile completeness, description hygiene, licensing score, categorized findings, and actionable recommendations.

### 8. Deterministic Smart Insights
`GET /api/developers/{username}/insights`
- **Description:** Rule-derived pattern observations including flagship project concentration, inactive repositories, weekend habit detection, and licensing gaps.

### 9. Repository Health Diagnostic
`GET /api/repositories/{owner}/{repo}/health`
- **Description:** Individual repository 0-100 score with subscore breakdown (maintenance, documentation, issues, community, releases) and suggested actions.

### 10. Developer Comparison
`GET /api/developers/compare?usernames=torvalds,gaearon`
- **Description:** Benchmarking of 2 to 4 developer profiles side-by-side with shared languages and comparative metrics matrix.

### 11. Reports & Data Export
`POST /api/reports/export`
- **Body:**
```json
{
  "username": "torvalds",
  "format": "csv",
  "include_repos": true,
  "include_languages": true,
  "include_activity": true
}
```
- **Response:** Formatted CSV or JSON attachment file.

### 12. Snapshots & Preferences
- `GET /api/snapshots/{username}`: Historical snapshots.
- `POST /api/snapshots/{username}`: Save current snapshot.
- `GET /api/preferences`: Retrieve user widget preferences.
- `POST /api/preferences`: Update widget visibility and layout density mode.
