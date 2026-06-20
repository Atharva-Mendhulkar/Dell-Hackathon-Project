from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..deps import get_db
from ..models.evaluation import Evaluation
from ..models.idea_submission import IdeaSubmission

router = APIRouter()


class LeaderboardEntry(BaseModel):
    idea_id: str
    title: Optional[str] = None
    team_id: Optional[str] = None
    total_score: float
    num_evaluations: int
    avg_score: float


@router.get("/", response_model=List[LeaderboardEntry])
async def get_leaderboard(db: Session = Depends(get_db)):
    """
    Calculate final leaderboard by aggregating evaluation scores per idea submission,
    joined with idea_submissions to get team_id and title.
    Sorted by total_score descending.
    """
    results = (
        db.query(
            Evaluation.idea_id,
            func.sum(Evaluation.score).label("total_score"),
            func.count(Evaluation.evaluation_id).label("num_evaluations"),
            func.avg(Evaluation.score).label("avg_score"),
        )
        .group_by(Evaluation.idea_id)
        .order_by(func.sum(Evaluation.score).desc())
        .all()
    )

    leaderboard = []
    for row in results:
        # Look up the idea submission for title and team_id
        idea = db.query(IdeaSubmission).filter(
            IdeaSubmission.idea_id == row.idea_id
        ).first()

        leaderboard.append(
            LeaderboardEntry(
                idea_id=str(row.idea_id),
                title=idea.title if idea else None,
                team_id=str(idea.team_id) if idea and idea.team_id else None,
                total_score=float(row.total_score or 0),
                num_evaluations=int(row.num_evaluations or 0),
                avg_score=float(row.avg_score or 0),
            )
        )

    return leaderboard
