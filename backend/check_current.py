from app.deps import SessionLocal
from app.models.participant import Participant
from app.models.team import Team

db = SessionLocal()

print("--- Atharva ---")
p = db.query(Participant).filter(Participant.user_id == '4062e964-b2f0-4b68-a327-4269c5034130').first()
if p:
    print(f"p.team_id: {p.team_id}")
    t = db.query(Team).filter(Team.team_id == p.team_id).first()
    if t:
        print(f"Team: {t.name}, members: {t.member_ids}")
    else:
        print("Team not found")

print("--- Anushka ---")
p = db.query(Participant).filter(Participant.user_id == '3b49509b-cbfa-4754-81ac-4d979dabc1d8').first()
if p:
    print(f"p.team_id: {p.team_id}")
    t = db.query(Team).filter(Team.team_id == p.team_id).first()
    if t:
        print(f"Team: {t.name}, members: {t.member_ids}")
    else:
        print("Team not found")
