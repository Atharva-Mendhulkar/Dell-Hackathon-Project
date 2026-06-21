from app.deps import SessionLocal
from app.models.participant import Participant
from app.models.team import Team

db = SessionLocal()

participants = db.query(Participant).all()
for p in participants:
    print(f"Name: {p.name}, ID: {p.id}, user_id: {p.user_id}, team_id: {p.team_id}")

