from app.deps import SessionLocal
from app.models.participant import Participant

db = SessionLocal()

participants = db.query(Participant).limit(5).all()
for p in participants:
    print(f"Name: {p.name}")
    print(f"Skills: {p.declared_skills}")
    print(f"Vector: {p.skill_vector}")
    print("---")
