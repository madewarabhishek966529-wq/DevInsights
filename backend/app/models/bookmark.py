import datetime
from sqlalchemy import Column, Integer, String, DateTime
from app.core.database import Base

class Bookmark(Base):
    __tablename__ = "bookmarks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    item_type = Column(String(20), nullable=False, index=True) # "user" or "repo"
    identifier = Column(String(150), nullable=False, index=True) # e.g. "torvalds" or "facebook/react"
    title = Column(String(150), nullable=False)
    subtitle = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
