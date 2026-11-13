#!/usr/bin/env python3
"""
Visual diff checker against docs/qa/baseline/ using Pillow ImageChops.
Usage:
  python3 scripts/visual-diff.py --baseline docs/qa/baseline --current docs/qa/current --threshold 0.5
  python3 scripts/visual-diff.py --masks docs/qa/visual-masks.json
Exits non-zero if any image exceeds the % changed pixels threshold (or has size mismatch/missing file).
Never imported by Astro/Vite.
"""
import argparse
import json
import pathlib
import sys
from PIL import Image, ImageChops, ImageDraw


def apply_masks(img: Image.Image, masks: list[dict]) -> Image.Image:
    if not masks:
        return img
    out = img.copy()
    draw = ImageDraw.Draw(out)
    w, h = out.size
    for m in masks:
        x0 = max(0, int(m.get("x", 0)))
        y0 = max(0, int(m.get("y", 0)))
        mw = int(m.get("w", 0))
        mh = int(m.get("h", 0))
        x1 = min(w, x0 + mw if mw > 0 else w)
        y1 = min(h, y0 + mh if mh > 0 else h)
        draw.rectangle([x0, y0, x1, y1], fill=(0, 0, 0))
    return out


def compare_pair(base_path: pathlib.Path, curr_path: pathlib.Path, masks: list[dict], channel_tol: int) -> tuple[float, tuple[int, int], tuple[int, int]]:
    with Image.open(base_path) as b_raw, Image.open(curr_path) as c_raw:
        b = b_raw.convert("RGB")
        c = c_raw.convert("RGB")
        if b.size != c.size:
            return 100.0, b.size, c.size
        b_m = apply_masks(b, masks)
        c_m = apply_masks(c, masks)
        diff = ImageChops.difference(b_m, c_m)
        # Count pixels where any RGB channel differs by more than channel_tol
        raw = diff.tobytes()
        total_px = b.size[0] * b.size[1]
        changed = 0
        for i in range(0, len(raw), 3):
            if raw[i] > channel_tol or raw[i + 1] > channel_tol or raw[i + 2] > channel_tol:
                changed += 1
        pct = (changed / total_px) * 100.0 if total_px else 0.0
        return pct, b.size, c.size


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--baseline", default="docs/qa/baseline")
    parser.add_argument("--current", default="docs/qa/current")
    parser.add_argument("--threshold", type=float, default=0.5, help="Max allowed %% changed pixels per screenshot")
    parser.add_argument("--channel-tol", type=int, default=8, help="Per-channel RGB delta noise floor (0-255)")
    parser.add_argument("--masks", default="docs/qa/visual-masks.json", help="Optional JSON mapping filename or '*' -> list of {x,y,w,h}")
    parser.add_argument("--filter", default="", help="Optional substring filter on filename")
    args = parser.parse_args()

    base_dir = pathlib.Path(args.baseline)
    curr_dir = pathlib.Path(args.current)
    if not base_dir.exists():
        print(f"No baseline dir at {base_dir}", file=sys.stderr)
        return 2
    if not curr_dir.exists():
        print(f"No current dir at {curr_dir}", file=sys.stderr)
        return 2

    mask_map: dict[str, list[dict]] = {}
    mask_file = pathlib.Path(args.masks)
    if mask_file.exists():
        mask_map = json.loads(mask_file.read_text(encoding="utf8"))

    base_files = sorted(p for p in base_dir.glob("*.png") if args.filter in p.name)
    if not base_files:
        print("No matching baseline PNGs found.", file=sys.stderr)
        return 2

    failures = []
    for bp in base_files:
        cp = curr_dir / bp.name
        if not cp.exists():
            failures.append((bp.name, 100.0, "MISSING_CURRENT"))
            continue
        masks = mask_map.get("*", []) + mask_map.get(bp.name, [])
        pct, bsz, csz = compare_pair(bp, cp, masks, args.channel_tol)
        status = "OK" if pct <= args.threshold else "FAIL"
        size_note = "" if bsz == csz else f" (size {bsz}!={csz})"
        print(f"[{status}] {bp.name}: {pct:.3f}% changed{size_note}")
        if pct > args.threshold:
            failures.append((bp.name, pct, f"{pct:.3f}% > {args.threshold}%{size_note}"))

    if failures:
        print(f"\nVisual diff FAILED ({len(failures)}/{len(base_files)} images over threshold {args.threshold}%).")
        return 1
    print(f"\nVisual diff PASS ({len(base_files)}/{len(base_files)} images <= {args.threshold}%).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
