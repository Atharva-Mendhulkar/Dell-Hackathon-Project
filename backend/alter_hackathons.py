import asyncio
from sqlalchemy import create_engine, text
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL.replace("postgres://", "postgresql://"))

queries = [
    "ALTER TABLE hackathons RENAME COLUMN title TO name;",
    "ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS theme TEXT;",
    "ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS registration_start DATE;",
    "ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS registration_end DATE;",
    "ALTER TABLE hackathons RENAME COLUMN start_date TO event_start;",
    "ALTER TABLE hackathons RENAME COLUMN end_date TO event_end;",
    "ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS min_team_size INTEGER DEFAULT 1;",
    "ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS max_team_size INTEGER DEFAULT 4;"
]

with engine.begin() as conn:
    for query in queries:
        try:
            conn.execute(text(query))
            print("Executed:", query)
        except Exception as e:
            print("Error executing:", query)
            print("Details:", e)
