from __future__ import annotations
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, HttpUrl

from app.netio import download_video
from app.fetchers import build_video_meta
from app.fingerprint import fingerprint_video
from app.store import FingerprintStore
from app.matcher import rank_matches
from app.config import NOT_ORIGINAL_THRESHOLD

app = FastAPI(title="Video Originality Analyzer")

class AnalyzeRequest(BaseModel):
    url: HttpUrl

class IndexRequest(BaseModel):
    url: HttpUrl

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/index")
def index_url(req: IndexRequest):
    """
    Download, fingerprint, and store a video for future comparisons.
    Returns a simple boolean for consistency.
    """
    try:
        path = download_video(str(req.url))
        meta = build_video_meta(str(req.url), path)
        vec = fingerprint_video(path)
        store = FingerprintStore()
        store.upsert(meta.id, meta.url, meta.title, vec)
        return {"indexed": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    """
    Returns {"original": true} if the video is original vs DB,
    else {"original": false} if it's the same or very similar.
    Uses a coarse first pass + precise frame-level pHash overlap second pass.
    """
    try:
        path = download_video(str(req.url))
        meta = build_video_meta(str(req.url), path)
        from app.config import NOT_ORIGINAL_THRESHOLD
        from app.fingerprint import fingerprint_video, frame_phashes, cosine_similarity

        # query features
        qvec = fingerprint_video(path)
        qhashes = frame_phashes(path)

        store = FingerprintStore()
        rows = list(store.all())
        if not rows:
            return {"original": True}

        # exact same TikTok id already stored -> NOT original
        for vid, url, title, _vec in rows:
            if vid == meta.id:
                return {"original": False}

        # compare only against fingerprints with same dimensionality
        corpus = [(vid, url, title, vec) for (vid, url, title, vec) in rows if vec.shape[0] == qvec.shape[0]]
        if not corpus:
            return {"original": True}

        # first pass: coarse similarity
        matches = rank_matches(qvec, corpus, top_k=3)
        best = matches[0]
        if best.similarity >= NOT_ORIGINAL_THRESHOLD:
            return {"original": False}

        # second pass: precise pHash overlap against the best candidate
        # (re-download candidate video and compute its frame pHashes)
        candidate_path = download_video(best.url)
        chashes = frame_phashes(candidate_path)

        # compute fraction of query frames that have a close match in candidate
        # close = Hamming distance <= 10 bits out of 64
        def hamming(a: np.uint64, b: np.uint64) -> int:
            return int((int(a) ^ int(b)).bit_count())

        close = 0
        for a in qhashes:
            md = min((hamming(a, b) for b in chashes), default=64)
            if md <= 10:
                close += 1
        overlap = close / max(1, len(qhashes))

        # if enough frames overlap, mark as NOT original
        if overlap >= 0.25:   # 25% of frames are near-identical
            return {"original": False}

        # otherwise, treat as original
        return {"original": True}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
