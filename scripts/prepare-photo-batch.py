#!/usr/bin/env python3
"""Prepare the 2026-09-09 vehicle photo batch and its import manifest."""

from __future__ import annotations

import hashlib
import json
import shutil
import uuid
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BATCH = ROOT / "import-auto" / "2026-09-09"
SOURCE = BATCH / "originali"
READY = BATCH / "foto-pronte"
MANIFEST = BATCH / "auto-da-pubblicare.json"
NAMESPACE = uuid.UUID("c8f34aa7-10bd-447d-a129-b1e49f87d24f")


CARS = [
    {
        "slug": "renault-kadjar-import-20260909",
        "brand": "Renault",
        "model": "Kadjar",
        "version": None,
        "description": "SUV spazioso e versatile con cambio automatico, abitacolo confortevole e ampio vano bagagli. Una proposta pratica per la famiglia e i viaggi, con posizione di guida rialzata e una dotazione completa per l'uso quotidiano.",
        "year": None,
        "kilometers": 189080,
        "price": 8900,
        "fuel": "Diesel",
        "transmission": "Automatico",
        "color": "Bianco",
        "power_cv": None,
        "optional_features": ["Navigatore", "Climatizzatore automatico", "Cruise control", "Sensori di parcheggio", "Cerchi in lega"],
        "photos": [9, 17, 8, 6, 5, 3, 7, 1, 2],
    },
    {
        "slug": "audi-a4-avant-import-20260909",
        "brand": "Audi",
        "model": "A4 Avant",
        "version": None,
        "description": "Station wagon elegante e versatile, pensata per offrire comfort, spazio e una guida piacevole. La linea sobria e il pratico vano di carico la rendono adatta sia agli spostamenti quotidiani sia ai viaggi.",
        "year": None,
        "kilometers": None,
        "price": 18900,
        "fuel": None,
        "transmission": None,
        "color": "Argento",
        "power_cv": None,
        "optional_features": ["Cerchi in lega", "Barre al tetto"],
        "photos": [4],
    },
    {
        "slug": "volkswagen-polo-import-20260909",
        "brand": "Volkswagen",
        "model": "Polo",
        "version": None,
        "description": "Compatta pratica e maneggevole, ideale per la città ma confortevole anche nei tragitti più lunghi. Gli interni sono ordinati e funzionali, con dimensioni esterne contenute e una buona abitabilità.",
        "year": None,
        "kilometers": 41099,
        "price": 5900,
        "fuel": "Benzina",
        "transmission": "Manuale",
        "color": "Argento",
        "power_cv": None,
        "optional_features": ["Climatizzatore", "Autoradio", "Cerchi in lega"],
        "photos": [18, 27, 15, 16, 12, 13, 14, 11, 10],
    },
    {
        "slug": "fiat-500x-import-20260909",
        "brand": "Fiat",
        "model": "500X",
        "version": None,
        "description": "Crossover dal design riconoscibile, con posizione di guida rialzata e cambio automatico. Offre un abitacolo accogliente, buona versatilità e dimensioni adatte sia alla città sia ai viaggi.",
        "year": None,
        "kilometers": 84561,
        "price": 16900,
        "fuel": "Benzina",
        "transmission": "Automatico",
        "color": "Blu",
        "power_cv": None,
        "optional_features": ["Navigatore", "Climatizzatore automatico", "Cruise control", "Sensori di parcheggio", "Cerchi in lega"],
        "photos": [25, 22, 23, 24, 20, 21, 26, 19],
    },
    {
        "slug": "suzuki-ignis-hybrid-allgrip-import-20260909",
        "brand": "Suzuki",
        "model": "Ignis",
        "version": "Hybrid AllGrip",
        "description": "City SUV compatto con alimentazione ibrida e trazione integrale AllGrip. Agile negli spazi urbani e versatile fuori città, offre una seduta rialzata e un abitacolo pratico e luminoso.",
        "year": None,
        "kilometers": 105309,
        "price": 12500,
        "fuel": "Ibrida benzina",
        "transmission": "Manuale",
        "color": "Rosso",
        "power_cv": None,
        "optional_features": ["Trazione integrale", "Navigatore", "Climatizzatore", "Cerchi in lega", "Barre al tetto"],
        "photos": [35, 34, 32, 42, 29, 30, 31, 28, 33],
    },
    {
        "slug": "nissan-navara-import-20260909",
        "brand": "Nissan",
        "model": "Navara",
        "version": None,
        "description": "Pick-up robusto e versatile con doppia cabina, cambio manuale e trazione integrale inseribile. Il cassone ampio e l'abitacolo completo lo rendono adatto al lavoro, al tempo libero e ai percorsi più impegnativi.",
        "year": None,
        "kilometers": 197430,
        "price": 10900,
        "fuel": "Diesel",
        "transmission": "Manuale",
        "color": "Nero",
        "power_cv": None,
        "optional_features": ["Trazione integrale", "Riduttore", "Climatizzatore", "Autoradio", "Pedane laterali"],
        "photos": [43, 41, 39, 40, 38, 37, 36],
    },
    {
        "slug": "smart-fortwo-mhd-import-20260909",
        "brand": "Smart",
        "model": "Fortwo",
        "version": "mhd",
        "description": "City car compatta a due posti, facile da parcheggiare e ideale per gli spostamenti urbani. Il cambio automatico e il tetto panoramico rendono la guida semplice e piacevole anche nell'uso quotidiano.",
        "year": None,
        "kilometers": 199996,
        "price": 4900,
        "fuel": "Benzina",
        "transmission": "Automatico",
        "color": "Argento",
        "power_cv": None,
        "optional_features": ["Tetto panoramico", "Climatizzatore", "Cerchi in lega", "Autoradio"],
        "photos": [55, 51, 47, 49, 45, 46, 48, 44, 50],
    },
    {
        "slug": "suzuki-s-cross-import-20260909",
        "brand": "Suzuki",
        "model": "S-Cross",
        "version": None,
        "description": "Crossover spazioso e concreto, con una buona altezza da terra e un abitacolo versatile. Il cambio manuale e il motore diesel ne fanno una soluzione adatta a chi percorre molti chilometri senza rinunciare al comfort.",
        "year": None,
        "kilometers": 54094,
        "price": 15900,
        "fuel": "Diesel",
        "transmission": "Manuale",
        "color": "Bianco",
        "power_cv": None,
        "optional_features": ["Navigatore", "Climatizzatore automatico", "Cruise control", "Sensori di parcheggio", "Cerchi in lega"],
        "photos": [60, 59, 58, 57, 54, 56, 53, 52],
    },
    {
        "slug": "renault-clio-gpl-import-20260909",
        "brand": "Renault",
        "model": "Clio",
        "version": None,
        "description": "Berlina compatta moderna e ben rifinita, con alimentazione benzina/GPL pensata per contenere i costi di utilizzo. Offre un abitacolo curato, un sistema multimediale centrale e una guida comoda e intuitiva.",
        "year": None,
        "kilometers": 21416,
        "price": 17500,
        "fuel": "Benzina/GPL",
        "transmission": "Manuale",
        "color": "Rosso",
        "power_cv": None,
        "optional_features": ["Navigatore", "Apple CarPlay/Android Auto", "Climatizzatore", "Cruise control", "Sensori di parcheggio", "Cerchi in lega"],
        "photos": [69, 68, 81, 67, 66, 64, 62, 65, 71, 63, 61],
    },
    {
        "slug": "volvo-s90-b5-import-20260909",
        "brand": "Volvo",
        "model": "S90",
        "version": "B5",
        "description": "Berlina di rappresentanza elegante e confortevole, con cambio automatico, interni in pelle e un ambiente di bordo curato. Offre grande spazio, tecnologia moderna e un'impostazione ideale per i lunghi viaggi.",
        "year": None,
        "kilometers": 235294,
        "price": 19900,
        "fuel": None,
        "transmission": "Automatico",
        "color": "Bianco",
        "power_cv": None,
        "optional_features": ["Interni in pelle", "Navigatore", "Apple CarPlay/Android Auto", "Climatizzatore automatico", "Sensori di parcheggio", "Cerchi in lega"],
        "photos": [78, 79, 80, 75, 77, 73, 74, 76, 72, 70],
    },
]


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> None:
    READY.mkdir(parents=True, exist_ok=True)
    assigned: set[int] = set()
    manifest_cars = []

    for car in CARS:
        car_id = str(uuid.uuid5(NAMESPACE, car["slug"]))
        photos = []
        for position, image_number in enumerate(car.pop("photos")):
            if image_number in assigned:
                raise RuntimeError(f"Photo {image_number:03d} assigned more than once")
            assigned.add(image_number)
            source = SOURCE / f"{image_number:03d}.jpeg"
            target = READY / source.name
            if not source.exists():
                raise FileNotFoundError(source)
            shutil.copy2(source, target)
            photos.append(
                {
                    "source": str(source.relative_to(ROOT)).replace("\\", "/"),
                    "file": str(target.relative_to(ROOT)).replace("\\", "/"),
                    "position": position,
                    "is_primary": position == 0,
                    "sha256": sha256(target),
                }
            )

        manifest_cars.append({"id": car_id, **car, "photos": photos})

    source_numbers = {int(path.stem) for path in SOURCE.glob("*.jpeg")}
    if assigned != source_numbers:
        missing = sorted(source_numbers - assigned)
        extra = sorted(assigned - source_numbers)
        raise RuntimeError(f"Photo assignment mismatch; missing={missing}, extra={extra}")

    manifest = {
        "batch": "2026-09-09",
        "status": "ready",
        "cars": manifest_cars,
        "summary": {"cars": len(manifest_cars), "photos": len(assigned)},
    }
    MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Prepared {len(manifest_cars)} cars and {len(assigned)} photos")
    print(MANIFEST)


if __name__ == "__main__":
    main()
