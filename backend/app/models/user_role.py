from sqlalchemy import Column, Text
from sqlalchemy.dialects.postgresql import UUID

from .base import Base


class UserRole(Base):
    __tablename__ = "user_roles"

    user_id = Column(UUID(as_uuid=True), primary_key=True)
    role = Column(Text, nullable=True)
