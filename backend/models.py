import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum as SAEnum
from sqlalchemy.orm import relationship
from .database import Base


class DomainStatus(str, enum.Enum):
    pending = "pending"
    flagged = "flagged"
    safe = "safe"
    dismissed = "dismissed"


class Domain(Base):
    __tablename__ = "domains"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, unique=True, index=True, nullable=False)
    risk_score = Column(Float, default=0.0)
    report_count = Column(Integer, default=0)
    first_seen = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)
    status = Column(SAEnum(DomainStatus), default=DomainStatus.pending)

    reports = relationship("Report", back_populates="domain", cascade="all, delete-orphan")


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    domain_id = Column(Integer, ForeignKey("domains.id"), nullable=False)
    reported_at = Column(DateTime, default=datetime.utcnow)
    reason = Column(String, nullable=True)

    domain = relationship("Domain", back_populates="reports")
