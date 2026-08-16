from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from .models import DomainStatus


class CheckRequest(BaseModel):
    url: str


class CheckResponse(BaseModel):
    url: str
    domain: str
    risk_score: float
    flags: list[str]
    matched_brand: Optional[str] = None
    safe_browsing_hit: bool = False


class ReportRequest(BaseModel):
    url: str
    reason: Optional[str] = None


class ReportResponse(BaseModel):
    status: str
    domain: str
    report_id: int


class DomainOut(BaseModel):
    id: int
    url: str
    risk_score: float
    report_count: int
    first_seen: datetime
    last_seen: datetime
    status: DomainStatus

    model_config = {"from_attributes": True}


class DomainListResponse(BaseModel):
    items: list[DomainOut]
    total: int
    page: int
    per_page: int


class DomainStatusUpdate(BaseModel):
    status: DomainStatus


class TokenRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
