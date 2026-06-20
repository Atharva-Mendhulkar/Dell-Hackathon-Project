import asyncio
import os
import sys
from celery import Celery
from psycopg2.extras import Json

# Add project root to sys.path to resolve participant_ai
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.app.database import execute
from participant_ai.pipelines.resume_rag.parser import parse_and_vectorize_batch

# Initialize Celery App
celery_app = Celery(
    "hackathon_worker",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

# Configure Celery
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    worker_concurrency=2, # Keep it low to prevent OOM locally
)

@celery_app.task(name="process_resume_task")
def process_resume_task(user_id: str, raw_text: str):
    """
    Background worker task to parse resume and update PostgreSQL.
    """
    async def run_async():
        results = await parse_and_vectorize_batch([raw_text], max_concurrency=1)
        return results
        
    try:
        results = asyncio.run(run_async())
        parsed, vector, embedding, breakdown = results[0]
        
        # Ensure vector is a valid dict
        vector_dict = vector if isinstance(vector, dict) else {}
        
        # Update participants table
        execute("UPDATE participants SET skill_vector = %s WHERE user_id = %s", (Json(vector_dict), user_id))
        print(f"[Celery] Successfully processed background LLM parsing for user {user_id}")
        return {"status": "success", "user_id": user_id}
    except Exception as e:
        print(f"[Celery Error] Task failed for user {user_id}: {e}")
        return {"status": "failed", "error": str(e)}
