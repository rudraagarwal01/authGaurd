from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Report

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/reports-by-day")
def reports_by_day(db: Session = Depends(get_db)):
    since = datetime.utcnow() - timedelta(days=29)
    rows = (
        db.query(
            func.date(Report.reported_at).label("day"),
            func.count().label("count"),
        )
        .filter(Report.reported_at >= since)
        .group_by(func.date(Report.reported_at))
        .order_by("day")
        .all()
    )
    return [{"date": str(row.day), "count": row.count} for row in rows]
