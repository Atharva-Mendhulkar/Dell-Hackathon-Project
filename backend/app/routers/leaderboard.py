from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter

from backend.app.routers.hackathons import compute_results

router = APIRouter()


@router.get("/{hackathon_id}")
async def leaderboard(hackathon_id: UUID):
    return await compute_results(hackathon_id)
