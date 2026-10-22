import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text
from app.core.database import Base

class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_key = Column(String(100), unique=True, index=True, nullable=False, default="default")
    theme = Column(String(20), default="dark") # dark, light
    layout_mode = Column(String(20), default="comfort") # comfort, compact
    visible_widgets_json = Column(Text, nullable=True) # List of enabled widget ids
    widget_order_json = Column(Text, nullable=True) # Ordered list of widget ids
    pinned_developers_json = Column(Text, nullable=True) # Pinned dev usernames
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
