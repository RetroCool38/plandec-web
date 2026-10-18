"""Build 2026 polling-place GeoJSON files from the official DIVIPOL PDF.

Source (cut-off date 2026-01-30):
https://wapp.registraduria.gov.co/electoral/2026/congreso-de-la-republica/IMG/pdf/Divipole_definitiva_%20Elecciones_Congreso_2026_GEO_CITREP_Exterior_L_V_v5.pdf

Usage:
    python scripts/update_polling_places_2026.py path/to/divipol.pdf
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

import pdfplumber


DEPARTMENTS = {
    "03": ("atlantico", "ATLANTICO"),
    "15": ("cundinamarca", "CUNDINAMARCA"),
    "16": ("bogota", "BOGOTA D. C."),
    "25": ("norte_de_santander", "NORTE DE SANTANDER"),
}

EXPECTED_COUNTS = {
    "atlantico": 345,
    "cundinamarca": 684,
    "bogota": 1083,
    "norte_de_santander": 472,
}


def clean(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "").replace("\ufffd", "")).strip()


def feature(row: list[object], page_number: int) -> dict:
    department_code, municipality_code, zone_code, place_code = map(clean, row[:4])
    slug, department_name = DEPARTMENTS[department_code]
    latitude = float(clean(row[13]))
    longitude = float(clean(row[14]))
    return {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [longitude, latitude]},
        "properties": {
            "departamento": department_name,
            "municipio": clean(row[5]),
            "puesto": clean(row[6]),
            "comuna": clean(row[7]),
            "direccion": clean(row[8]),
            "mesas": int(clean(row[12]) or 0),
            "censo_mujeres": int(clean(row[9]) or 0),
            "censo_hombres": int(clean(row[10]) or 0),
            "censo_total": int(clean(row[11]) or 0),
            "calidad_coordenada": "divipol_definitivo_2026",
            "pagina_fuente": page_number,
            "codigo_departamento_electoral": department_code,
            "codigo_municipio_electoral": municipality_code.zfill(3),
            "codigo_zona": zone_code.zfill(2),
            "codigo_puesto": place_code.zfill(2),
        },
        "_slug": slug,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf", type=Path)
    parser.add_argument("--output", type=Path, default=Path("public/data"))
    args = parser.parse_args()

    grouped: dict[str, list[dict]] = {value[0]: [] for value in DEPARTMENTS.values()}
    seen: set[tuple[str, str, str, str]] = set()

    with pdfplumber.open(args.pdf) as pdf:
        for page_number, page in enumerate(pdf.pages, start=1):
            for row in page.extract_table() or []:
                if len(row) < 15 or clean(row[0]) not in DEPARTMENTS:
                    continue
                try:
                    item = feature(row, page_number)
                except (TypeError, ValueError):
                    continue
                props = item["properties"]
                key = (
                    props["codigo_departamento_electoral"],
                    props["codigo_municipio_electoral"],
                    props["codigo_zona"],
                    props["codigo_puesto"],
                )
                if key in seen:
                    continue
                seen.add(key)
                slug = item.pop("_slug")
                grouped[slug].append(item)

    args.output.mkdir(parents=True, exist_ok=True)
    for slug, features in grouped.items():
        if len(features) != EXPECTED_COUNTS[slug]:
            raise RuntimeError(
                f"Unexpected number of {slug} polling places: "
                f"{len(features)} (expected {EXPECTED_COUNTS[slug]})"
            )
        features.sort(
            key=lambda item: (
                item["properties"]["codigo_municipio_electoral"],
                item["properties"]["codigo_zona"],
                item["properties"]["codigo_puesto"],
            )
        )
        target = args.output / f"puestos_votacion_{slug}_2026.geojson"
        target.write_text(
            json.dumps({"type": "FeatureCollection", "features": features}, ensure_ascii=False),
            encoding="utf-8",
        )
        print(f"{target}: {len(features)} puestos")


if __name__ == "__main__":
    main()
