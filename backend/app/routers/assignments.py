from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter

from backend.app.database import fetch_all
from backend.app.routers.hackathons import assign_reviewers

router = APIRouter()


@router.get("/")
async def list_assignments(hackathon_id: UUID | None = None):
    if hackathon_id:
        return fetch_all(
            "SELECT * FROM public.assignments WHERE hackathon_id = %s ORDER BY created_at DESC",
            (str(hackathon_id),),
        )
    return fetch_all("SELECT * FROM public.assignments ORDER BY created_at DESC LIMIT 100")


@router.post("/{hackathon_id}/run")
async def run_assignment(hackathon_id: UUID):
    return await assign_reviewers(hackathon_id)
