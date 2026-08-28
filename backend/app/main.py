import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.routers import auth, complaints, officer
from app.utils.seed_data import seed_database

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("NHAA_API")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables and auto-seed database
    logger.info("Initializing NHAA Database tables...")
    Base.metadata.create_all(bind=engine)
    
    # Auto-migrate missing columns for existing SQLite/Postgres tables
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            for col_name, col_type in [
                ("category_responses", "JSON"),
                ("city_district", "VARCHAR"),
                ("incident_address", "VARCHAR"),
                ("pincode", "VARCHAR"),
                ("citizen_comment", "TEXT"),
                ("citizen_comment_at", "TIMESTAMP"),
                ("feedback_rating", "VARCHAR"),
                ("feedback_comment", "TEXT"),
                ("feedback_at", "TIMESTAMP")
            ]:
                try:
                    conn.execute(text(f"ALTER TABLE complaints ADD COLUMN {col_name} {col_type}"))
                    conn.commit()
                except Exception:
                    pass
    except Exception as e:
        logger.warn(f"Schema auto-migration check notice: {e}")

    db = SessionLocal()
    try:
        seed_database(db)
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
    finally:
        db.close()
        
    yield
    logger.info("Shutting down NHAA API service.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "AI-Based Real-Time Stress and Trauma Assessment Module for Victims/Complainants "
        "Accessing NHAA (14566) and Integrated Portal. Provides objective distress scoring, "
        "risk classification (LOW/MODERATE/HIGH), emergency triage queue management, "
        "and human officer decision support with ethical guardrails."
    ),
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(complaints.router, prefix=settings.API_V1_STR)
app.include_router(officer.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "disclaimer": "AI triage module output is advisory only. Medical/psychological diagnosis is not provided."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
