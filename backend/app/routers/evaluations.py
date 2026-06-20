from __future__ import annotations

from typing import Any
from uuid import UUID

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.app.database import execute, fetch_all, fetch_one, json_param

router = APIRouter()


class EvaluationCreate(BaseModel):
    hackathon_id: UUID
    submission_id: UUID
    reviewer_id: UUID
    assignment_id: UUID | None = None
    scores: dict[str, float] = Field(default_factory=dict)
    feedback: str | None = None


def _audit(entity_type: str, entity_id: str | None, action: str, metadata: dict[str, Any]) -> None:
    execute(
        "SELECT public.append_audit_event(%s, %s::uuid, %s, NULL, %s::jsonb)",
        (entity_type, entity_id, action, json_param(metadata)),
    )


def _weighted_score(hackathon_id: str, scores: dict[str, float]) -> float:
    rubrics = fetch_all(
        "SELECT name, weight FROM public.rubrics WHERE hackathon_id = %s ORDER BY display_order",
        (hackathon_id,),
    )
    if not scores:
        return 0.0
    if not rubrics:
        return sum(scores.values()) / len(scores)

    total = 0.0
    matched_weight = 0
    lower_scores = {key.lower(): value for key, value in scores.items()}
    for rubric in rubrics:
        rubric_name = rubric["name"].lower()
        value = lower_scores.get(rubric_name)
        if value is None:
            for score_name, score_value in lower_scores.items():
                if rubric_name in score_name or score_name in rubric_name:
                    value = score_value
                    break
        if value is not None:
            weight = int(rubric["weight"])
            total += float(value) * weight
            matched_weight += weight

    if matched_weight == 0:
        return sum(scores.values()) / len(scores)
    return total / matched_weight


@router.get("/")
async def list_evaluations(hackathon_id: UUID | None = None):
    if hackathon_id:
        return fetch_all(
            "SELECT * FROM public.evaluations WHERE hackathon_id = %s ORDER BY submitted_at DESC",
            (str(hackathon_id),),
        )
    return fetch_all("SELECT * FROM public.evaluations ORDER BY submitted_at DESC LIMIT 100")


@router.post("/")
async def submit_evaluation(payload: EvaluationCreate):
    assignment_id = str(payload.assignment_id) if payload.assignment_id else None
    if assignment_id is None:
        assignment = fetch_one(
            """
            SELECT id FROM public.assignments
            WHERE submission_id = %s AND reviewer_id = %s
            """,
            (str(payload.submission_id), str(payload.reviewer_id)),
        )
        assignment_id = assignment["id"] if assignment else None

    weighted_score = _weighted_score(str(payload.hackathon_id), payload.scores)
    row = execute(
        """
        INSERT INTO public.evaluations (
            hackathon_id, assignment_id, submission_id, reviewer_id,
            scores, weighted_score, feedback
        )
        VALUES (%s, %s, %s, %s, %s::jsonb, %s, %s)
        ON CONFLICT (submission_id, reviewer_id)
        DO UPDATE SET
            scores = EXCLUDED.scores,
            weighted_score = EXCLUDED.weighted_score,
            feedback = EXCLUDED.feedback,
            submitted_at = NOW()
        RETURNING *
        """,
        (
            str(payload.hackathon_id),
            assignment_id,
            str(payload.submission_id),
            str(payload.reviewer_id),
            json_param(payload.scores),
            weighted_score,
            payload.feedback,
        ),
    )
    if not row:
        raise HTTPException(status_code=500, detail="Failed to save evaluation")

    if assignment_id:
        execute(
            "UPDATE public.assignments SET status = 'completed' WHERE id = %s",
            (assignment_id,),
        )
    execute(
        "UPDATE public.submissions SET status = 'evaluated' WHERE id = %s",
        (str(payload.submission_id),),
    )
    _audit(
        "evaluation",
        row["id"],
        "submitted",
        {
            "hackathon_id": str(payload.hackathon_id),
            "submission_id": str(payload.submission_id),
            "weighted_score": weighted_score,
        },
    )
    return row
