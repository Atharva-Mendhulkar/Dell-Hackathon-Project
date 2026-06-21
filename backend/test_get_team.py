from app.deps import SessionLocal
from app.models.team import Team

db = SessionLocal()
team_id_str = "97715a89-695a-4d69-b674-2963d55f5dc2"
t = db.query(Team).filter(Team.team_id == team_id_str).first()
if not t:
    print("Team not found")
else:
    print(f"Team found: {t.name}")
