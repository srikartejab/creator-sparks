"""
Index one or more URLs into the local corpus.

Usage:
  python scripts/index_corpus.py <url1> [<url2> ...]
"""
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parents[1]))  # add project root

from app.netio import download_video
from app.fetchers import build_video_meta
from app.fingerprint import fingerprint_video
from app.store import FingerprintStore

def main(urls):
    store = FingerprintStore()
    for url in urls:
        print(f"[+] Indexing {url}")
        path = download_video(url)
        meta = build_video_meta(url, path)
        vec = fingerprint_video(path)
        store.upsert(meta.id, meta.url, meta.title, vec)
        print(f"    -> stored id={meta.id}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/index_corpus.py <url1> [<url2> ...]")
        sys.exit(1)
    main(sys.argv[1:])
