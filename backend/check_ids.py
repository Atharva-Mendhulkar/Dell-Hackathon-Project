from app.deps import SessionLocal
from app.models.participant import Participant

db = SessionLocal()
ids = ['bec15dad-ed23-4f69-b4a6-38176f708180', '7f0b26d2-8596-4edd-a406-266a066bc5ed', 'bbd84adf-bf7d-44b8-91d2-5f4cdf993529', '450d305c-4042-4bef-bb2a-90169b01fb88']
for i in ids:
    p = db.query(Participant).filter(Participant.id == i).first()
    print(f"ID {i}: {p is not None}")
