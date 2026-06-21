from app.deps import SessionLocal
from app.models.participant import Participant
from app.models.team import Team

db = SessionLocal()

participants = db.query(Participant).limit(5).all()
for p in participants:
    print(f"Participant: {p.name}, ID: {p.id}, user_id: {p.user_id}, Team ID: {p.team_id}")

teams = db.query(Team).limit(5).all()
for t in teams:
    print(f"Team: {t.name}, ID: {t.team_id}, Members: {t.member_ids}")

