from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..auth import get_current_admin
from ..database import get_db
from ..models import Domain, DomainStatus
from ..schemas import DomainListResponse, DomainOut, DomainStatusUpdate

router = APIRouter(prefix="/domains", tags=["domains"])


@router.get("", response_model=DomainListResponse)
def list_domains(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: Optional[DomainStatus] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = db.query(Domain)
    if status:
        q = q.filter(Domain.status == status)
    if search:
        q = q.filter(Domain.url.ilike(f"%{search}%"))
    total = q.count()
    items = q.order_by(Domain.last_seen.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return DomainListResponse(items=items, total=total, page=page, per_page=per_page)


@router.patch("/{domain_id}/status", response_model=DomainOut)
def update_domain_status(
    domain_id: int,
    update: DomainStatusUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_admin),
):
    domain = db.query(Domain).filter(Domain.id == domain_id).first()
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")
    domain.status = update.status
    db.commit()
    db.refresh(domain)
    return domain
