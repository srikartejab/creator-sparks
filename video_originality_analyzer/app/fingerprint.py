from __future__ import annotations
from pathlib import Path
import numpy as np
import cv2
from PIL import Image
import imagehash

from app.config import (
    FRAME_SAMPLES, HASH_SIZE, EDGE_GRID, HSV_BINS, MOTION_BINS, CENTER_CROP_MARGIN
)

# --------------------- helpers ---------------------

def _central_crop(img: np.ndarray, margin: float) -> np.ndarray:
    h, w = img.shape[:2]
    dy = int(h * margin)
    dx = int(w * margin)
    if (h - 2 * dy) <= 0 or (w - 2 * dx) <= 0:
        return img
    return img[dy:h - dy, dx:w - dx]

def _frame_indices(total_frames: int, k: int) -> list[int]:
    if total_frames <= 0:
        return []
    if k >= total_frames:
        return list(range(total_frames))
    return list(np.linspace(0, total_frames - 1, num=k, dtype=int))

def _hsv_hist(img_bgr: np.ndarray) -> np.ndarray:
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    hist = cv2.calcHist([hsv], [0, 1, 2], None, HSV_BINS, [0, 180, 0, 256, 0, 256])
    hist = hist.flatten().astype(np.float32)
    s = hist.sum() + 1e-8
    return hist / s  # 512 dims

def _edge_histogram(img_bgr: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 100, 200)
    h, w = edges.shape
    gy, gx = EDGE_GRID, EDGE_GRID
    by, bx = max(1, h // gy), max(1, w // gx)
    vec = []
    for iy in range(gy):
        for ix in range(gx):
            tile = edges[iy * by:(iy + 1) * by, ix * bx:(ix + 1) * bx]
            vec.append(0.0 if tile.size == 0 else float(np.count_nonzero(tile)) / float(tile.size))
    v = np.array(vec, dtype=np.float32)
    s = v.sum() + 1e-8
    return v / s  # 16 dims

def _l2_normalize(v: np.ndarray, eps: float = 1e-8) -> np.ndarray:
    n = float(np.linalg.norm(v) + eps)
    return (v / n).astype(np.float32)

def _hash_bits(pil_im: Image.Image) -> np.ndarray:
    """Return concatenated pHash+dHash+aHash bits as float32 (length 192 for HASH_SIZE=8)."""
    ph = imagehash.phash(pil_im, hash_size=HASH_SIZE)
    dh = imagehash.dhash(pil_im, hash_size=HASH_SIZE)
    ah = imagehash.average_hash(pil_im, hash_size=HASH_SIZE)
    def to_vec(h: imagehash.ImageHash) -> np.ndarray:
        return np.array(h.hash, dtype=np.uint8).reshape(-1).astype(np.float32)
    return np.concatenate([to_vec(ph), to_vec(dh), to_vec(ah)]).astype(np.float32)

# ---------------- coarse per-frame feature (720 dims) ----------------

def _per_frame_feature(img_bgr: np.ndarray) -> np.ndarray:
    img_bgr = _central_crop(img_bgr, CENTER_CROP_MARGIN)
    img_bgr = cv2.resize(img_bgr, (256, 256), interpolation=cv2.INTER_AREA)

    # hashes (192)
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    pil_im = Image.fromarray(img_rgb)
    hbits = _hash_bits(pil_im)  # 192

    # color + edges (512 + 16)
    hsvh = _hsv_hist(img_bgr)   # 512
    eh   = _edge_histogram(img_bgr)  # 16

    feat = np.concatenate([hbits, hsvh, eh])  # 720
    return feat.astype(np.float32)

# ---------------- video-level fingerprint (736 dims) ----------------

def fingerprint_video(video_path: Path, samples: int = FRAME_SAMPLES) -> np.ndarray:
    """Coarse video-level vector used for fast first-pass ranking."""
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open video: {video_path}")

    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    idxs = _frame_indices(total, samples)

    frame_feats: list[np.ndarray] = []
    motion_vals: list[float] = []
    prev_gray = None

    for idx in idxs:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ok, frame = cap.read()
        if not ok or frame is None:
            continue

        frame_feats.append(_per_frame_feature(frame))

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        if prev_gray is not None:
            diff = cv2.absdiff(gray, prev_gray)
            motion_vals.append(float(diff.mean()) / 255.0)
        prev_gray = gray

    cap.release()

    if not frame_feats:
        raise RuntimeError("No frames captured for fingerprint.")

    M = np.vstack(frame_feats)        # (n, 720)
    visual_mean = M.mean(axis=0)      # (720,)

    if len(motion_vals) == 0:
        motion_hist = np.zeros((MOTION_BINS,), dtype=np.float32); motion_hist[0] = 1.0
    else:
        mh, _ = np.histogram(
            np.clip(np.array(motion_vals, dtype=np.float32), 0.0, 1.0),
            bins=MOTION_BINS, range=(0.0, 1.0), density=True
        )
        motion_hist = mh.astype(np.float32)

    # weight and normalize
    visual_w, motion_w = 1.0, 0.6
    vec = np.concatenate([visual_w * visual_mean, motion_w * motion_hist])  # 736
    return _l2_normalize(vec)

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    # a and b expected to be L2-normalized
    sim = float(np.dot(a, b))
    if sim < 0.0: sim = 0.0
    if sim > 1.0: sim = 1.0
    return sim

# ---------------- precise second-pass: frame-level pHashes ----------------

def _pack_bits_to_uint64(bits: np.ndarray) -> np.uint64:
    """Pack 64 boolean bits into a single uint64 (big-endian)."""
    val = 0
    for b in bits.astype(int):
        val = (val << 1) | (1 if b else 0)
    return np.uint64(val)

def frame_phashes(video_path: Path, samples: int = FRAME_SAMPLES) -> np.ndarray:
    """Return an array of uint64 pHashes for sampled frames (for overlap check)."""
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open video: {video_path}")

    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    idxs = _frame_indices(total, samples)
    out: list[np.uint64] = []

    for idx in idxs:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ok, frame = cap.read()
        if not ok or frame is None:
            continue
        frame = _central_crop(frame, CENTER_CROP_MARGIN)
        frame = cv2.resize(frame, (256, 256), interpolation=cv2.INTER_AREA)
        pil = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        h = imagehash.phash(pil, hash_size=HASH_SIZE)  # 8x8 => 64 bits
        bits = np.array(h.hash, dtype=np.uint8).reshape(-1)  # shape (64,)
        out.append(_pack_bits_to_uint64(bits))

    cap.release()
    return np.array(out, dtype=np.uint64)
