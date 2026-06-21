import uuid
from datetime import datetime, timezone, timedelta
from app.deps import SessionLocal
from app.models.hackathon import Hackathon
from app.models.team import Team
from app.models.idea_submission import IdeaSubmission
from app.models.assignment import Assignment
from app.models.reviewer import Reviewer

db = SessionLocal()

# 1. Create a new Hackathon
hackathon_id = uuid.uuid4()
new_hackathon = Hackathon(
    id=hackathon_id,
    name="End-to-End Test Hackathon",
    theme="Testing the full reviewer pipeline",
    description="A mock hackathon created to test assignments and evaluations.",
    registration_start=datetime.now(timezone.utc).date() - timedelta(days=5),
    registration_end=datetime.now(timezone.utc).date() + timedelta(days=5),
    event_start=datetime.now(timezone.utc).date() + timedelta(days=10),
    event_end=datetime.now(timezone.utc).date() + timedelta(days=12),
    min_team_size=1,
    max_team_size=4
)
db.add(new_hackathon)
db.commit()

# 2. Find or update Reviewer
target_email = "mendhu36@outlook.com"
reviewer = db.query(Reviewer).filter(Reviewer.email == target_email).first()

if not reviewer:
    # Try finding Atharva
    reviewer = db.query(Reviewer).filter(Reviewer.name.ilike("%atharva%")).first()
    if reviewer:
        reviewer.email = target_email
        db.commit()
    else:
        # Create new reviewer if not found at all
        reviewer = Reviewer(
            reviewer_id=uuid.uuid4(),
            name="Atharva",
            email=target_email,
            max_load=5
        )
        db.add(reviewer)
        db.commit()

print(f"Using Reviewer: {reviewer.name} (ID: {reviewer.reviewer_id}, Email: {reviewer.email})")

# 3. Create Team and Idea
team_id = uuid.uuid4()
idea_id = uuid.uuid4()

new_team = Team(
    team_id=team_id,
    name="Team FullStack",
    member_ids=[],
    coverage_score=95.0,
    diversity_score=90.0,
    formation_confidence=99.0
)
db.add(new_team)

new_idea = IdeaSubmission(
    idea_id=idea_id,
    team_id=team_id,
    ps_id=None,
    title="Automated Evaluator Bot",
    description="An AI bot that automatically evaluates hackathon submissions.",
    status="submitted",
    idea_vector=[],
    submitted_at=datetime.now(timezone.utc)
)
db.add(new_idea)
db.commit()

# 4. Create Assignment
assignment_id = uuid.uuid4()
new_assignment = Assignment(
    assignment_id=assignment_id,
    reviewer_id=reviewer.reviewer_id,
    idea_id=idea_id,
    hackathon_id=str(hackathon_id),
    compatibility_score=98.5,
    explanation={"reason": "Explicit assignment for end-to-end testing."},
    created_at=datetime.now(timezone.utc)
)
db.add(new_assignment)
db.commit()

print(f"Successfully created Hackathon '{new_hackathon.name}' (ID: {hackathon_id})")
print(f"Created Team '{new_team.name}' with Idea '{new_idea.title}'")
print(f"Assigned to Reviewer {reviewer.email}")
