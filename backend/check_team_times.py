from app.deps import SessionLocal
from app.models.team import Team

db = SessionLocal()
teams = db.query(Team).order_by(Team.team_id.desc()).limit(10).all()
for t in teams:
    print(f"Team: {t.team_id}, Name: {t.name}")
