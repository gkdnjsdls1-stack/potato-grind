"""art/raw 원본에서 마젠타 배경을 빼고 잘라서 public/sprites/로 내보낸다.

실행:  .venv/bin/python scripts/export_sprites.py
원본은 건드리지 않는다. 새로 뽑은 파일은 아래 SPRITES 표에 한 줄 추가하면 된다.

크기는 게임에서 쓰는 크기의 2배로 내보낸다(레티나용). 아이템 128px → 256px, 캐릭터 256px → 512px.
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "art" / "raw"
OUT = ROOT / "public" / "sprites"

# (원본 파일 접두어, 내보낼 이름, 종류, 긴 변 최대 px)
#   kind: sprite = 배경 빼고 한 장
#         tile   = 배경 없음, 정사각형으로 줄이기만
#         split  = 배경 빼고 조각마다 따로 (이름_01, _02 … 윗줄부터, 왼쪽부터). 조각마다 크기를 따로 맞춘다.
#         frames = split과 같지만 애니메이션 프레임이라 모든 조각을 같은 배율·같은 캔버스로 (발 기준 정렬)
#         fx     = frames와 같지만 가운데 정렬 (이펙트)
SPRITES: list[tuple[str, str, str, int]] = [
    ("04-1-", "char_hero_front", "sprite", 512),
    ("04-15-", "char_fairy", "sprite", 512),
    ("04-6-", "char_hero_till", "frames", 512),
    ("04-7-", "char_hero_harvest", "frames", 512),
    ("04-8-", "char_hero_water", "frames", 512),
    ("04-9-", "char_customer_quiet", "sprite", 512),
    ("04-10-", "char_customer_grumpy", "sprite", 512),
    ("04-11-", "char_customer_cheerful", "sprite", 512),
    ("04-12-", "char_customer_grandma", "sprite", 512),
    ("04-13-", "char_customer_kid", "sprite", 512),
    ("04-14-", "char_customer_face", "frames", 256),
    ("04-16-", "char_debt_collector", "sprite", 512),
    ("05-14-potato-pile.", "obj_potato_pile", "sprite", 512),
    ("05-1-", "tile_dry", "tile", 256),
    ("05-2-", "tile_tilled", "tile", 256),
    ("05-3-", "tile_planted", "tile", 256),
    ("05-4-", "tile_watered", "tile", 256),
    ("05-5-", "tile_sprout", "tile", 256),
    ("05-6-", "tile_grown", "tile", 256),
    ("05-7-", "obj_rock", "sprite", 256),
    ("05-8-", "obj_weed", "sprite", 256),
    ("05-9-", "obj_branch", "sprite", 256),
    ("05-10-", "obj_tree", "sprite", 512),
    ("05-11-", "obj_stump", "sprite", 256),
    ("05-12-", "obj_grandma_house", "sprite", 512),
    ("05-13-", "obj_potato_shed", "sprite", 512),
    ("06-1-", "obj_sink", "sprite", 512),
    ("06-2-", "obj_cutting_board", "sprite", 256),
    ("06-3-", "obj_grater", "sprite", 256),
    ("06-4-", "obj_pan", "sprite", 256),
    ("06-5-", "obj_burner", "sprite", 256),
    ("06-6-", "obj_counter", "sprite", 512),
    ("06-7-", "obj_trash_bin", "sprite", 256),
    ("06-8-", "tool_peeler", "sprite", 256),
    ("06-9-", "tool_knife", "sprite", 256),
    ("06-10-", "tool_spatula", "sprite", 256),
    ("06-11-", "tool_watering_can", "sprite", 256),
    ("06-12-", "obj_potato_basket", "sprite", 256),
    ("07-1-", "item_potato_raw", "sprite", 256),
    ("07-2-", "item_potato_good", "sprite", 256),
    ("07-3-", "item_potato_seed", "sprite", 256),
    ("07-4-", "item_potato_peeled", "sprite", 256),
    ("07-5-julienne.", "item_potato_julienne", "sprite", 256),
    ("07-6-", "item_potato_batter", "sprite", 256),
    ("07-7-", "dish_baked_potato", "sprite", 256),
    ("07-8-", "dish_stir_fry", "sprite", 256),
    ("07-9-", "dish_pancake", "sprite", 256),
    ("07-10-", "dish_pancake_burnt", "sprite", 256),
    ("07-13-", "dish_pancake_stack", "sprite", 512),
    ("07-11-", "item_pan_raw", "sprite", 256),
    ("07-12-", "item_pan_cooked", "sprite", 256),
    ("08-1-", "ui_panel", "sprite", 512),
    ("08-2-", "ui_button", "split", 512),
    ("08-3-", "ui_bubble", "sprite", 512),
    ("08-4-", "ui_gauge_h", "sprite", 512),
    ("08-5-", "ui_gauge_v", "sprite", 512),
    ("08-6-", "ui_receipt", "sprite", 512),
    ("08-7-", "ui_coin", "sprite", 256),
    ("09-1-", "fx_dust", "fx", 128),
    ("09-2-", "fx_smoke", "fx", 128),
    ("09-3-", "fx_drop", "fx", 128),
    ("09-4-", "fx_sparkle", "fx", 128),
    ("09-5-", "fx_peel", "split", 128),
]

# 걷기 시트: 4x4. 3·4행(옆모습)은 방향이 섞여 나와서 4행에서 오른쪽 프레임을 만들고 왼쪽은 좌우반전.
WALK_SHEET = "04-2-"
WALK_SIZE = 512


def find_raw(prefix: str) -> Path | None:
    hits = sorted(p for p in RAW.glob("*.png") if p.name.startswith(prefix))
    return hits[0] if hits else None


# 제미나이 워터마크(흰 반짝이)의 투명도 지도. 1024×1024 출력에서는 늘 같은 자리(844,844부터 120×120)에
# 같은 투명도(최대 0.31)로 덧씌워진다. 마젠타 배경 원본 11장에서 재서 만든 것.
WM_FILE = Path(__file__).with_name("gemini_watermark_1024.png")
WM_AT = (844, 844)


def unwatermark(img: Image.Image) -> Image.Image:
    """배경을 빼지 않는 그림(타일)에서 워터마크를 역산해 지운다: 원래색 = (지금색 - a*255) / (1 - a)."""
    if img.size != (1024, 1024) or not WM_FILE.exists():
        return img
    a = np.asarray(Image.open(WM_FILE), dtype=np.float32)[..., None] / 255
    rgb = np.asarray(img, dtype=np.float32).copy()
    x, y = WM_AT
    h, w = a.shape[:2]
    patch = rgb[y:y + h, x:x + w]
    rgb[y:y + h, x:x + w] = np.clip((patch - a * 255) / (1 - a), 0, 255)
    return Image.fromarray(rgb.astype(np.uint8))


def seamless(img: Image.Image) -> Image.Image:
    """이어 붙였을 때 가장자리 색이 맞도록 고친다 (주기 + 매끈 성분 분해, Moisan 2011).

    그림에서 '가장자리 어긋남만 설명하는 아주 매끈한 성분'을 빼서, 위·아래·좌·우가 맞물리게 한다.
    안쪽 그림은 거의 그대로다. 가장자리에서 잘린 물건(반쪽 물웅덩이 등)은 못 고친다.
    """
    u = np.asarray(img, dtype=np.float64)
    h, w, _ = u.shape
    v = np.zeros_like(u)
    v[0] += u[-1] - u[0]
    v[-1] += u[0] - u[-1]
    v[:, 0] += u[:, -1] - u[:, 0]
    v[:, -1] += u[:, 0] - u[:, -1]
    q = np.arange(h)[:, None]
    r = np.arange(w)[None, :]
    den = 2 * np.cos(2 * np.pi * q / h) + 2 * np.cos(2 * np.pi * r / w) - 4
    den[0, 0] = 1
    s = np.empty_like(u)
    for c in range(3):
        sh = np.fft.fft2(v[..., c]) / den
        sh[0, 0] = 0
        s[..., c] = np.real(np.fft.ifft2(sh))
    return Image.fromarray(np.clip(u - s, 0, 255).round().astype(np.uint8))


def resize_tile(img: Image.Image, size: int) -> Image.Image:
    """줄일 때 가장자리가 반대편 가장자리를 참고하게 해서(감싸기) 이음새에 번짐이 안 생기게 한다."""
    w, h = img.size
    pad = w // 8
    a = np.asarray(img)
    wrapped = Image.fromarray(np.pad(a, ((pad, pad), (pad, pad), (0, 0)), mode="wrap"))
    s = size / w
    big = wrapped.resize((round(wrapped.width * s), round(wrapped.height * s)), Image.LANCZOS)
    p = round(pad * s)
    return big.crop((p, p, p + size, p + size))


def magenta_score(rgb: np.ndarray) -> np.ndarray:
    """min(R,B) - G. 마젠타는 크고, 크림·갈색 외곽선은 0 이하."""
    return np.minimum(rgb[..., 0], rgb[..., 2]) - rgb[..., 1]


def key(img: Image.Image) -> Image.Image:
    """마젠타 배경을 투명으로. 제미나이 마젠타는 파일마다 색이 달라서 테두리에서 배경색을 잰다."""
    rgb = np.asarray(img.convert("RGB"), dtype=np.float32)
    h, w, _ = rgb.shape
    m = magenta_score(rgb)

    border = np.concatenate([rgb[:4].reshape(-1, 3), rgb[-4:].reshape(-1, 3),
                             rgb[:, :4].reshape(-1, 3), rgb[:, -4:].reshape(-1, 3)])
    bm = magenta_score(border)
    bg_px = border[bm > 0.5 * bm.max()]
    bg = np.median(bg_px, axis=0)
    bg_m = float(magenta_score(bg[None])[0])

    hi, lo = 0.80 * bg_m, 0.40 * bg_m  # hi 이상은 투명, lo 이하는 불투명
    alpha = np.clip((hi - m) / (hi - lo), 0.0, 1.0)

    # 가장자리에 섞인 마젠타를 걷어낸다: c = a*fg + (1-a)*bg  →  fg = (c - (1-a)*bg) / a
    a3 = alpha[..., None]
    fg = np.where(a3 > 0.01, (rgb - (1 - a3) * bg) / np.maximum(a3, 0.01), 0)
    fg = np.clip(fg, 0, 255)
    # 그래도 남는 보랏빛 테두리 제거. 이 게임 팔레트는 전부 min(R,B) <= G라서 넘치는 만큼 깎아도 안전하다.
    spill = np.maximum(magenta_score(fg), 0)
    fg[..., 0] -= spill
    fg[..., 2] -= spill

    alpha = clean(alpha, w, h)
    out = np.dstack([fg, alpha * 255]).astype(np.uint8)
    return Image.fromarray(out)


def clean(alpha: np.ndarray, w: int, h: int) -> np.ndarray:
    """오른쪽 아래 구석 워터마크와 잔티끌을 지운다."""
    lab, n = ndimage.label(alpha > 0.03)
    if n == 0:
        return alpha
    idx = range(1, n + 1)
    sizes = ndimage.sum(np.ones_like(alpha), lab, idx)
    means = ndimage.mean(alpha, lab, idx)
    boxes = ndimage.find_objects(lab)
    speck = 0.00003 * w * h
    for i, (sl, size, mean) in enumerate(zip(boxes, sizes, means), start=1):
        y0, x0 = sl[0].start, sl[1].start
        small = size < 0.01 * w * h
        # 제미나이 워터마크: 오른쪽 아래 구석의 작은 흰 반짝이. 보통 반투명이지만 큰 시트에선 진하게 나온다.
        watermark = (small and mean < 0.6 and x0 > 0.80 * w and y0 > 0.75 * h) or \
                    (size < 0.003 * w * h and x0 > 0.88 * w and y0 > 0.88 * h)
        faint = small and mean < 0.3
        if watermark or faint or size < speck:
            alpha[lab == i] = 0
    return alpha


def trim(img: Image.Image, pad: int = 4) -> Image.Image:
    box = img.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    if not box:
        return img
    x0, y0, x1, y1 = box
    return img.crop((max(x0 - pad, 0), max(y0 - pad, 0),
                     min(x1 + pad, img.width), min(y1 + pad, img.height)))


def fit(img: Image.Image, max_side: int) -> Image.Image:
    """줄이기만 한다. 반투명 가장자리 번짐을 막으려고 premultiplied로 줄인다."""
    s = max_side / max(img.size)
    if s >= 1:
        return img
    size = (max(1, round(img.width * s)), max(1, round(img.height * s)))
    return img.convert("RGBa").resize(size, Image.LANCZOS).convert("RGBA")


def split(img: Image.Image) -> list[Image.Image]:
    """떨어져 있는 조각을 하나씩 (윗줄부터, 왼쪽부터).

    가까운 조각(김, 부스러기)은 붙여서 한 덩이로 보고, 그래도 따로 떨어진 작은 조각
    (물줄기 방울, 반짝이, zzz)은 가장 가까운 큰 조각에 붙인다.
    """
    a = np.asarray(img.getchannel("A")) > 8
    grown = ndimage.binary_dilation(a, iterations=max(3, img.width // 200))
    lab, n = ndimage.label(grown)
    if n == 0:
        return []
    idx = range(1, n + 1)
    areas = np.array(ndimage.sum(a, lab, idx))
    boxes = ndimage.find_objects(lab)
    big = [i for i in idx if areas[i - 1] >= 0.06 * areas.max()]
    owner = {i: i for i in big}
    for i in idx:
        if i in owner or areas[i - 1] < 0.00005 * a.size:
            continue
        cy = (boxes[i - 1][0].start + boxes[i - 1][0].stop) / 2
        cx = (boxes[i - 1][1].start + boxes[i - 1][1].stop) / 2

        def dist(j: int) -> float:
            sy, sx = boxes[j - 1]
            dy = max(sy.start - cy, 0, cy - sy.stop)
            dx = max(sx.start - cx, 0, cx - sx.stop)
            return float(np.hypot(dx, dy))

        owner[i] = min(big, key=dist)

    arr = np.asarray(img)
    parts = []
    for j in big:
        mask = np.isin(lab, [i for i, o in owner.items() if o == j])
        ys, xs = np.nonzero(mask)
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        piece = arr[y0:y1, x0:x1].copy()
        piece[..., 3] = np.where(mask[y0:y1, x0:x1], piece[..., 3], 0)
        parts.append(((y0 + y1) / 2, (x0 + x1) / 2, y1 - y0, Image.fromarray(piece)))

    # 줄 나누기: 세로 중심이 조각 높이의 절반 넘게 벌어지면 다음 줄
    parts.sort(key=lambda t: t[0])
    rows: list[list] = []
    for p in parts:
        if rows and p[0] - rows[-1][-1][0] < 0.5 * p[2]:
            rows[-1].append(p)
        else:
            rows.append([p])
    return [p[3] for row in rows for p in sorted(row, key=lambda t: t[1])]


def frames(parts: list[Image.Image], max_side: int, anchor: str) -> list[Image.Image]:
    """모든 프레임을 같은 배율로 줄여 같은 크기 캔버스에 놓는다. anchor: bottom(발 기준) | center."""
    parts = [trim(p, pad=0) for p in parts]
    w = max(p.width for p in parts) + 8
    h = max(p.height for p in parts) + 8
    s = min(1.0, max_side / max(w, h))
    out = []
    for p in parts:
        canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        x = (w - p.width) // 2
        y = h - 4 - p.height if anchor == "bottom" else (h - p.height) // 2
        canvas.paste(p, (x, y))
        if s < 1:
            canvas = canvas.convert("RGBa").resize((round(w * s), round(h * s)), Image.LANCZOS).convert("RGBA")
        out.append(canvas)
    return out


def export_walk(path: Path) -> list[str]:
    sheet = key(Image.open(path))
    cw, ch = sheet.width // 4, sheet.height // 4
    cells = [[sheet.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch)) for c in range(4)] for r in range(4)]
    flip = lambda im: im.transpose(Image.FLIP_LEFT_RIGHT)
    right = [flip(cells[3][0]), cells[3][1], cells[3][2], cells[3][3]]
    rows = {
        "down": cells[0],
        "up": cells[1],
        "right": right,
        "left": [flip(im) for im in right],
    }
    # 모든 프레임을 같은 상자로 잘라야 걸을 때 몸이 흔들리지 않는다
    boxes = [im.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox() for fr in rows.values() for im in fr]
    boxes = [b for b in boxes if b]
    x0 = min(b[0] for b in boxes); y0 = min(b[1] for b in boxes)
    x1 = max(b[2] for b in boxes); y1 = max(b[3] for b in boxes)
    # 좌우는 셀 가운데를 기준으로 대칭이 되게 넓힌다
    half = max(cw / 2 - x0, x1 - cw / 2) + 4
    box = (int(cw / 2 - half), max(y0 - 4, 0), int(cw / 2 + half), min(y1 + 4, ch))
    names = []
    for d, frames in rows.items():
        for k, im in enumerate(frames, start=1):
            name = f"char_walk_{d}_{k:02d}"
            fit(im.crop(box), WALK_SIZE).save(OUT / f"{name}.png", optimize=True)
            names.append(name)
    return names


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    done, missing = [], []
    for prefix, name, kind, size in SPRITES:
        path = find_raw(prefix)
        if not path:
            missing.append(f"{prefix} → {name}")
            continue
        img = Image.open(path)
        if kind == "tile":
            tile = seamless(unwatermark(img.convert("RGB")))
            resize_tile(tile, size).save(OUT / f"{name}.png", optimize=True)
            done.append(name)
        elif kind == "sprite":
            fit(trim(key(img)), size).save(OUT / f"{name}.png", optimize=True)
            done.append(name)
        elif kind == "split":
            for k, part in enumerate(split(key(img)), start=1):
                n = f"{name}_{k:02d}"
                fit(trim(part), size).save(OUT / f"{n}.png", optimize=True)
                done.append(n)
        elif kind in ("frames", "fx"):
            anchor = "bottom" if kind == "frames" else "center"
            for k, fr in enumerate(frames(split(key(img)), size, anchor), start=1):
                n = f"{name}_{k:02d}"
                fr.save(OUT / f"{n}.png", optimize=True)
                done.append(n)
    walk = find_raw(WALK_SHEET)
    if walk:
        done += export_walk(walk)
    print(f"{len(done)}장 → {OUT.relative_to(ROOT)}")
    for n in done:
        print("  ", n)
    if missing:
        print("원본 없음:")
        for m in missing:
            print("  ", m)
    return 0


if __name__ == "__main__":
    sys.exit(main())
