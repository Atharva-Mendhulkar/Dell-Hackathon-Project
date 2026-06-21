from app.core.celery_app import celery_app
from app.deps import SessionLocal
from app.models.evaluation import Evaluation
from app.models.idea_submission import IdeaSubmission
from app.models.team import Team

@celery_app.task(name="compute_results_task")
def compute_results_task(hackathon_id: str):
    """
    Background task to compute global average scores and
    generate NLG feedback for all teams.
    """
    from app.services.ai.pipelines.feedback.nlg import generate_team_feedback
    
    db = SessionLocal()
    try:
        evals = db.query(Evaluation).all()
        if not evals:
            return {"status": "success", "message": "No evaluations found."}
            
        global_avg = sum(e.score for e in evals if e.score) / len(evals)
        
        ideas = db.query(IdeaSubmission).all()
        count = 0
        
        for idea in ideas:
            idea_evals = [e for e in evals if str(e.idea_id) == str(idea.idea_id)]
            if not idea_evals:
                continue
                
            team = db.query(Team).filter(Team.team_id == idea.team_id).first()
            team_name = team.name if team else "Unknown Team"
            
            eval_data = [{"score": e.score, "feedback": e.feedback} for e in idea_evals if e.score is not None]
            
            try:
                feedback_json = generate_team_feedback(
                    team_name=team_name,
                    project_title=idea.title or "Untitled",
                    project_description=idea.description or "No description",
                    evaluations=eval_data,
                    global_average_score=global_avg
                )
                idea.ai_feedback = feedback_json.get("feedback_text", "Could not generate feedback.")
                count += 1
            except Exception as e:
                print(f"Failed to generate feedback for {idea.idea_id}: {e}")
                
        db.commit()
        return {"status": "success", "teams_processed": count}
    except Exception as e:
        db.rollback()
        return {"status": "failed", "error": str(e)}
    finally:
        db.close()
