from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import json

from app.core.database import get_db
from app.models.preference import UserPreference
from app.schemas.developer import UserPreferenceResponse, UserPreferenceUpdate

router = APIRouter()

DEFAULT_WIDGETS = ["metrics", "heatmap", "languages", "activity", "repositories", "health", "insights"]

@router.get("", response_model=UserPreferenceResponse)
async def get_user_preferences(user_key: str = "default", db: AsyncSession = Depends(get_db)):
    stmt = select(UserPreference).where(UserPreference.user_key == user_key)
    result = await db.execute(stmt)
    pref = result.scalar_one_or_none()

    if not pref:
        # Create default preference entry
        pref = UserPreference(
            user_key=user_key,
            theme="dark",
            layout_mode="comfort",
            visible_widgets_json=json.dumps(DEFAULT_WIDGETS),
            widget_order_json=json.dumps(DEFAULT_WIDGETS),
            pinned_developers_json=json.dumps(["torvalds", "gaearon", "shadcn"])
        )
        db.add(pref)
        await db.commit()
        await db.refresh(pref)

    return UserPreferenceResponse(
        user_key=pref.user_key,
        theme=pref.theme,
        layout_mode=pref.layout_mode,
        visible_widgets=json.loads(pref.visible_widgets_json or json.dumps(DEFAULT_WIDGETS)),
        widget_order=json.loads(pref.widget_order_json or json.dumps(DEFAULT_WIDGETS)),
        pinned_developers=json.loads(pref.pinned_developers_json or "[]"),
        updated_at=pref.updated_at.strftime("%Y-%m-%d %H:%M UTC") if pref.updated_at else ""
    )

@router.post("", response_model=UserPreferenceResponse)
async def update_user_preferences(body: UserPreferenceUpdate, user_key: str = "default", db: AsyncSession = Depends(get_db)):
    stmt = select(UserPreference).where(UserPreference.user_key == user_key)
    result = await db.execute(stmt)
    pref = result.scalar_one_or_none()

    if not pref:
        pref = UserPreference(user_key=user_key)
        db.add(pref)

    if body.theme is not None:
        pref.theme = body.theme
    if body.layout_mode is not None:
        pref.layout_mode = body.layout_mode
    if body.visible_widgets is not None:
        pref.visible_widgets_json = json.dumps(body.visible_widgets)
    if body.widget_order is not None:
        pref.widget_order_json = json.dumps(body.widget_order)
    if body.pinned_developers is not None:
        pref.pinned_developers_json = json.dumps(body.pinned_developers)

    await db.commit()
    await db.refresh(pref)

    return UserPreferenceResponse(
        user_key=pref.user_key,
        theme=pref.theme,
        layout_mode=pref.layout_mode,
        visible_widgets=json.loads(pref.visible_widgets_json or json.dumps(DEFAULT_WIDGETS)),
        widget_order=json.loads(pref.widget_order_json or json.dumps(DEFAULT_WIDGETS)),
        pinned_developers=json.loads(pref.pinned_developers_json or "[]"),
        updated_at=pref.updated_at.strftime("%Y-%m-%d %H:%M UTC") if pref.updated_at else ""
    )
