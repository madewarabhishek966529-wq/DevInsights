# Repository Health & Portfolio Audit Scoring Engine

## 1. Repository Health Scoring Methodology (0 to 100)

DevInsights computes an algorithmic, rules-based diagnostic score evaluating public maintenance signals, documentation clarity, and issue responsiveness.

| Evaluation Category | Max Points | Criteria & Point Allocations |
| :--- | :--- | :--- |
| **Maintenance Freshness** | **30 pts** | - Pushed $\le$ 14 days ago: **30 pts**<br>- Pushed $\le$ 30 days ago: **25 pts**<br>- Pushed $\le$ 90 days ago: **18 pts**<br>- Pushed $\le$ 180 days ago: **10 pts**<br>- Pushed > 180 days ago: **4 pts**<br>- Archived repository: Capped at **5 pts** |
| **Documentation Coverage** | **25 pts** | - Descriptive summary (>15 chars): **+8 pts**<br>- Open-source license detected: **+9 pts**<br>- 3+ Topic tags applied: **+4 pts**<br>- Live website/documentation URL: **+4 pts** |
| **Issue & PR Health** | **20 pts** | - Issues enabled: **+8 pts**<br>- 0 open issues (clean queue): **+12 pts**<br>- 1-5 open issues: **+10 pts**<br>- 6-20 open issues: **+7 pts**<br>- >20 open issues backlog: **+4 pts** |
| **Community Adoption** | **15 pts** | - Stars: $\ge 100$ (**+8 pts**), $\ge 20$ (**+5 pts**), $> 0$ (**+2 pts**)<br>- Forks: $\ge 25$ (**+7 pts**), $\ge 5$ (**+4 pts**), $> 0$ (**+2 pts**) |
| **Release & Packaging** | **10 pts** | - Repository content depth & size stability: **+10 pts** |

### Letter Grade Scale
- **A+**: 90 - 100
- **A**: 80 - 89.9
- **B**: 70 - 79.9
- **C**: 60 - 69.9
- **D**: 50 - 59.9
- **F**: Below 50

> **Important Disclaimer:** DevInsights Repository Health is an algorithmic diagnostic indicator designed to help maintainers identify documentation and maintenance gaps. It is not an official GitHub rating or a definitive measurement of software engineering quality.

---

## 2. Portfolio Recruiter Audit Heuristics

The Portfolio Audit assesses profile readiness for recruiters, engineering hiring managers, and prospective open-source collaborators:

1. **Profile Completeness (30 pts max):**
   - High-resolution avatar presence (+5 pts)
   - Informative bio stating focus and specialization (+10 pts)
   - Stated geographical location & affiliation (+8 pts)
   - Linked personal website or portfolio resume (+7 pts)

2. **Repository Hygiene & Documentation (40 pts max):**
   - Repository description coverage ratio ($\ge 80\%$ gets +15 pts)
   - Open-source LICENSE coverage ratio ($\ge 70\%$ gets +15 pts)
   - Technology topic tagging coverage (+10 pts)

3. **Community Validation (30 pts max):**
   - Earned public stars count ($\ge 50$ stars gets +15 pts)
   - Earned public forks count ($\ge 10$ forks gets +15 pts)
