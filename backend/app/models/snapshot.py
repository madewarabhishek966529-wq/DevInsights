import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, Float
from app.core.database import Base

class DeveloperSnapshot(Base):
    __tablename__ = "developer_snapshots"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(100), index=True, nullable=False)
    captured_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    followers = Column(Integer, default=0)
    public_repos = Column(Integer, default=0)
    total_stars = Column(Integer, default=0)
    total_forks = Column(Integer, default=0)
    health_score = Column(Float, default=0.0)
    audit_score = Column(Float, default=0.0)
    metrics_json = Column(Text, nullable=True) # Full JSON metrics snapshot
    note = Column(String(255), nullable=True)
