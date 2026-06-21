import os
import re

participants_path = "backend/app/routers/participants.py"
with open(participants_path, "r") as f:
    content = f.read()

# Remove everything after the return ResumeAnalysisResponse(...) in upload_resume
# which is around line 198
pattern = r"(    return ResumeAnalysisResponse\(\n        parsed_resume=parsed\.dict\(\),\n        skill_vector=vector\.to_dict\(\),\n        semantic_embedding=embedding,\n        breakdown=breakdown,\n    \)).*?(?=class BackgroundResumePayload)"
content = re.sub(pattern, r"\1\n\n", content, flags=re.DOTALL)

# Also remove the approve/reject endpoints from participants.py
pattern2 = r"(@router\.post\(\"/\{registration_id\}/approve\"\).*?)(?=from pydantic import BaseModel\n\nclass FaceScanRequest)"
content = re.sub(pattern2, "", content, flags=re.DOTALL)

with open(participants_path, "w") as f:
    f.write(content)

print("Patched participants.py")

organizer_path = "backend/app/routers/organizer.py"
with open(organizer_path, "r") as f:
    org_content = f.read()

# Add endpoints to organizer.py
new_code = """
import rapidfuzz
import uuid
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone

class SubmitRegistrationPayload(BaseModel):
    user_id: str
    name: str
    email: str
    college: str
    degree: str
    github: str
    gender: str
    phone: str
    skills: Optional[List[str]] = []

@router.post("/registrations/submit")
async def submit_registration(payload: SubmitRegistrationPayload, db: Session = Depends(get_db)):
    # 1. Fetch existing registrations
    existing = db.query(Registration).all()
    
    exact_email = False
    exact_github = False
    max_fuzzy_score = 0.0
    matched_profile = None

    for r in existing:
        if r.email and r.email.lower() == payload.email.lower():
            exact_email = True
            matched_profile = str(r.id)
        if r.github and r.github.lower() == payload.github.lower():
            exact_github = True
            matched_profile = str(r.id)

        name_sim = rapidfuzz.fuzz.token_sort_ratio(payload.name.lower(), (r.name or "").lower()) / 100.0
        college_sim = rapidfuzz.fuzz.token_sort_ratio(payload.college.lower(), (r.college or "").lower()) / 100.0

        combined_score = (name_sim * 0.6) + (college_sim * 0.4)
        if combined_score > max_fuzzy_score:
            max_fuzzy_score = combined_score
            if not exact_email and not exact_github:
                matched_profile = str(r.id)

    # 2. Determine Decision
    if exact_email or exact_github:
        final_score = 1.0
        decision = 'HARD_DUPLICATE'
    else:
        final_score = max_fuzzy_score
        if final_score < 0.70:
            decision = 'AUTO_APPROVED'
        elif 0.70 <= final_score < 0.85:
            decision = 'MANUAL_REVIEW'
        else:
            decision = 'POTENTIAL_DUPLICATE'

    reg_id = uuid.uuid4()
    
    # Check if they already have one
    existing_reg = db.query(Registration).filter(Registration.user_id == uuid.UUID(payload.user_id)).first()
    
    if existing_reg:
        reg_id = existing_reg.id
        existing_reg.decision = decision
        existing_reg.score = final_score
        existing_reg.skills = payload.skills
        db.commit()
    else:
        reg = Registration(
            id=reg_id,
            user_id=uuid.UUID(payload.user_id),
            name=payload.name,
            email=payload.email,
            college=payload.college,
            github=payload.github,
            skills=payload.skills,
            decision=decision,
            score=final_score,
            exact_email=exact_email,
            exact_github=exact_github,
            matched_profile=matched_profile,
            sim_name=max_fuzzy_score,
            sim_college=max_fuzzy_score,
            recommendation=f"Server generated decision: {decision}",
            submitted_at=datetime.now(timezone.utc)
        )
        db.add(reg)
        db.commit()

    if decision == 'AUTO_APPROVED':
        p = db.query(Participant).filter(Participant.id == payload.user_id).first()
        if p:
            p.name = payload.name
            p.college_name = payload.college
            p.github_url = payload.github
            p.declared_skills = payload.skills
            p.status = 'approved'
            db.commit()
        else:
            p = Participant(
                id=payload.user_id,
                name=payload.name,
                college_name=payload.college,
                github_url=payload.github,
                declared_skills=payload.skills,
            )
            db.add(p)
            db.commit()

    return {
        "status": "success",
        "registration_id": str(reg_id),
        "decision": decision,
        "score": final_score
    }

@router.post("/registrations/{registration_id}/approve")
async def approve_registration(registration_id: str, db: Session = Depends(get_db)):
    try:
        from app.routers.audit import log_event
    except ImportError:
        def log_event(*args, **kwargs): pass

    reg = db.query(Registration).filter(Registration.id == uuid.UUID(registration_id)).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")

    if reg.decision == 'AUTO_APPROVED':
        return {"status": "already_approved"}

    reg.decision = 'AUTO_APPROVED'
    db.commit()

    p = db.query(Participant).filter(Participant.id == str(reg.user_id)).first()
    if not p:
        p = Participant(
            id=str(reg.user_id),
            name=reg.name,
            college_name=reg.college,
            github_url=reg.github,
            declared_skills=reg.skills,
        )
        db.add(p)
        db.commit()

    try:
        log_event(
            action="registration_approved",
            actor="organizer",
            target=str(reg.id),
            details={"previous_decision": "MANUAL_REVIEW"},
            db=db
        )
    except Exception as e:
        print(f"Failed to log event: {e}")

    return {"status": "approved", "participant_created": True}

@router.post("/registrations/{registration_id}/reject")
async def reject_registration(registration_id: str, db: Session = Depends(get_db)):
    try:
        from app.routers.audit import log_event
    except ImportError:
        def log_event(*args, **kwargs): pass

    reg = db.query(Registration).filter(Registration.id == uuid.UUID(registration_id)).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")

    if reg.decision == 'REJECTED':
        return {"status": "already_rejected"}

    reg.decision = 'REJECTED'
    db.commit()

    try:
        log_event(
            action="registration_rejected",
            actor="organizer",
            target=str(reg.id),
            details={"reason": "Manual rejection"},
            db=db
        )
    except Exception as e:
        print(f"Failed to log event: {e}")

    return {"status": "rejected"}

"""

with open(organizer_path, "a") as f:
    f.write(new_code)

print("Patched organizer.py")
