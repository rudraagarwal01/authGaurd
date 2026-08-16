from datetime import datetime, timezone
from urllib.parse import urlparse
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Domain, DomainStatus, Report
from ..schemas import ReportRequest, ReportResponse
from ..services.scoring import compute_risk_score

router = APIRouter(tags=["report"])


@router.post("/report", response_model=ReportResponse)
def report_url(req: ReportRequest, db: Session = Depends(get_db)):
    parsed = urlparse(req.url if "://" in req.url else f"https://{req.url}")
    domain = (parsed.hostname or req.url).lower()

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    existing = db.query(Domain).filter(Domain.url == domain).first()
    if not existing:
        result = compute_risk_score(req.url)
        existing = Domain(
            url=domain,
            risk_score=result["risk_score"],
            report_count=0,
            first_seen=now,
            last_seen=now,
            status=DomainStatus.pending,
        )
        db.add(existing)
        db.flush()

    existing.report_count += 1
    existing.last_seen = now

    report = Report(domain_id=existing.id, reported_at=now, reason=req.reason)
    db.add(report)
    db.commit()
    db.refresh(report)

    return ReportResponse(status="ok", domain=domain, report_id=report.id)
