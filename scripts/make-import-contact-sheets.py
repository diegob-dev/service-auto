"""Create labelled contact sheets for reviewing a local vehicle-photo import."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path("import-auto/2026-09-09")
SOURCE = ROOT / "originali"
OUTPUT = ROOT / "contact-sheets"
THUMBNAIL = (300, 225)
COLUMNS = 4
ROWS = 4
LABEL_HEIGHT = 30


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    files = sorted(SOURCE.glob("*.jpeg"))
    font = ImageFont.load_default(size=18)
    page_size = (COLUMNS * THUMBNAIL[0], ROWS * (THUMBNAIL[1] + LABEL_HEIGHT))

    for page_number, start in enumerate(range(0, len(files), COLUMNS * ROWS), 1):
        page = Image.new("RGB", page_size, "white")
        draw = ImageDraw.Draw(page)
        for index, path in enumerate(files[start : start + COLUMNS * ROWS]):
            image = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
            image.thumbnail(THUMBNAIL, Image.Resampling.LANCZOS)
            cell_x = (index % COLUMNS) * THUMBNAIL[0]
            cell_y = (index // COLUMNS) * (THUMBNAIL[1] + LABEL_HEIGHT)
            x = cell_x + (THUMBNAIL[0] - image.width) // 2
            y = cell_y + (THUMBNAIL[1] - image.height) // 2
            page.paste(image, (x, y))
            draw.text((cell_x + 8, cell_y + THUMBNAIL[1] + 5), path.stem, fill="black", font=font)
        page.save(OUTPUT / f"sheet-{page_number:02}.jpg", quality=92)

    print(f"Created {page_number} contact sheets for {len(files)} images.")


if __name__ == "__main__":
    main()
