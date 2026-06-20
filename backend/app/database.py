import os
from contextlib import contextmanager
from datetime import date, datetime
from pathlib import Path
from typing import Any, Iterator
from uuid import UUID

from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import Json, RealDictCursor

load_dotenv(Path(__file__).resolve().parents[2] / ".env")


class DatabaseNotConfigured(RuntimeError):
    pass


def _database_url() -> str:
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise DatabaseNotConfigured("DATABASE_URL is not set")
    return database_url


def normalize(value: Any) -> Any:
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, UUID):
        return str(value)
    if isinstance(value, list):
        return [normalize(item) for item in value]
    if isinstance(value, dict):
        return {key: normalize(item) for key, item in value.items()}
    return value


def json_param(value: Any) -> Json:
    return Json(value if value is not None else {})


@contextmanager
def connection() -> Iterator[Any]:
    conn = psycopg2.connect(_database_url(), cursor_factory=RealDictCursor)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def fetch_all(query: str, params: tuple[Any, ...] = ()) -> list[dict[str, Any]]:
    with connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            return [normalize(dict(row)) for row in cur.fetchall()]


def fetch_one(query: str, params: tuple[Any, ...] = ()) -> dict[str, Any] | None:
    with connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            row = cur.fetchone()
            return normalize(dict(row)) if row else None


def execute(query: str, params: tuple[Any, ...] = ()) -> dict[str, Any] | None:
    with connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            if cur.description:
                row = cur.fetchone()
                return normalize(dict(row)) if row else None
            return None
