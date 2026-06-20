from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.app.database import execute, fetch_all

router = APIRouter()


class SubmissionCreate(BaseModel):
    hackathon_id: UUID
    team_id: UUID
    title: str
    description: str | None = None
    tech_stack: list[str] = Field(default_factory=list)
    github_repo: str | None = None
    demo_url: str | None = None
    pitch_url: str | None = None


@router.get("/")
async def list_submissions(hackathon_id: UUID | None = None):
    if hackathon_id:
        return fetch_all(
            "SELECT * FROM public.submissions WHERE hackathon_id = %s ORDER BY submitted_at DESC",
            (str(hackathon_id),),
        )
    return fetch_all("SELECT * FROM public.submissions ORDER BY submitted_at DESC LIMIT 100")


@router.post("/")
async def create_submission(payload: SubmissionCreate):
    row = execute(
        """
        INSERT INTO public.submissions (
            hackathon_id, team_id, title, description, tech_stack,
            github_repo, demo_url, pitch_url, status
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'submitted')
        RETURNING *
        """,
        (
            str(payload.hackathon_id),
            str(payload.team_id),
            payload.title,
            payload.description,
            payload.tech_stack,
            payload.github_repo,
            payload.demo_url,
            payload.pitch_url,
        ),
    )
    if not row:
        raise HTTPException(status_code=500, detail="Failed to create submission")
    execute(
        "SELECT public.append_audit_event('submission', %s::uuid, 'submitted', NULL, %s::jsonb)",
        (row["id"], '{"source":"api"}'),
    )
    return row
