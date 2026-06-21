from sqlalchemy import Column, Text, String, Enum
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
from datetime import datetime, timezone
import enum

from .base import Base

class InviteDirection(str, enum.Enum):
    LEADER_TO_PARTICIPANT = "leader_to_participant"
    PARTICIPANT_TO_LEADER = "participant_to_leader"

class InviteStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    CANCELLED = "cancelled"

class Invite(Base):
    __tablename__ = "invites"

    id = Column(UUID(as_uuid=True), primary_key=True)
    team_id = Column(UUID(as_uuid=True), nullable=False)
    participant_id = Column(Text, nullable=False)
    direction = Column(Enum(InviteDirection), nullable=False)
    initiated_by_id = Column(Text, nullable=False)
    status = Column(Enum(InviteStatus), default=InviteStatus.PENDING, nullable=False)
    created_at = Column(TIMESTAMP, default=lambda: datetime.now(timezone.utc), nullable=False)
    responded_at = Column(TIMESTAMP, nullable=True)
