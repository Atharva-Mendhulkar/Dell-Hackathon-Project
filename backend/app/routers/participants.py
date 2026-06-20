import io
import uuid
from typing import Dict, Any, List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, Form
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..deps import get_db
from ..models.participant import Participant

router = APIRouter()


# --------------- Pydantic schemas ---------------

class ParticipantCreate(BaseModel):
    id: str
    name: Optional[str] = None
    college_name: Optional[str] = None
    year_of_study: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    declared_skills: Optional[List[str]] = []
    skill_vector: Optional[dict] = None
    team_id: Optional[str] = None

class ParticipantOut(BaseModel):
    id: str
    name: Optional[str] = None
    college_name: Optional[str] = None
    year_of_study: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    declared_skills: Optional[List[str]] = []
    skill_vector: Optional[dict] = None
    team_id: Optional[str] = None

    class Config:
        from_attributes = True


class ResumeAnalysisRequest(BaseModel):
    resume_text: str


class ResumeAnalysisResponse(BaseModel):
    parsed_resume: dict
    skill_vector: dict
    semantic_embedding: List[float]
    breakdown: dict


# --------------- CRUD endpoints ---------------

@router.post("/register", response_model=ParticipantOut)
async def register_participant(
    id: str = Form(...),
    name: Optional[str] = Form(None),
    college_name: Optional[str] = Form(None),
    github_url: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Store a new participant registration, extracting skills from their uploaded resume."""
    existing = db.query(Participant).filter(Participant.id == id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Participant already registered")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported for resumes")

    try:
        import pypdf
        content = await file.read()
        pdf_reader = pypdf.PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse PDF: {str(e)}")

    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract any text from the PDF")

    from participant_ai.pipelines.resume_rag.parser import parse_and_vectorize_batch

    # Extract skills using participant_ai
    results = await parse_and_vectorize_batch([text], max_concurrency=1)
    parsed, vector, embedding, breakdown = results[0]

    participant = Participant(
        id=id,
        name=name or parsed.name,
        college_name=college_name or parsed.college_name,
        year_of_study=parsed.year_of_study,
        github_url=github_url or parsed.github_url,
        linkedin_url=parsed.linkedin_url,
        declared_skills=parsed.raw_skills if hasattr(parsed, 'raw_skills') else [],
        skill_vector=vector.to_dict(),
        team_id=None,
    )
    db.add(participant)
    db.commit()
    db.refresh(participant)
    return participant



@router.get("/", response_model=List[ParticipantOut])
async def list_participants(db: Session = Depends(get_db)):
    """List all participants."""
    return db.query(Participant).all()


@router.get("/{participant_id}", response_model=ParticipantOut)
async def get_participant(participant_id: str, db: Session = Depends(get_db)):
    """Get a single participant by ID."""
    p = db.query(Participant).filter(Participant.id == participant_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Participant not found")
    return p


@router.put("/{participant_id}", response_model=ParticipantOut)
async def update_participant(participant_id: str, data: ParticipantCreate, db: Session = Depends(get_db)):
    """Update an existing participant."""
    p = db.query(Participant).filter(Participant.id == participant_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Participant not found")

    p.name = data.name
    p.college_name = data.college_name
    p.github_url = data.github_url
    p.declared_skills = data.declared_skills or []
    p.skill_vector = data.skill_vector
    p.team_id = data.team_id
    db.commit()
    db.refresh(p)
    return p


@router.delete("/{participant_id}")
async def delete_participant(participant_id: str, db: Session = Depends(get_db)):
    """Delete a participant."""
    p = db.query(Participant).filter(Participant.id == participant_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Participant not found")
    db.delete(p)
    db.commit()
    return {"detail": "deleted"}


# --------------- AI analysis endpoints ---------------

@router.post("/analyze_resume", response_model=ResumeAnalysisResponse)
async def analyze_resume(request: ResumeAnalysisRequest):
    """Parses resume text and returns skill analysis."""
    from participant_ai.pipelines.resume_rag.parser import parse_and_vectorize_batch

    results = await parse_and_vectorize_batch([request.resume_text], max_concurrency=1)
    parsed, vector, embedding, breakdown = results[0]

    return ResumeAnalysisResponse(
        parsed_resume=parsed.dict(),
        skill_vector=vector.to_dict(),
        semantic_embedding=embedding,
        breakdown=breakdown,
    )


@router.post("/upload_resume", response_model=ResumeAnalysisResponse)
async def upload_resume(file: UploadFile = File(...)):
    """Accepts a PDF file, extracts text, and runs AI analysis."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        import pypdf

        content = await file.read()
        pdf_reader = pypdf.PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse PDF: {str(e)}")

    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract any text from the PDF")

    from participant_ai.pipelines.resume_rag.parser import parse_and_vectorize_batch

    results = await parse_and_vectorize_batch([text], max_concurrency=1)
    parsed, vector, embedding, breakdown = results[0]

    return ResumeAnalysisResponse(
        parsed_resume=parsed.dict(),
        skill_vector=vector.to_dict(),
        semantic_embedding=embedding,
        breakdown=breakdown,
    )
