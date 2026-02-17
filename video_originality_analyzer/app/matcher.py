from __future__ import annotations
from dataclasses import dataclass
import numpy as np
from typing import List, Tuple
from app.fingerprint import cosine_similarity
from app.config import MIN_ORIGINALITY

@dataclass
class Match:
    video_id: str
    url: str
    title: str | None
    similarity: float  # 0..1 (1 = very similar)

def rank_matches(query_vec: np.ndarray, corpus: List[Tuple[str, str, str | None, np.ndarray]], top_k: int = 5) -> list[Match]:
    scored: list[Match] = []
    for vid, url, title, vec in corpus:
        sim = float(cosine_similarity(query_vec, vec))
        scored.append(Match(video_id=vid, url=url, title=title, similarity=sim))
    scored.sort(key=lambda m: m.similarity, reverse=True)
    return scored[:top_k]

def originality_score(max_similarity: float) -> float:
    # more sensitive: punish high similarity with a square-root shrink
    raw = (1.0 - max_similarity) ** 0.5
    return max(MIN_ORIGINALITY, raw)
