from pathlib import Path

# Paths
ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
TMP_DIR = DATA_DIR / "tmp"
DB_PATH = DATA_DIR / "fingerprints.sqlite"

DATA_DIR.mkdir(parents=True, exist_ok=True)
TMP_DIR.mkdir(parents=True, exist_ok=True)

# ----- Fingerprint + accuracy settings -----
FRAME_SAMPLES = 64          # more frames => better accuracy
HASH_SIZE = 8               # 8x8 => 64 bits per hash

# These are required by fingerprint.py (advanced features)
EDGE_GRID = 4               # edge histogram grid (4x4)
HSV_BINS = (8, 8, 8)        # HSV histogram bins (H,S,V) = 512-dim hist
MOTION_BINS = 16            # histogram bins for motion magnitude
CENTER_CROP_MARGIN = 0.06   # crop borders (6%) to ignore letterboxing

# Decision rule: if similarity >= threshold -> NOT original (return {"original": false})
NOT_ORIGINAL_THRESHOLD = 0.90

# Small floor used elsewhere if needed
MIN_ORIGINALITY = 0.01
