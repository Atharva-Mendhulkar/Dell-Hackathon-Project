from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.app.database import execute, fetch_all
from participant_ai.core.schemas import ParsedResume, Participant, PSRequirement, SkillVector
from participant_ai.pipelines.team_formation.formation import coverage_score, form_teams, team_vector

router = APIRouter()


class TeamCreate(BaseModel):
    hackathon_id: UUID
    name: str
    description: str | None = None
    problem_statement_id: UUID | None = None
    member_ids: list[UUID] = Field(default_factory=list)


class TeamFormationRequest(BaseModel):
    unassigned_participants: list[Participant]
    problem_statements: list[PSRequirement]


@router.get("/")
async def list_teams(hackathon_id: UUID | None = None):
    if hackathon_id:
        return fetch_all(
            "SELECT * FROM public.teams WHERE hackathon_id = %s ORDER BY created_at DESC",
            (str(hackathon_id),),
        )
    return fetch_all("SELECT * FROM public.teams ORDER BY created_at DESC LIMIT 100")


@router.post("/")
async def create_team(payload: TeamCreate):
    row = execute(
        """
        INSERT INTO public.teams (
            hackathon_id, name, description, problem_statement_id, member_ids, status
        )
        VALUES (%s, %s, %s, %s, %s::uuid[], 'forming')
        RETURNING *
        """,
        (
            str(payload.hackathon_id),
            payload.name,
            payload.description,
            str(payload.problem_statement_id) if payload.problem_statement_id else None,
            [str(member_id) for member_id in payload.member_ids],
        ),
    )
    if not row:
        raise HTTPException(status_code=500, detail="Failed to create team")
    for member_id in payload.member_ids:
        execute(
            "UPDATE public.participants SET team_id = %s, status = 'teamed' WHERE id = %s",
            (row["team_id"], str(member_id)),
        )
    return row


@router.post("/form")
async def form_teams_from_payload(request: TeamFormationRequest):
    result = form_teams(request.unassigned_participants, request.problem_statements)
    return {
        "status": "formation_complete",
        "teams": [team.model_dump() for team in result["teams"]],
        "unassigned": result["unassigned"],
        "log": result["log"],
    }


@router.post("/auto-form/{hackathon_id}")
async def auto_form_from_database(hackathon_id: UUID):
    participant_rows = fetch_all(
        """
        SELECT * FROM public.participants
        WHERE hackathon_id = %s
          AND team_id IS NULL
          AND status IN ('approved', 'registered')
        ORDER BY created_at
        """,
        (str(hackathon_id),),
    )
    ps_rows = fetch_all(
        "SELECT * FROM public.problem_statements WHERE hackathon_id = %s ORDER BY created_at",
        (str(hackathon_id),),
    )
    if not participant_rows:
        raise HTTPException(status_code=400, detail="No unassigned participants available")
    if not ps_rows:
        raise HTTPException(status_code=400, detail="No problem statements available")

    participants = [
        Participant(
            id=row["id"],
            parsed_resume=ParsedResume(
                name=row.get("name"),
                college_name=row.get("college_name"),
                github_url=row.get("github_url"),
                raw_skills=row.get("declared_skills") or [],
            ),
            skill_vector=SkillVector.from_dict(row.get("skill_vector") or {}),
            semantic_embedding=None,
        )
        for row in participant_rows
    ]
    requirements = [
        PSRequirement(
            ps_id=row["id"],
            title=row["title"],
            raw_text=row.get("raw_text") or row.get("description") or "",
            required_vector=SkillVector.from_dict(row.get("required_vector") or {}),
            team_size=4,
        )
        for row in ps_rows
    ]

    formation = form_teams(participants, requirements)
    participants_by_id = {participant.id: participant for participant in participants}
    created = []

    for team in formation["teams"]:
        members = [participants_by_id[member_id] for member_id in team.member_ids if member_id in participants_by_id]
        req = next((item for item in requirements if f"Team {item.title}" == team.name), requirements[0])
        score = coverage_score(team_vector([member.skill_vector for member in members]), req.required_vector)
        row = execute(
            """
            INSERT INTO public.teams (
                hackathon_id, name, member_ids, coverage_score, status
            )
            VALUES (%s, %s, %s::uuid[], %s, %s)
            RETURNING *
            """,
            (
                str(hackathon_id),
                team.name,
                team.member_ids,
                score,
                "ready" if score >= 0.85 else "forming",
            ),
        )
        if row:
            created.append(row)
            for member_id in team.member_ids:
                execute(
                    "UPDATE public.participants SET team_id = %s, status = 'teamed' WHERE id = %s",
                    (row["team_id"], member_id),
                )

    execute(
        "SELECT public.append_audit_event('hackathon', %s::uuid, 'teams_auto_formed', NULL, %s::jsonb)",
        (str(hackathon_id), f'{{"teams":{len(created)}}}'),
    )
    return {"teams": created, "unassigned": formation["unassigned"], "log": formation["log"]}
