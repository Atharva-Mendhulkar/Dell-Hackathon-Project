from sqlalchemy import Column, String, Text, Date, UUID
from .base import Base

class Hackathon(Base):
    __tablename__ = "hackathons"
    id = Column(UUID(as_uuid=True), primary_key=True)
    title = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
