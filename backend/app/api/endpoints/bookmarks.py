from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, delete
from typing import List, Optional

from app.core.database import get_db
from app.models.bookmark import Bookmark
from app.schemas.developer import BookmarkItem, BookmarkCreate

router = APIRouter()

@router.get("", response_model=List[BookmarkItem])
async def list_bookmarks(
    item_type: Optional[str] = Query(None, description="Filter by 'user' or 'repo'"),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Bookmark)
    if item_type:
        stmt = stmt.where(Bookmark.item_type == item_type.lower())
    stmt = stmt.order_by(desc(Bookmark.created_at))
    result = await db.execute(stmt)
    records = result.scalars().all()

    return [
        BookmarkItem(
            id=r.id,
            item_type=r.item_type,
            identifier=r.identifier,
            title=r.title,
            subtitle=r.subtitle,
            avatar_url=r.avatar_url,
            created_at=r.created_at.strftime("%Y-%m-%d %H:%M UTC")
        )
        for r in records
    ]

@router.post("", response_model=BookmarkItem)
async def create_or_toggle_bookmark(body: BookmarkCreate, db: AsyncSession = Depends(get_db)):
    # Check if already exists
    stmt = select(Bookmark).where(
        Bookmark.item_type == body.item_type.lower(),
        Bookmark.identifier == body.identifier.strip()
    )
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()
    if existing:
        return BookmarkItem(
            id=existing.id,
            item_type=existing.item_type,
            identifier=existing.identifier,
            title=existing.title,
            subtitle=existing.subtitle,
            avatar_url=existing.avatar_url,
            created_at=existing.created_at.strftime("%Y-%m-%d %H:%M UTC")
        )

    new_bm = Bookmark(
        item_type=body.item_type.lower(),
        identifier=body.identifier.strip(),
        title=body.title,
        subtitle=body.subtitle,
        avatar_url=body.avatar_url
    )
    db.add(new_bm)
    await db.commit()
    await db.refresh(new_bm)

    return BookmarkItem(
        id=new_bm.id,
        item_type=new_bm.item_type,
        identifier=new_bm.identifier,
        title=new_bm.title,
        subtitle=new_bm.subtitle,
        avatar_url=new_bm.avatar_url,
        created_at=new_bm.created_at.strftime("%Y-%m-%d %H:%M UTC")
    )

@router.delete("/{bookmark_id}")
async def delete_bookmark(bookmark_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Bookmark).where(Bookmark.id == bookmark_id)
    result = await db.execute(stmt)
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    await db.delete(item)
    await db.commit()
    return {"status": "deleted", "id": bookmark_id}

@router.delete("/remove/{item_type}/{identifier:path}")
async def delete_bookmark_by_identifier(item_type: str, identifier: str, db: AsyncSession = Depends(get_db)):
    stmt = delete(Bookmark).where(
        Bookmark.item_type == item_type.lower(),
        Bookmark.identifier == identifier.strip()
    )
    result = await db.execute(stmt)
    await db.commit()
    return {"status": "deleted", "affected": result.rowcount}
