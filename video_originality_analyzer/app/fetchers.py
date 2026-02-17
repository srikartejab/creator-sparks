from __future__ import annotations
from dataclasses import dataclass
from pathlib import Path
import yt_dlp

@dataclass
class VideoMeta:
    url: str
    id: str
    title: str | None
    filepath: Path

def fetch_metadata_only(url: str) -> dict:
    """Return metadata (no download)."""
    ydl_opts = {"quiet": True, "noprogress": True, "skip_download": True}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        return ydl.extract_info(url, download=False)

def build_video_meta(url: str, filepath: Path) -> VideoMeta:
    """Build a minimal metadata object; fall back to filename stem if needed."""
    try:
        info = fetch_metadata_only(url)
        vid = info.get("id") or filepath.stem
        title = info.get("title")
    except Exception:
        vid = filepath.stem
        title = None
    return VideoMeta(url=url, id=str(vid), title=title, filepath=filepath)
