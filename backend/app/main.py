from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import init_db
from app.api.endpoints.health import router as health_router
from app.api.endpoints.developers import router as developers_router
from app.api.endpoints.repositories import router as repositories_router
from app.api.endpoints.compare import router as compare_router
from app.api.endpoints.snapshots import router as snapshots_router
from app.api.endpoints.preferences import router as preferences_router
from app.api.endpoints.reports import router as reports_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite tables on startup
    await init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Developer Activity Analytics & Visualization Platform API. Understand Your Code. Visualize Your Growth.",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health_router, prefix="/api", tags=["System Health"])
app.include_router(compare_router, prefix="/api/developers", tags=["Compare"])
app.include_router(developers_router, prefix="/api/developers", tags=["Developers"])
app.include_router(repositories_router, prefix="/api/repositories", tags=["Repositories"])
app.include_router(snapshots_router, prefix="/api/snapshots", tags=["Snapshots & Growth"])
app.include_router(preferences_router, prefix="/api/preferences", tags=["Preferences & Layout"])
app.include_router(reports_router, prefix="/api/reports", tags=["Reports & Export"])

@app.get("/")
async def root():
    return {
        "platform": settings.PROJECT_NAME,
        "tagline": "Understand Your Code. Visualize Your Growth.",
        "version": settings.PROJECT_VERSION,
        "docs_url": "/docs",
        "health_check": "/api/health"
    }
