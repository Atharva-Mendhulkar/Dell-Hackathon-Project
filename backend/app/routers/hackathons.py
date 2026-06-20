from __future__ import annotations

import re
from typing import Any
from uuid import UUID

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.app.database import execute, fetch_all, fetch_one, json_param

router = APIRouter()


class HackathonCreate(BaseModel):
    name: str
    theme: str | None = None
    description: str | None = None
    registration_start: str | None = None
    registration_end: str | None = None
    event_start: str | None = None
    event_end: str | None = None
    min_team_size: int = 1
    max_team_size: int = 4


class ProblemStatementCreate(BaseModel):
    title: str
    domain: str | None = None
    difficulty: str | None = None
    description: str | None = None
    required_vector: dict[str, float] = Field(default_factory=dict)


class RubricCriterion(BaseModel):
    name: str
    weight: int
    score_min: int = 0
    score_max: int = 10


class ReviewerInvite(BaseModel):
    name: str | None = None
    email: str
    institution: str | None = None
    expertise_domains: list[str] = Field(default_factory=list)


def _slug(name: str) -> str:
    cleaned = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return cleaned or "hackathon"


def _audit(entity_type: str, entity_id: str | None, action: str, metadata: dict[str, Any]) -> None:
    execute(
        "SELECT public.append_audit_event(%s, %s::uuid, %s, NULL, %s::jsonb)",
        (entity_type, entity_id, action, json_param(metadata)),
    )


@router.get("/")
async def list_hackathons():
    return fetch_all("SELECT * FROM public.hackathons ORDER BY created_at DESC")


@router.post("/")
async def create_hackathon(payload: HackathonCreate):
    row = execute(
        """
        INSERT INTO public.hackathons (
            name, theme, description, registration_start, registration_end,
            event_start, event_end, min_team_size, max_team_size, public_slug
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING *
        """,
        (
            payload.name,
            payload.theme,
            payload.description,
            payload.registration_start,
            payload.registration_end,
            payload.event_start,
            payload.event_end,
            payload.min_team_size,
            payload.max_team_size,
            _slug(payload.name),
        ),
    )
    if not row:
        raise HTTPException(status_code=500, detail="Failed to create hackathon")
    _audit("hackathon", row["id"], "created", {"name": payload.name})
    return row


@router.get("/{hackathon_id}")
async def get_hackathon(hackathon_id: UUID):
    hackathon = fetch_one("SELECT * FROM public.hackathons WHERE id = %s", (str(hackathon_id),))
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found")
    hackathon["problem_statements"] = fetch_all(
        "SELECT * FROM public.problem_statements WHERE hackathon_id = %s ORDER BY created_at",
        (str(hackathon_id),),
    )
    hackathon["rubrics"] = fetch_all(
        "SELECT * FROM public.rubrics WHERE hackathon_id = %s ORDER BY display_order",
        (str(hackathon_id),),
    )
    hackathon["reviewers"] = fetch_all(
        "SELECT * FROM public.reviewers WHERE hackathon_id = %s ORDER BY created_at",
        (str(hackathon_id),),
    )
    return hackathon


@router.post("/{hackathon_id}/problem-statements")
async def add_problem_statement(hackathon_id: UUID, payload: ProblemStatementCreate):
    row = execute(
        """
        INSERT INTO public.problem_statements (
            hackathon_id, title, domain, difficulty, raw_text, description, required_vector
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s::jsonb)
        RETURNING *
        """,
        (
            str(hackathon_id),
            payload.title,
            payload.domain,
            payload.difficulty,
            payload.description,
            payload.description,
            json_param(payload.required_vector),
        ),
    )
    if not row:
        raise HTTPException(status_code=500, detail="Failed to add problem statement")
    _audit("problem_statement", row["id"], "created", {"hackathon_id": str(hackathon_id)})
    return row


@router.put("/{hackathon_id}/rubric")
async def replace_rubric(hackathon_id: UUID, criteria: list[RubricCriterion]):
    total = sum(item.weight for item in criteria)
    if total != 100:
        raise HTTPException(status_code=400, detail="Rubric weights must sum to 100")

    execute("DELETE FROM public.rubrics WHERE hackathon_id = %s", (str(hackathon_id),))
    rows = []
    for index, item in enumerate(criteria):
        row = execute(
            """
            INSERT INTO public.rubrics (
                hackathon_id, name, weight, score_min, score_max, display_order
            )
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (
                str(hackathon_id),
                item.name,
                item.weight,
                item.score_min,
                item.score_max,
                index,
            ),
        )
        if row:
            rows.append(row)
    _audit("hackathon", str(hackathon_id), "rubric_updated", {"criteria_count": len(rows)})
    return {"criteria": rows, "total_weight": total}


@router.post("/{hackathon_id}/team")
async def invite_reviewers(hackathon_id: UUID, reviewers: list[ReviewerInvite]):
    rows = []
    for reviewer in reviewers:
        row = execute(
            """
            INSERT INTO public.reviewers (
                hackathon_id, name, email, institution, expertise_domains, expertise_vector, status
            )
            VALUES (%s, %s, %s, %s, %s, %s::jsonb, 'invited')
            RETURNING *
            """,
            (
                str(hackathon_id),
                reviewer.name,
                reviewer.email,
                reviewer.institution,
                reviewer.expertise_domains,
                json_param({domain.lower(): 1 for domain in reviewer.expertise_domains}),
            ),
        )
        if row:
            rows.append(row)
    _audit("hackathon", str(hackathon_id), "reviewers_invited", {"count": len(rows)})
    return {"reviewers": rows}


@router.put("/{hackathon_id}/publish")
async def publish_hackathon(hackathon_id: UUID):
    row = execute(
        "UPDATE public.hackathons SET status = 'published', updated_at = NOW() WHERE id = %s RETURNING *",
        (str(hackathon_id),),
    )
    if not row:
        raise HTTPException(status_code=404, detail="Hackathon not found")
    _audit("hackathon", str(hackathon_id), "published", {})
    return row


def _overlap_score(submission: dict[str, Any], reviewer: dict[str, Any]) -> float:
    expertise = {item.lower() for item in reviewer.get("expertise_domains") or []}
    if not expertise:
        return 0.1
    haystack = " ".join(
        [
            submission.get("title") or "",
            submission.get("description") or "",
            " ".join(submission.get("tech_stack") or []),
        ]
    ).lower()
    matches = sum(1 for item in expertise if item.lower() in haystack)
    return min(1.0, matches / max(1, len(expertise)) + 0.15)


@router.post("/{hackathon_id}/assign-reviewers")
async def assign_reviewers(hackathon_id: UUID):
    submissions = fetch_all(
        "SELECT * FROM public.submissions WHERE hackathon_id = %s ORDER BY submitted_at",
        (str(hackathon_id),),
    )
    reviewers = fetch_all(
        "SELECT * FROM public.reviewers WHERE hackathon_id = %s AND status IN ('invited', 'active') ORDER BY created_at",
        (str(hackathon_id),),
    )
    if not submissions:
        raise HTTPException(status_code=400, detail="No submissions available for assignment")
    if not reviewers:
        raise HTTPException(status_code=400, detail="No reviewers available for assignment")

    workload = {reviewer["id"]: 0 for reviewer in reviewers}
    created = []
    for submission in submissions:
        ranked = sorted(
            reviewers,
            key=lambda reviewer: _overlap_score(submission, reviewer) - workload[reviewer["id"]] * 0.1,
            reverse=True,
        )
        reviewer = ranked[0]
        expertise_score = _overlap_score(submission, reviewer)
        workload_score = 1 / (1 + workload[reviewer["id"]])
        row = execute(
            """
            INSERT INTO public.assignments (
                hackathon_id, submission_id, reviewer_id, expertise_score,
                workload_score, conflict_flag, cost_breakdown, status
            )
            VALUES (%s, %s, %s, %s, %s, false, %s::jsonb, 'assigned')
            ON CONFLICT (submission_id, reviewer_id)
            DO UPDATE SET expertise_score = EXCLUDED.expertise_score
            RETURNING *
            """,
            (
                str(hackathon_id),
                submission["id"],
                reviewer["id"],
                expertise_score,
                workload_score,
                json_param(
                    {
                        "expertise": expertise_score,
                        "workload": workload_score,
                        "algorithm": "greedy_overlap_v1",
                    }
                ),
            ),
        )
        if row:
            created.append(row)
            workload[reviewer["id"]] += 1
            execute(
                "UPDATE public.submissions SET status = 'assigned' WHERE id = %s",
                (submission["id"],),
            )

    _audit("hackathon", str(hackathon_id), "reviewers_assigned", {"assignments": len(created)})
    return {
        "assignments": created,
        "summary": {
            "submissions": len(submissions),
            "reviewers": len(reviewers),
            "algorithm": "greedy_overlap_v1",
        },
    }


@router.get("/{hackathon_id}/results")
async def compute_results(hackathon_id: UUID):
    rows = fetch_all(
        """
        SELECT
            s.id AS submission_id,
            s.title,
            s.team_id,
            AVG(e.weighted_score) AS final_score,
            COUNT(e.id) AS review_count,
            CASE
                WHEN COUNT(e.id) > 1 THEN GREATEST(0, 1 - STDDEV_POP(e.weighted_score) / 10)
                ELSE 0.5
            END AS confidence_score
        FROM public.submissions s
        LEFT JOIN public.evaluations e ON e.submission_id = s.id
        WHERE s.hackathon_id = %s
        GROUP BY s.id, s.title, s.team_id
        ORDER BY final_score DESC NULLS LAST, s.title ASC
        """,
        (str(hackathon_id),),
    )

    ranked = []
    for index, row in enumerate(rows, start=1):
        result = {
            **row,
            "rank": index,
            "final_score": float(row["final_score"] or 0),
            "confidence_score": float(row["confidence_score"] or 0),
        }
        ranked.append(result)

    _audit("hackathon", str(hackathon_id), "results_computed", {"result_count": len(ranked)})
    return {"results": ranked}
