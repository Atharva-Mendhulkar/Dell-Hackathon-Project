from sqlalchemy import create_engine, text
from app.core.config import settings
import uuid

engine = create_engine(settings.DATABASE_URL.replace("postgres://", "postgresql://"))

with engine.begin() as conn:
    # Delete all existing hackathons
    conn.execute(text("DELETE FROM hackathons;"))
    print("Deleted all existing hackathons")

    # Insert genuine hackathons
    id1 = str(uuid.uuid4())
    conn.execute(text(f"""
        INSERT INTO hackathons (id, name, theme, description, registration_start, registration_end, event_start, event_end, min_team_size, max_team_size)
        VALUES ('{id1}', 'Dell FutureMinds 2026', 'AI', 'AI Hackathon', '2026-06-01', '2026-06-30', '2026-07-01', '2026-07-05', 1, 4);
    """))

    id2 = str(uuid.uuid4())
    conn.execute(text(f"""
        INSERT INTO hackathons (id, name, theme, description, registration_start, registration_end, event_start, event_end, min_team_size, max_team_size)
        VALUES ('{id2}', 'Super AI Hackathon', 'AI', 'Build the next generation AI application.', '2026-06-15', '2026-07-15', '2026-07-20', '2026-07-25', 1, 4);
    """))
    print("Inserted genuine hackathons!")
