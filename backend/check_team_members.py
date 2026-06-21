from app.deps import SessionLocal
from app.models.team import Team
from app.models.participant import Participant

db = SessionLocal()

teams = db.query(Team).order_by(Team.team_id.desc()).limit(1).all()
for t in teams:
    print(f"Team: {t.name}, ID: {t.team_id}, Members: {t.member_ids}")
    for mid in t.member_ids:
        p = db.query(Participant).filter(Participant.id == str(mid)).first()
        p2 = db.query(Participant).filter(Participant.user_id == str(mid)).first()
        print(f"  member_id: {mid} -> p by id: {p is not None}, p by user_id: {p2 is not None}")
