import json
from typing import Dict

from app.services.ai.core.llm import call_json_async
from app.models.hackathon import Hackathon
from app.models.problem_statement import ProblemStatement


async def generate_promotional_content(
    hackathon: Hackathon, problem_statements: list[ProblemStatement]
) -> Dict[str, str]:
    """Generates promotional content for different platforms."""

    ps_descriptions = "\n".join(
        [f"- {ps.title}: {(ps.raw_text or '')[:200]}..." for ps in problem_statements]
    )

    prompt = f"""
You are an expert tech event marketer. Write promotional drafts for the upcoming hackathon.
The hackathon details are:
Name: {hackathon.name}
Theme: {hackathon.theme or hackathon.description}
Start Date: {hackathon.event_start}
End Date: {hackathon.event_end}

Problem Statements:
{ps_descriptions}

Generate engaging promotional content tailored for three platforms.
Return a strictly valid JSON object where all values are SINGLE STRINGS with the following keys:
- "twitter": A single string for a Twitter post/thread (include emojis and hashtags). Do not use nested objects.
- "linkedin": A single string for a professional, inspiring LinkedIn post. Do not use nested objects.
- "email": A single string for a promotional email draft (include subject). Do not use nested objects.
"""

    return await call_json_async(prompt)
