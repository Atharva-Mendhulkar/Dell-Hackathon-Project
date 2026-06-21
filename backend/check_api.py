from app.deps import SessionLocal
from app.routers.teams import get_valid_team_member_ids, team_to_out
from app.models.team import Team

db = SessionLocal()
team = db.query(Team).order_by(Team.team_id.desc()).first()
print(f"Original member_ids: {team.member_ids}")
valid_ids = get_valid_team_member_ids(db, team)
print(f"Valid member_ids: {valid_ids}")
out = team_to_out(team, 4, db)
print(f"TeamOut member_ids: {out.member_ids}")
