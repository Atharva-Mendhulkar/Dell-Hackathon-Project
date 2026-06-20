from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.app.database import execute, fetch_all, json_param

router = APIRouter()


class ReviewerCreate(BaseModel):
    hackathon_id: UUID
    name: str | None = None
    email: str
    institution: str | None = None
    expertise_domains: list[str] = Field(default_factory=list)
    availability: int = 8


@router.get("/")
async def list_reviewers(hackathon_id: UUID | None = None):
    if hackathon_id:
        return fetch_all(
            "SELECT * FROM public.reviewers WHERE hackathon_id = %s ORDER BY created_at DESC",
            (str(hackathon_id),),
        )
    return fetch_all("SELECT * FROM public.reviewers ORDER BY created_at DESC LIMIT 100")


@router.post("/")
async def create_reviewer(payload: ReviewerCreate):
    row = execute(
        """
        INSERT INTO public.reviewers (
            hackathon_id, name, email, institution, expertise_domains,
            expertise_vector, availability, status
        )
        VALUES (%s, %s, %s, %s, %s, %s::jsonb, %s, 'active')
        RETURNING *
        """,
        (
            str(payload.hackathon_id),
            payload.name,
            payload.email,
            payload.institution,
            payload.expertise_domains,
            json_param({domain.lower(): 1 for domain in payload.expertise_domains}),
            payload.availability,
        ),
    )
    if not row:
        raise HTTPException(status_code=500, detail="Failed to create reviewer")
    return row
