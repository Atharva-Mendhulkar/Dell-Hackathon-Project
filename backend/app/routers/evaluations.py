import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..deps import get_db
from ..models.evaluation import Evaluation

router = APIRouter()


# --------------- Pydantic schemas ---------------

class EvaluationCreate(BaseModel):
    assignment_id: Optional[str] = None
    reviewer_id: str
    idea_id: str
    score: float
    feedback: Optional[str] = None


class EvaluationOut(BaseModel):
    evaluation_id: str
    assignment_id: Optional[str] = None
    reviewer_id: Optional[str] = None
    idea_id: Optional[str] = None
    score: Optional[float] = None
    feedback: Optional[str] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


# --------------- CRUD endpoints ---------------

@router.post("/evaluate", response_model=EvaluationOut)
async def create_evaluation(data: EvaluationCreate, db: Session = Depends(get_db)):
    """Store evaluation scores and feedback."""
    evaluation = Evaluation(
        evaluation_id=uuid.uuid4(),
        assignment_id=data.assignment_id,
        reviewer_id=data.reviewer_id,
        idea_id=data.idea_id,
        score=data.score,
        feedback=data.feedback,
        created_at=datetime.now(timezone.utc),
    )
    db.add(evaluation)
    db.commit()
    db.refresh(evaluation)
    return evaluation


@router.get("/", response_model=List[EvaluationOut])
async def list_evaluations(db: Session = Depends(get_db)):
    """List all evaluations."""
    return db.query(Evaluation).all()


@router.get("/idea/{idea_id}", response_model=List[EvaluationOut])
async def get_evaluations_by_idea(idea_id: str, db: Session = Depends(get_db)):
    """Get all evaluations for a specific idea submission."""
    return db.query(Evaluation).filter(Evaluation.idea_id == idea_id).all()


@router.get("/reviewer/{reviewer_id}", response_model=List[EvaluationOut])
async def get_evaluations_by_reviewer(reviewer_id: str, db: Session = Depends(get_db)):
    """Get all evaluations by a specific reviewer."""
    return db.query(Evaluation).filter(Evaluation.reviewer_id == reviewer_id).all()


@router.get("/{evaluation_id}", response_model=EvaluationOut)
async def get_evaluation(evaluation_id: str, db: Session = Depends(get_db)):
    """Get a single evaluation."""
    e = db.query(Evaluation).filter(Evaluation.evaluation_id == evaluation_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return e
