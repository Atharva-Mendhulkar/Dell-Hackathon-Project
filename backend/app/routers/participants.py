import io
from fastapi import APIRouter, File, UploadFile, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import rapidfuzz
import json
from psycopg2.extras import Json

from participant_ai.pipelines.resume_rag.parser import parse_and_vectorize_batch
from ..database import execute, fetch_all, fetch_one

router = APIRouter()

class ResumeAnalysisRequest(BaseModel):
    resume_text: str

class ResumeAnalysisResponse(BaseModel):
    parsed_resume: dict
    skill_vector: dict
    semantic_embedding: List[float]
    breakdown: dict
    raw_text: Optional[str] = None

class BackgroundProcessRequest(BaseModel):
    user_id: str
    raw_text: str

from backend.app.worker import process_resume_task

@router.post("/process_resume_background")
async def process_resume_background(request: BackgroundProcessRequest):
    # Dispatch job to Redis queue using Celery
    process_resume_task.delay(request.user_id, request.raw_text)
    return {"status": "started", "queue": "celery"}

@router.post("/analyze_resume", response_model=ResumeAnalysisResponse)
async def analyze_resume(request: ResumeAnalysisRequest):
    """
    Parses resume text directly.
    """
    results = await parse_and_vectorize_batch([request.resume_text], max_concurrency=1)
    parsed, vector, embedding, breakdown = results[0]
    
    return ResumeAnalysisResponse(
        parsed_resume=parsed.dict(),
        skill_vector=vector.to_dict(),
        semantic_embedding=embedding,
        breakdown=breakdown
    )

@router.post("/upload_resume", response_model=ResumeAnalysisResponse)
async def upload_resume(file: UploadFile = File(...)):
    """
    Accepts a PDF file, extracts text via pypdf, and runs a fast regex parser.
    The heavy LLM extraction is deferred to the background.
    """
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
        
    # FAST REGEX PARSER (Deterministic)
    import re
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    phone_match = re.search(r'\+?\d[\d -]{8,14}\d', text)
    github_match = re.search(r'(?:github\.com/)([a-zA-Z0-9-]+)', text, re.IGNORECASE)
    linkedin_match = re.search(r'(?:linkedin\.com/in/)([a-zA-Z0-9-]+)', text, re.IGNORECASE)
    
    phone_str = phone_match.group(0) if phone_match else ""
    phone_str = re.sub(r'^\+?91[\s-]*', '', phone_str)
    
    # Try to guess name from the first non-empty line
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    name_guess = lines[0] if lines else ""
    # Clean up name guess (max 3 words usually)
    if len(name_guess.split()) > 4:
        name_guess = ""
        
    college_name = ""
    for l in lines:
        if re.search(r'(?i)(institute|university|college)', l):
            college = l.strip()
            # Fix PDF kerning issues like "V ellore" -> "Vellore" or "T echnology" -> "Technology"
            college = re.sub(r'\b([A-Z])\s+([a-z]{2,})\b', r'\1\2', college)
            # Remove trailing dates like "Jul. 2024 - Aug. 2028" or "2024-2028"
            college = re.sub(r'(?i)\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z\.]*\s*\d{4}.*$', '', college)
            college = re.sub(r'\s*[-–—]?\s*\b20\d{2}\b.*$', '', college)
            
            # Clean up any trailing commas or spaces
            college_name = re.sub(r'[,.\s]+$', '', college)
            break
            
    degree = ""
    for l in lines:
        if re.search(r'(?i)(b\.?tech|bachelor|b\.?e\.?|b\.?s\.?)', l):
            degree = l.strip()
            # if line is too long, just take a snippet
            if len(degree) > 30:
                m = re.search(r'(?i)(b\.?tech|bachelor.*?)(?:\s|$)', l)
                degree = m.group(1) if m else "B.Tech"
            break
            
    year_calc = ""
    year_match = re.search(r'(20\d{2})\s*-\s*(20\d{2})', text)
    if year_match:
        start_yr = int(year_match.group(1))
        end_yr = int(year_match.group(2))
        current_yr = 2026
        yr_diff = current_yr - start_yr + 1
        if yr_diff == 1: year_calc = "1st Year"
        elif yr_diff == 2: year_calc = "2nd Year"
        elif yr_diff == 3: year_calc = "3rd Year"
        elif yr_diff == 4: year_calc = "4th Year"
        else: year_calc = f"{start_yr}-{end_yr}"
        
    common_skills = [
        "Python", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "AWS", 
        "Docker", "Kubernetes", "HTML", "CSS", "SQL", "PostgreSQL", "MongoDB",
        "Java", "C++", "C#", "Go", "Rust", "Swift", "Kotlin", "Machine Learning", 
        "TensorFlow", "PyTorch", "Angular", "Vue", "FastAPI", "Django", "Flask",
        "Git", "Linux", "GCP", "Azure", "Firebase", "Supabase"
    ]
    extracted_skills = []
    text_lower = text.lower()
    for skill in common_skills:
        if skill.lower() in text_lower:
            if skill == "Java" and re.search(r'\bjava\b', text_lower) is None:
                continue
            if skill == "Go" and re.search(r'\bgo\b', text_lower) is None:
                continue
            extracted_skills.append(skill)
            
    parsed = {
        "name": name_guess,
        "email": email_match.group(0) if email_match else "",
        "phone": phone_str.strip(),
        "github_url": f"https://github.com/{github_match.group(1)}" if github_match else "",
        "linkedin_url": f"https://linkedin.com/in/{linkedin_match.group(1)}" if linkedin_match else "",
        "college_name": college_name,
        "degree": degree,
        "year": year_calc,
        "raw_skills": extracted_skills
    }
    
    # Return immediately without invoking the LLM
    return ResumeAnalysisResponse(
        parsed_resume=parsed,
        skill_vector={},
        semantic_embedding=[],
        breakdown={},
        raw_text=text
    )

class RegistrationPayload(BaseModel):
    hackathon_id: str
    user_id: Optional[str] = None
    name: str
    email: str
    college: str
    github: str
    skills: List[str] = []

@router.post("/register")
async def submit_registration(payload: RegistrationPayload):
    """
    Handles deterministic registration scoring (Duplicate Detection)
    and saves the registration.
    """
    # 1. Fetch existing registrations to check duplicates
    existing = fetch_all(
        "SELECT id, name, email, college, github FROM registrations WHERE hackathon_id = %s",
        (payload.hackathon_id,)
    )

    exact_email = False
    exact_github = False
    max_fuzzy_score = 0.0
    matched_profile = None

    for r in existing:
        if r['email'].lower() == payload.email.lower():
            exact_email = True
            matched_profile = r['id']
        if r['github'].lower() == payload.github.lower():
            exact_github = True
            matched_profile = r['id']

        # Fuzzy string matching using RapidFuzz
        name_sim = rapidfuzz.fuzz.token_sort_ratio(payload.name.lower(), r['name'].lower()) / 100.0
        college_sim = rapidfuzz.fuzz.token_sort_ratio(payload.college.lower(), r['college'].lower()) / 100.0

        # PRD specifies: Name (0.60) + College (0.40)
        combined_score = (name_sim * 0.6) + (college_sim * 0.4)
        if combined_score > max_fuzzy_score:
            max_fuzzy_score = combined_score
            if not exact_email and not exact_github:
                matched_profile = r['id']

    # 2. Determine Decision Thresholds
    if exact_email or exact_github:
        final_score = 1.0
        decision = 'HARD_DUPLICATE'
    else:
        final_score = max_fuzzy_score
        if final_score < 0.70:
            decision = 'AUTO_APPROVED'
        elif 0.70 <= final_score < 0.85:
            decision = 'MANUAL_REVIEW'
        else:
            decision = 'POTENTIAL_DUPLICATE'

    # 3. Save Registration
    reg_id = execute(
        """
        INSERT INTO registrations (
            hackathon_id, user_id, name, email, college, github, skills,
            decision, score, exact_email, exact_github, matched_profile
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
        """,
        (
            payload.hackathon_id, payload.user_id, payload.name, payload.email, 
            payload.college, payload.github, payload.skills,
            decision, final_score, exact_email, exact_github, matched_profile
        )
    )

    # 4. If Auto-Approved, create the actual participant profile
    if decision == 'AUTO_APPROVED':
        execute(
            """
            INSERT INTO participants (hackathon_id, user_id, registration_id, name, email, college_name, github_url, declared_skills, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'approved')
            """,
            (payload.hackathon_id, payload.user_id, reg_id['id'], payload.name, payload.email, payload.college, payload.github, payload.skills)
        )

    return {
        "status": "success",
        "registration_id": reg_id['id'],
        "decision": decision,
        "score": final_score
    }

@router.post("/{registration_id}/approve")
async def approve_registration(registration_id: str):
    """
    Admin endpoint to manually approve a registration that was flagged for review.
    """
    reg = fetch_one("SELECT * FROM registrations WHERE id = %s", (registration_id,))
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")

    if reg['decision'] == 'AUTO_APPROVED':
        return {"status": "already_approved"}

    execute("UPDATE registrations SET decision = 'AUTO_APPROVED' WHERE id = %s", (registration_id,))

    # Explicitly create participant
    execute(
        """
        INSERT INTO participants (hackathon_id, user_id, registration_id, name, email, college_name, github_url, declared_skills, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'approved')
        """,
        (reg['hackathon_id'], reg['user_id'], reg['id'], reg['name'], reg['email'], reg['college'], reg['github'], reg['skills'])
    )

    return {"status": "approved", "participant_created": True}

@router.post("/{registration_id}/reject")
async def reject_registration(registration_id: str):
    """
    Admin endpoint to manually reject a registration.
    """
    reg = fetch_one("SELECT * FROM registrations WHERE id = %s", (registration_id,))
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")

    if reg['decision'] == 'REJECTED':
        return {"status": "already_rejected"}

    execute("UPDATE registrations SET decision = 'REJECTED' WHERE id = %s", (registration_id,))

    # Ideally also handle deleting from participants if it was somehow approved then rejected, but keeping it simple for demo.

    return {"status": "rejected"}
