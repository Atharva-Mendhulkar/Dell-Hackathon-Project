from sqlalchemy import Column, Text, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB

from .base import Base


class ProblemStatement(Base):
    __tablename__ = "problem_statements"

    ps_id = Column(UUID(as_uuid=True), primary_key=True)
    title = Column(Text, nullable=True)
    raw_text = Column(Text, nullable=True)
    required_vector = Column(JSONB, nullable=True)
    min_size = Column(Integer, nullable=True)
    max_size = Column(Integer, nullable=True)
