import asyncio

from app.core.celery_app import celery_app
from app.deps import SessionLocal
from app.models.participant import Participant
from app.models.reviewer import Reviewer


@celery_app.task(name="parse_participant_resume")
def parse_participant_resume(participant_id: str, resume_text: str):
    """
    Background task: parse a participant's resume text via LLM,
    then update their skill_vector, declared_skills, and vectorization_status.
    """
    from app.services.ai.pipelines.resume_rag.parser import parse_and_vectorize_batch

    db = SessionLocal()
    try:
        results = asyncio.run(
            parse_and_vectorize_batch([resume_text], max_concurrency=1)
        )
        parsed, vector, embedding, breakdown = results[0]

        participant = db.query(Participant).filter(Participant.id == participant_id).first()
        if not participant:
            return {"status": "failed", "error": f"Participant {participant_id} not found"}

        participant.skill_vector = vector.to_dict()
        participant.declared_skills = parsed.raw_skills if hasattr(parsed, 'raw_skills') else []
        participant.vectorization_status = "completed"

        db.commit()
        return {"status": "success", "participant_id": participant_id}

    except Exception as e:
        # Mark as failed so the frontend can show a retry option
        try:
            participant = db.query(Participant).filter(Participant.id == participant_id).first()
            if participant:
                participant.vectorization_status = "failed"
                db.commit()
        except Exception:
            db.rollback()

        return {"status": "failed", "error": str(e)}
    finally:
        db.close()


@celery_app.task(name="parse_reviewer_resume")
def parse_reviewer_resume(reviewer_id: str, resume_text: str):
    """
    Background task: parse a reviewer's resume text via LLM,
    then update their skill_vector, skills_json, and primary_specialization.
    """
    from app.services.ai.pipelines.resume_rag.parser import parse_and_vectorize_batch

    db = SessionLocal()
    try:
        results = asyncio.run(
            parse_and_vectorize_batch([resume_text], max_concurrency=1)
        )
        parsed, vector, embedding, breakdown = results[0]

        reviewer = db.query(Reviewer).filter(Reviewer.reviewer_id == reviewer_id).first()
        if not reviewer:
            return {"status": "failed", "error": f"Reviewer {reviewer_id} not found"}

        reviewer.skill_vector = vector.to_dict()
        reviewer.skills_json = parsed.dict() if hasattr(parsed, 'dict') else {}

        # Auto-detect primary specialization from highest-scoring skill category
        vector_dict = vector.to_dict()
        if vector_dict:
            primary = max(vector_dict, key=vector_dict.get)
            reviewer.primary_specialization = primary

        db.commit()
        return {"status": "success", "reviewer_id": reviewer_id}

    except Exception as e:
        return {"status": "failed", "error": str(e)}
    finally:
        db.close()
