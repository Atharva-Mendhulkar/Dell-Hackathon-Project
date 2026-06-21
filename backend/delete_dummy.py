from sqlalchemy import create_engine, text
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL.replace("postgres://", "postgresql://"))

with engine.begin() as conn:
    result = conn.execute(text("DELETE FROM hackathons WHERE name = 'Bias Test';"))
    print(f"Deleted {result.rowcount} 'Bias Test' hackathons")
