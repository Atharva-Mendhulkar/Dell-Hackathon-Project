import json
from typing import Dict

from app.services.ai.core.llm import call_json_async
from app.models.hackathon import Hackathon


async def generate_success_report(
    hackathon: Hackathon, stats: Dict[str, int]
) -> Dict[str, str]:
    """Generates a Hackathon Success Report / Pitch Deck summary."""

    prompt = f"""
You are a technical hackathon organizer generating a post-event "Success Report" and "Pitch Deck" summary for sponsors and university administration.

Hackathon Name: {hackathon.name}
Theme: {hackathon.theme or hackathon.description}

Key Statistics:
- Total Participants: {stats.get("total_participants", 0)}
- Total Registrations: {stats.get("total_registrations", 0)}
- Teams Formed: {stats.get("total_teams", 0)}
- Submissions Evaluated: {stats.get("total_submissions", 0)}
- Reviewers Engaged: {stats.get("total_reviewers", 0)}

Generate an executive summary report.
Return a strictly valid JSON object with the following keys:
- "executive_summary": A strong, one-paragraph summary of the event's impact.
- "metrics_highlights": An array of strings, where each string is a 1-2 sentence bullet point highlighting a success metric.
- "sponsor_pitch": A drafted message to send to sponsors thanking them for their support and highlighting the ROI.
"""

    return await call_json_async(prompt)
