from sqlalchemy import Column, Text, Float, Boolean
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP, ARRAY

from .base import Base


class Registration(Base):
    __tablename__ = "registrations"

    id = Column(UUID(as_uuid=True), primary_key=True)
    user_id = Column(UUID(as_uuid=True), nullable=True)
    name = Column(Text, nullable=True)
    email = Column(Text, nullable=True)
    college = Column(Text, nullable=True)
    github = Column(Text, nullable=True)
    degree = Column(Text, nullable=True)
    phone = Column(Text, nullable=True)
    gender = Column(Text, nullable=True)
    submitted_at = Column(TIMESTAMP, nullable=True)
    decision = Column(Text, nullable=True)
    score = Column(Float, nullable=True)
    matched_profile = Column(Text, nullable=True)
    matched_profile_note = Column(Text, nullable=True)
    skills = Column(ARRAY(Text), default=[])
    exact_email = Column(Boolean, nullable=True)
    exact_phone = Column(Boolean, nullable=True)
    exact_github = Column(Boolean, nullable=True)
    sim_name = Column(Float, nullable=True)
    sim_college = Column(Float, nullable=True)
    device_match = Column(Boolean, nullable=True)
    ip_subnet_match = Column(Boolean, nullable=True)
    face_scan_status = Column(Text, nullable=True)
    face_scan_score = Column(Float, nullable=True)
    face_scan_consented = Column(Boolean, nullable=True)
    face_scan_deleted_at = Column(TIMESTAMP, nullable=True)
    recommendation = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, nullable=True)
    updated_at = Column(TIMESTAMP, nullable=True)
