"""Regenerate landing-page assets: python -m pip install Pillow; python tools/optimize-images.py."""

from pathlib import Path
import json
import re

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "optimized"
MANIFEST = OUTPUT / "manifest.json"


def generate():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    # Original files remain the source of truth; names are stable across rebuilds.
    sources = [
        "HeroImage.png", "white-label.png",
        "screen-stages.png", "screen-library.png", "screen-evaluation.png", "screen-analytics.png",
        "rollfinity.webp", "rollersider.webp", "funkyrollers.webp", "madrollers.png", "osc.png",
        "Olympia Sports Institution.png", "Alpha X sports.png", "ProSkatingBy.png", "Ramy Squash.png",
        "Rolloryx 2024.webp", "Tiba Gymnastics.png", "UAE Rollball.webp", "UAE Skateball.png",
        "Shahdag.png", "Zayed Sports City.png", "azerbaijan.png", "ISMF.png", "GFSF.png",
        "who-academies-dashboard.png", "who-academies-phone.png", "who-academies-skaters-scene.png",
        "who-complexes-phone.png", "who-events-judges.jpg", "who-events-race.JPG",
    ]
    manifest = {}
    for source in sources:
        with Image.open(ROOT / source) as image:
            slug = re.sub(r"[^a-z0-9]+", "-", Path(source).stem.lower()).strip("-")
            is_screen = source.startswith("screen-") or source == "white-label.png"
            limit = 1024 if is_screen else 1280 if source.startswith("who-") or source == "HeroImage.png" else 384
            widths = [640, 1024] if is_screen else [limit]
            variants = []
            for width in widths:
                resized = image.copy()
                resized.thumbnail((width, width * 2 if is_screen else width), Image.Resampling.LANCZOS)
                filename = f"{slug}-{width}.webp"
                resized.save(OUTPUT / filename, "WEBP", quality=86, method=6)
                variants.append({"src": f"assets/optimized/{filename}", "width": resized.width})
            manifest[source] = {"width": image.width, "height": image.height, "variants": variants}
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n")


if __name__ == "__main__":
    generate()
