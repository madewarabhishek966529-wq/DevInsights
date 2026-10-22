from typing import Dict, Any, List
from app.schemas.developer import PortfolioAuditResult, PortfolioAuditFinding

def run_portfolio_audit(user: Dict[str, Any], repos: List[Dict[str, Any]]) -> PortfolioAuditResult:
    findings: List[PortfolioAuditFinding] = []
    action_items: List[Dict[str, str]] = []
    
    # 1. Profile Completeness (Max 30)
    completeness_pts = 0.0
    
    # Avatar
    if user.get("avatar_url"):
        completeness_pts += 5.0
        findings.append(PortfolioAuditFinding(
            id="avatar_present",
            category="Profile",
            status="pass",
            title="Profile Picture Present",
            description="Clear profile avatar builds immediate trust and recognition.",
            impact="Low"
        ))

    # Bio
    bio = user.get("bio")
    if bio and len(bio.strip()) >= 20:
        completeness_pts += 10.0
        findings.append(PortfolioAuditFinding(
            id="bio_quality",
            category="Profile",
            status="pass",
            title="Informative Profile Bio",
            description=f"Your bio effectively states your developer identity ({len(bio)} characters).",
            impact="Medium"
        ))
    elif bio:
        completeness_pts += 5.0
        findings.append(PortfolioAuditFinding(
            id="bio_short",
            category="Profile",
            status="warning",
            title="Bio Could Be More Descriptive",
            description="Your bio is very brief. Highlight your specialization, primary tech stack, or what you are currently building.",
            impact="Medium"
        ))
        action_items.append({
            "priority": "Medium",
            "task": "Expand your GitHub bio to detail your primary technologies and current focus."
        })
    else:
        findings.append(PortfolioAuditFinding(
            id="bio_missing",
            category="Profile",
            status="fail",
            title="Missing Profile Bio",
            description="Recruiters and collaborators cannot quickly determine your focus area.",
            impact="High"
        ))
        action_items.append({
            "priority": "High",
            "task": "Write a 1-2 sentence bio highlighting your technical stack and role."
        })

    # Location & Company
    loc = user.get("location")
    company = user.get("company")
    if loc and company:
        completeness_pts += 8.0
        findings.append(PortfolioAuditFinding(
            id="work_location",
            category="Profile",
            status="pass",
            title="Location & Affiliation Listed",
            description=f"Located in {loc} working with {company}.",
            impact="Low"
        ))
    elif loc or company:
        completeness_pts += 5.0
    else:
        findings.append(PortfolioAuditFinding(
            id="location_missing",
            category="Profile",
            status="warning",
            title="No Location or Affiliation Stated",
            description="Listing your location helps timezone coordination for remote collaboration and recruiter outreach.",
            impact="Low"
        ))
        action_items.append({
            "priority": "Low",
            "task": "Add your general location (City/Country) to your GitHub profile."
        })

    # Website / Portfolio Link
    blog = user.get("blog")
    if blog and ("http" in blog or "." in blog):
        completeness_pts += 7.0
        findings.append(PortfolioAuditFinding(
            id="portfolio_url",
            category="Profile",
            status="pass",
            title="Personal Website Linked",
            description=f"External link to portfolio or resume: {blog}",
            impact="Medium"
        ))
    else:
        findings.append(PortfolioAuditFinding(
            id="portfolio_missing",
            category="Profile",
            status="warning",
            title="No Personal Website or Portfolio Linked",
            description="Adding a personal site, LinkedIn, or interactive resume significantly enhances recruiter conversion.",
            impact="Medium"
        ))
        action_items.append({
            "priority": "Medium",
            "task": "Link your personal portfolio, blog, or LinkedIn profile in your profile settings."
        })

    # 2. Repository Hygiene (Max 40)
    hygiene_pts = 0.0
    total_repos = len(repos)
    
    if total_repos == 0:
        findings.append(PortfolioAuditFinding(
            id="no_public_repos",
            category="Repository Quality",
            status="fail",
            title="No Public Repositories Found",
            description="Portfolio cannot showcase code without public repositories.",
            impact="High"
        ))
        action_items.append({
            "priority": "High",
            "task": "Publish at least 1-2 polished public repositories showcasing your best work."
        })
    else:
        # Check description coverage
        repos_with_desc = sum(1 for r in repos if r.get("description") and len(r.get("description").strip()) > 10)
        desc_ratio = repos_with_desc / total_repos
        if desc_ratio >= 0.8:
            hygiene_pts += 15.0
            findings.append(PortfolioAuditFinding(
                id="desc_coverage",
                category="Documentation",
                status="pass",
                title="Excellent Description Coverage",
                description=f"{int(desc_ratio*100)}% of your repositories have descriptive summaries.",
                impact="Medium"
            ))
        elif desc_ratio >= 0.5:
            hygiene_pts += 10.0
            findings.append(PortfolioAuditFinding(
                id="desc_coverage_partial",
                category="Documentation",
                status="warning",
                title="Moderate Description Coverage",
                description=f"{int(desc_ratio*100)}% of repositories have descriptions. Some repositories have empty descriptions.",
                impact="Medium"
            ))
            action_items.append({
                "priority": "Medium",
                "task": "Add short, clear descriptions to all public repositories."
            })
        else:
            hygiene_pts += 4.0
            findings.append(PortfolioAuditFinding(
                id="desc_coverage_low",
                category="Documentation",
                status="fail",
                title="Many Repositories Lack Descriptions",
                description=f"Only {int(desc_ratio*100)}% of repositories have descriptions. Unlabeled repos look abandoned or incomplete.",
                impact="High"
            ))
            action_items.append({
                "priority": "High",
                "task": "Add explanatory descriptions to your public repositories."
            })

        # Check license coverage
        repos_with_license = sum(1 for r in repos if r.get("license"))
        lic_ratio = repos_with_license / total_repos
        licensing_score = round(lic_ratio * 30.0, 1)
        if lic_ratio >= 0.7:
            hygiene_pts += 15.0
            findings.append(PortfolioAuditFinding(
                id="license_coverage",
                category="Licensing",
                status="pass",
                title="Strong Open-Source Licensing",
                description=f"{int(lic_ratio*100)}% of repositories contain explicit open-source licenses.",
                impact="Medium"
            ))
        elif lic_ratio >= 0.3:
            hygiene_pts += 8.0
            findings.append(PortfolioAuditFinding(
                id="license_coverage_med",
                category="Licensing",
                status="warning",
                title="Inconsistent Licensing",
                description=f"Only {int(lic_ratio*100)}% of your projects have a LICENSE file. Without one, default copyright restricts collaboration.",
                impact="Medium"
            ))
            action_items.append({
                "priority": "Medium",
                "task": "Add MIT or Apache 2.0 license files to your open source projects."
            })
        else:
            hygiene_pts += 3.0
            findings.append(PortfolioAuditFinding(
                id="license_coverage_low",
                category="Licensing",
                status="fail",
                title="Missing Licenses Across Most Repositories",
                description="Most repositories have no license declared, creating ambiguity for prospective employers and users.",
                impact="High"
            ))
            action_items.append({
                "priority": "High",
                "task": "Include an open-source LICENSE in all public projects."
            })

        # Check topic tags
        repos_with_topics = sum(1 for r in repos if r.get("topics") and len(r.get("topics")) > 0)
        topic_ratio = repos_with_topics / total_repos
        if topic_ratio >= 0.5:
            hygiene_pts += 10.0
            findings.append(PortfolioAuditFinding(
                id="topics_applied",
                category="Repository Quality",
                status="pass",
                title="Good Tagging & Discoverability",
                description=f"{int(topic_ratio*100)}% of repositories use GitHub topic tags.",
                impact="Low"
            ))
        else:
            hygiene_pts += 4.0
            action_items.append({
                "priority": "Low",
                "task": "Tag repositories with technology topics (e.g., 'react', 'fastapi', 'typescript') for SEO."
            })

    # 3. Language & Community Depth (Max 30)
    depth_pts = 0.0
    total_stars = sum(r.get("stargazers_count", 0) for r in repos)
    total_forks = sum(r.get("forks_count", 0) for r in repos)
    
    if total_stars >= 50:
        depth_pts += 15.0
        findings.append(PortfolioAuditFinding(
            id="community_stars",
            category="Repository Quality",
            status="pass",
            title="Proven Community Validation",
            description=f"Earned {total_stars} stars across your public repositories.",
            impact="Medium"
        ))
    elif total_stars >= 10:
        depth_pts += 10.0
    else:
        depth_pts += 5.0

    if total_forks >= 10:
        depth_pts += 15.0
    elif total_forks >= 2:
        depth_pts += 8.0
    else:
        depth_pts += 3.0

    overall = round(min(100.0, completeness_pts + hygiene_pts + depth_pts), 1)

    if overall >= 90:
        grade = "A+"
    elif overall >= 80:
        grade = "A"
    elif overall >= 70:
        grade = "B"
    elif overall >= 60:
        grade = "C"
    elif overall >= 50:
        grade = "D"
    else:
        grade = "F"

    return PortfolioAuditResult(
        username=user.get("login", "unknown"),
        overall_score=overall,
        grade=grade,
        completeness_score=round(completeness_pts, 1),
        repository_hygiene_score=round(hygiene_pts, 1),
        licensing_score=round(hygiene_pts * 0.75, 1),
        findings=findings,
        action_items=action_items
    )
