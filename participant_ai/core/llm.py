"""Thin Ollama JSON wrapper shared by pipelines."""

from __future__ import annotations

import asyncio
import json
import logging
import re
from typing import Any, Optional
import httpx

logger = logging.getLogger(__name__)

OLLAMA_MODEL = "llama3.2"
OLLAMA_URL = "http://localhost:11434/api/generate"

_MAX_RETRIES = 3
_INITIAL_BACKOFF_SECONDS = 2.0


class LLMCallError(Exception):
    def __init__(self, message: str, raw_response: Optional[str] = None) -> None:
        super().__init__(message)
        self.raw_response = raw_response


def _strip_fences(text: str) -> str:
    stripped = text.strip()
    match = re.match(r"^```(?:json)?\s*\n?(.*?)\n?```\s*$", stripped, re.DOTALL | re.IGNORECASE)
    return match.group(1).strip() if match else stripped


def _parse_json(raw_text: str) -> dict:
    try:
        parsed = json.loads(_strip_fences(raw_text))
    except json.JSONDecodeError as exc:
        raise LLMCallError(f"Invalid JSON: {exc}", raw_response=raw_text) from exc
    if not isinstance(parsed, dict):
        raise LLMCallError("Response was not a JSON object.", raw_response=raw_text)
    return parsed


def _transient(exc: Exception) -> bool:
    err_str = str(exc).lower()
    if "rate" in err_str or "quota" in err_str or "500" in err_str or "503" in err_str or "timeout" in err_str or "connect" in err_str:
        return True
    return False

async def call_json_async(prompt: str) -> dict:
    """Call Ollama asynchronously, parse JSON, retry transient errors."""
    last_error: Optional[Exception] = None

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "format": "json",
        "stream": False,
        "options": {
            "temperature": 0.2
        }
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        for attempt in range(_MAX_RETRIES + 1):
            try:
                response = await client.post(OLLAMA_URL, json=payload)
                response.raise_for_status()
                data = response.json()
                text = data.get("response", "")
                if not text:
                    raise LLMCallError("Empty response.")
                return _parse_json(text)
            except LLMCallError:
                raise
            except Exception as exc:
                last_error = exc
                if attempt < _MAX_RETRIES and _transient(exc):
                    backoff = _INITIAL_BACKOFF_SECONDS * (2**attempt)
                    logger.warning("Ollama transient error, retry in %.1fs: %s", backoff, exc)
                    await asyncio.sleep(backoff)
                    continue
                raise LLMCallError(f"Ollama call failed: {exc}", raw_response=str(exc)) from exc

    raise LLMCallError(f"Ollama call failed after retries: {last_error}", raw_response=str(last_error))


def call_json(prompt: str) -> dict:
    """Sync wrapper for low-volume callers."""
    return asyncio.run(call_json_async(prompt))
