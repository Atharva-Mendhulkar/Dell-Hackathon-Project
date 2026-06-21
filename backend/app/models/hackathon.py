from sqlalchemy import Column, String, Text, Date, Integer, UUID
from .base import Base


class Hackathon(Base):
    __tablename__ = "hackathons"

    id = Column(UUID(as_uuid=True), primary_key=True)

    name = Column(String, nullable=False)
    theme = Column(String, nullable=True)

    description = Column(Text, nullable=True)

    registration_start = Column(Date, nullable=True)
    registration_end = Column(Date, nullable=True)

    event_start = Column(Date, nullable=True)
    event_end = Column(Date, nullable=True)

    min_team_size = Column(Integer, default=1)
    max_team_size = Column(Integer, default=4)