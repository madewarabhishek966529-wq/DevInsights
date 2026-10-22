from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List
import json

from app.core.database import get_db
from app.models.snapshot import DeveloperSnapshot
from app.schemas.developer import SnapshotResponse, SnapshotCreate
from app.services.github_service import github_client
from app.analytics.health_analyzer import calculate_repository_health
from app.analytics.portfolio_audit import run_portfolio_audit

router = APIRouter()

@router.get("/{username}", response_model=List[SnapshotResponse])
async def get_developer_snapshots(username: str, db: AsyncSession = Depends(get_db)):
    stmt = select(DeveloperSnapshot).where(DeveloperSnapshot.username == username.lower()).order_by(desc(DeveloperSnapshot.captured_at))
    result = await db.execute(stmt)
    records = result.scalars().all()
    
    return [
        SnapshotResponse(
            id=r.id,
            username=r.username,
            captured_at=r.captured_at.strftime("%Y-%m-%d %H:%M UTC"),
            followers=r.followers,
            public_repos=r.public_repos,
            total_stars=r.total_stars,
            total_forks=r.total_forks,
            health_score=r.health_score,
            audit_score=r.audit_score,
            note=r.note
        )
        for r in records
    ]

@router.post("/{username}", response_model=SnapshotResponse)
async def create_developer_snapshot(username: str, body: SnapshotCreate, db: AsyncSession = Depends(get_db)):
    user_data = await github_client.get_user_profile(username)
    repos = await github_client.get_user_repositories(username)
    
    total_stars = sum(r.get("stargazers_count", 0) for r in repos)
    total_forks = sum(r.get("forks_count", 0) for r in repos)
    
    # Calculate health score average across repos
    health_scores = [calculate_repository_health(r).overall_score for r in repos]
    avg_health = round(sum(health_scores) / len(health_scores), 1) if health_scores else 0.0

    # Portfolio audit
    audit = run_portfolio_audit(user_data, repos)

    snapshot = DeveloperSnapshot(
        username=username.lower(),
        followers=user_data.get("followers", 0),
        public_repos=user_data.get("public_repos", len(repos)),
        total_stars=total_stars,
        total_forks=total_forks,
        health_score=avg_health,
        audit_score=audit.overall_score,
        note=body.note,
        metrics_json=json.dumps({
            "bio": user_data.get("bio"),
            "company": user_data.get("company"),
            "location": user_data.get("location")
        })
    )
    
    db.add(snapshot)
    await db.commit()
    await db.refresh(snapshot)

    return SnapshotResponse(
        id=snapshot.id,
        username=snapshot.username,
        captured_at=snapshot.captured_at.strftime("%Y-%m-%d %H:%M UTC"),
        followers=snapshot.followers,
        public_repos=snapshot.public_repos,
        total_stars=snapshot.total_stars,
        total_forks=snapshot.total_forks,
        health_score=snapshot.health_score,
        audit_score=snapshot.audit_score,
        note=snapshot.note
    )
