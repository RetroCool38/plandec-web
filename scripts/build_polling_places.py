"""Build georeferenced 2023 polling-place layers from official public data."""

from __future__ import annotations

import csv
import difflib
import json
import re
import sys
import unicodedata
from collections import defaultdict
from pathlib import Path


def normalize(value: str) -> str:
    value = unicodedata.normalize("NFD", value or "")
    value = "".join(char for char in value if unicodedata.category(char) != "Mn")
    return re.sub(r"[^A-Z0-9]+", " ", value.upper()).strip()


def load_mmv(path: Path) -> dict[tuple[str, str], dict]:
    places: dict[tuple[str, str], dict] = {}
    with path.open("r", encoding="utf-8-sig", newline="") as source:
        reader = csv.DictReader(source)
        for row in reader:
            municipality = row["Nombre Municipio"].strip()
            name = row["Nombre Puesto"].strip()
            key = (normalize(municipality), normalize(name))
            record = places.setdefault(key, {
                "municipio": municipality,
                "puesto": name,
                "codigo_municipio_electoral": row["Código Municipio"].zfill(3),
                "codigo_zona": row["Código Zona"].zfill(2),
                "codigo_puesto": row["Código Puesto"].zfill(2),
                "mesas": set(),
            })
            record["mesas"].add(row["Mesa"].strip())
    return places


def best_match(
    municipality: str,
    place_name: str,
    by_municipality: dict[str, list[tuple[str, dict]]],
) -> tuple[dict | None, str]:
    municipality_key = normalize(municipality)
    name_key = normalize(place_name)
    candidates = by_municipality.get(municipality_key, [])
    exact = next((record for candidate_name, record in candidates if candidate_name == name_key), None)
    if exact:
        return exact, "exact"
    if not candidates:
        return None, "unmatched"
    scored = sorted(
        ((difflib.SequenceMatcher(None, name_key, candidate_name).ratio(), record) for candidate_name, record in candidates),
        key=lambda item: item[0],
        reverse=True,
    )
    return (scored[0][1], "fuzzy") if scored[0][0] >= 0.82 else (None, "unmatched")


def main() -> None:
    if len(sys.argv) != 6:
        raise SystemExit("Usage: build_polling_places.py DIVIPOLE OUT_DIR BOGOTA_CSV CUNDINAMARCA_CSV NORTE_CSV")

    divipole_path, output_dir, bogota_path, cundinamarca_path, norte_path = map(Path, sys.argv[1:])
    output_dir.mkdir(parents=True, exist_ok=True)
    sources = {
        "BOGOTA D C": (bogota_path, "puestos_votacion_bogota_2023.geojson"),
        "CUNDINAMARCA": (cundinamarca_path, "puestos_votacion_cundinamarca_2023.geojson"),
        "NORTE DE SAN": (norte_path, "puestos_votacion_norte_de_santander_2023.geojson"),
    }

    official_rows: dict[str, list[dict]] = defaultdict(list)
    with divipole_path.open("r", encoding="utf-8-sig", newline="") as source:
        for row in csv.DictReader(source):
            official_rows[normalize(row["departamento"])].append(row)

    report = {}
    for department_key, (mmv_path, output_name) in sources.items():
        mmv_places = load_mmv(mmv_path)
        by_municipality: dict[str, list[tuple[str, dict]]] = defaultdict(list)
        for (municipality_key, name_key), record in mmv_places.items():
            by_municipality[municipality_key].append((name_key, record))

        features = []
        counts = defaultdict(int)
        for official in official_rows[department_key]:
            match, match_type = best_match(official["municipio"], official["puesto"], by_municipality)
            counts[match_type] += 1
            properties = {
                "municipio": official["municipio"],
                "puesto": official["puesto"],
                "direccion": official["direccion"],
                "comuna": official["comuna"],
                "codigo_municipio_electoral": match["codigo_municipio_electoral"] if match else "",
                "codigo_zona": match["codigo_zona"] if match else "",
                "codigo_puesto": match["codigo_puesto"] if match else "",
                "mesas": len(match["mesas"]) if match else 0,
                "coincidencia": match_type,
            }
            features.append({
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [float(official["longitud"]), float(official["latitud"])]},
                "properties": properties,
            })

        output_path = output_dir / output_name
        output_path.write_text(json.dumps({"type": "FeatureCollection", "features": features}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        report[department_key] = {"official_places": len(features), **counts, "output": output_name}

    (output_dir / "puestos_votacion_2023_reporte.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
