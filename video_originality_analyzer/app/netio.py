from __future__ import annotations
import tempfile
from pathlib import Path
import yt_dlp

from app.config import TMP_DIR

def download_video(url: str) -> Path:
    """
    Download a video from a URL using yt-dlp and return the local file path.
    """
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    tmpdir = Path(tempfile.mkdtemp(prefix="dl_", dir=TMP_DIR))
    out = tmpdir / "%(id)s.%(ext)s"
    ydl_opts = {
        "outtmpl": str(out),
        "quiet": True,
        "noprogress": True,
        "merge_output_format": "mp4",
        "format": "mp4/best",
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        filename = ydl.prepare_filename(info)
        candidate = Path(filename)
        mp4 = candidate.with_suffix(".mp4")
        return mp4 if mp4.exists() else candidate
