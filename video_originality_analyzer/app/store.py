from __future__ import annotations
import sqlite3
from pathlib import Path
import numpy as np
from typing import Iterable
from app.config import DB_PATH

SCHEMA = """
CREATE TABLE IF NOT EXISTS fingerprints (
    video_id    TEXT PRIMARY KEY,
    url         TEXT,
    title       TEXT,
    vec_len     INTEGER NOT NULL,
    vec_blob    BLOB NOT NULL
);
"""

class FingerprintStore:
    def __init__(self, db_path: Path = DB_PATH):
        self.db_path = db_path
        self._ensure_schema()

    def _ensure_schema(self):
        with sqlite3.connect(self.db_path) as con:
            con.execute(SCHEMA)
            con.commit()

    def upsert(self, video_id: str, url: str, title: str | None, vec: np.ndarray):
        blob = vec.tobytes()
        with sqlite3.connect(self.db_path) as con:
            con.execute(
                """
                INSERT INTO fingerprints (video_id, url, title, vec_len, vec_blob)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(video_id) DO UPDATE SET
                    url=excluded.url,
                    title=excluded.title,
                    vec_len=excluded.vec_len,
                    vec_blob=excluded.vec_blob
                """,
                (video_id, url, title, int(vec.size), blob),
            )
            con.commit()

    def all(self) -> Iterable[tuple[str, str, str | None, np.ndarray]]:
        with sqlite3.connect(self.db_path) as con:
            cur = con.execute("SELECT video_id, url, title, vec_len, vec_blob FROM fingerprints")
            for video_id, url, title, veclen, blob in cur.fetchall():
                vec = np.frombuffer(blob, dtype=np.float32)
                assert vec.size == veclen
                yield video_id, url, title, vec

    def get(self, video_id: str) -> np.ndarray | None:
        with sqlite3.connect(self.db_path) as con:
            cur = con.execute(
                "SELECT vec_len, vec_blob FROM fingerprints WHERE video_id = ?",
                (video_id,),
            )
            row = cur.fetchone()
            if not row:
                return None
            veclen, blob = row
            vec = np.frombuffer(blob, dtype=np.float32)
            assert vec.size == veclen
            return vec
