from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
from backend.app.database.session import get_db

router = APIRouter()

@router.get("/health", tags=["System Health"])
def health_check(db: Session = Depends(get_db)):

    db_status = "unhealthy"
    try:

        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "online" if db_status == "healthy" else "degraded",
        "service": "EcoPilot Enterprise ESG Engine",
        "database": db_status,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
