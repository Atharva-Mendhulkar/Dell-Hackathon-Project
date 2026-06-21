import asyncio
from sqlalchemy import create_engine, inspect
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL.replace("postgres://", "postgresql://"))
inspector = inspect(engine)
columns = inspector.get_columns("hackathons")
for c in columns:
    print(c["name"], str(c["type"]))
