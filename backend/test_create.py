from app.deps import SessionLocal
from app.routers.teams import create_team, TeamCreate
from app.models.team import Team

db = SessionLocal()
data = TeamCreate(name="Test Team API", member_ids=["3b49509b-cbfa-4754-81ac-4d979dabc1d8", "02f761ae-f2a5-425d-a1ac-c462d338cd5e"])

try:
    import asyncio
    out = asyncio.run(create_team(data, db))
    print(f"Created: {out.team_id}")
    from app.models.participant import Participant
    p = db.query(Participant).filter(Participant.user_id == "3b49509b-cbfa-4754-81ac-4d979dabc1d8").first()
    print(f"p.team_id is now: {p.team_id}")
except Exception as e:
    import traceback
    traceback.print_exc()
