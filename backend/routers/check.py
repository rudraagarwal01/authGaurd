from datetime import datetime, timezone
from urllib.parse import urlparse
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Domain, DomainStatus
from ..schemas import CheckRequest, CheckResponse
from ..services.scoring import compute_risk_score
from ..services.safe_browsing import check_safe_browsing

router = APIRouter(tags=["check"])


@router.post("/check", response_model=CheckResponse)
async def check_url(req: CheckRequest, db: Session = Depends(get_db)):
    parsed = urlparse(req.url if "://" in req.url else f"https://{req.url}")
    domain = (parsed.hostname or req.url).lower()

    result = compute_risk_score(req.url)
    sb_hit = await check_safe_browsing(req.url)

    if sb_hit:
        result["risk_score"] = min(result["risk_score"] + 30, 100.0)
        result["flags"].append("safe_browsing_hit")

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    existing = db.query(Domain).filter(Domain.url == domain).first()
    if existing:
        existing.risk_score = result["risk_score"]
        existing.last_seen = now
    else:
        status_val = DomainStatus.flagged if result["risk_score"] >= 60 else DomainStatus.pending
        existing = Domain(
            url=domain,
            risk_score=result["risk_score"],
            first_seen=now,
            last_seen=now,
            status=status_val,
        )
        db.add(existing)
    db.commit()

    return CheckResponse(
        url=req.url,
        domain=domain,
        risk_score=result["risk_score"],
        flags=result["flags"],
        matched_brand=result.get("matched_brand"),
        safe_browsing_hit=sb_hit,
    )
