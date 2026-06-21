import uuid
from app.core.celery_app import celery_app
from app.deps import SessionLocal
from app.models.participant import Participant
from app.models.problem_statement import ProblemStatement
from app.models.team import Team

@celery_app.task(name="team_formation_task")
def team_formation_task():
    """
    Background task to form teams using AI coverage-driven optimization.
    """
    from app.services.ai.pipelines.team_formation.formation import form_teams
    from app.services.ai.core.schemas import Participant as ParticipantSchema, PSRequirement, SkillVector

    db = SessionLocal()
    try:
        # 1. Fetch unassigned participants
        db_participants = db.query(Participant).filter(Participant.team_id == None).all()
        if not db_participants:
            return {"status": "success", "message": "No unassigned participants found."}

        schema_participants = []
        for p in db_participants:
            schema_participants.append(
                ParticipantSchema(
                    id=str(p.id),
                    name=p.name or "Unknown",
                    college_name=p.college_name or "Unknown",
                    github_url=p.github_url or "",
                    skills=p.declared_skills or [],
                    skill_vector=SkillVector.from_dict(p.skill_vector or {})
                )
            )

        # 2. Fetch problem statements
        db_ps = db.query(ProblemStatement).all()
        if not db_ps:
            return {"status": "success", "message": "No problem statements found."}
            
        schema_ps = []
        for ps in db_ps:
            schema_ps.append(
                PSRequirement(
                    ps_id=str(ps.ps_id),
                    title=ps.title or "Untitled",
                    raw_text=ps.raw_text or "",
                    required_vector=SkillVector.from_dict(ps.required_vector or {}),
                    team_size=ps.max_size or 4
                )
            )

        # 3. Form teams
        result = form_teams(schema_participants, schema_ps)
        
        formed_teams = result.get("teams", [])

        # 4. Save teams to DB
        for t in formed_teams:
            team_id = uuid.uuid4()
            member_ids = [m for m in getattr(t, "member_ids", [])] if not hasattr(t, "members") else [m.id for m in getattr(t, "members", [])]
            if not member_ids and hasattr(t, "members"):
                member_ids = [m.id for m in t.members]
            elif not member_ids:
                member_ids = t.member_ids
            
            new_team = Team(
                team_id=team_id,
                name=f"{t.name}",
                member_ids=member_ids,
                coverage_score=getattr(t, "coverage_score", 0.0),
                diversity_score=getattr(t, "diversity_score", 0.0),
                formation_confidence=getattr(t, "formation_confidence", 0.0)
            )
            db.add(new_team)
            
            # Update participants
            for p_id in member_ids:
                db_p = db.query(Participant).filter(Participant.id == p_id).first()
                if db_p:
                    db_p.team_id = team_id
                    
        db.commit()
        return {"status": "success", "teams_formed": len(formed_teams)}
        
    except Exception as e:
        db.rollback()
        return {"status": "failed", "error": str(e)}
    finally:
        db.close()
