"""Transform Registraduria MMV territorial CSV files into web result catalogs."""

from __future__ import annotations

import csv
import json
import sys
from collections import defaultdict
from pathlib import Path


TITLES = {
    "001": "Gobernación",
    "002": "Asamblea",
    "003": "Alcaldía",
    "004": "Concejo",
    "005": "JAL",
}


def transform(source: Path, year: int, slug: str, output_dir: Path) -> list[dict]:
    by_corporation: dict[str, dict[str, dict[tuple[str, str, str], int]]] = defaultdict(
        lambda: defaultdict(lambda: defaultdict(int))
    )

    with source.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            corporation = row["Código Corporación"].zfill(3)
            if corporation not in TITLES:
                continue
            place_key = "-".join((
                row["Código Municipio"].zfill(3),
                row["Código Zona"].zfill(2),
                row["Código Puesto"].zfill(2),
            ))
            candidate_key = (
                row["Código Partido"].zfill(5),
                row["Código Candidato"].zfill(5),
                row["Nombre Candidato"].strip(),
                row["Nombre Partido"].strip(),
            )
            by_corporation[corporation][place_key][candidate_key] += int(row["Total Votos"] or 0)

    catalog = []
    for corporation, places in sorted(by_corporation.items()):
        payload = {}
        for place_key, candidates in places.items():
            payload[place_key] = [
                {"candidato": candidate, "partido": party, "codigo": f"{party_code}-{candidate_code}", "votos": votes}
                for (party_code, candidate_code, candidate, party), votes in sorted(candidates.items(), key=lambda item: item[1], reverse=True)
            ]
        filename = f"resultados_{slug}_{year}_{corporation}.json"
        output_path = output_dir / filename
        output_path.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        title = TITLES[corporation]
        catalog.append({
            "id": f"{year}-{corporation}",
            "year": year,
            "corporation": corporation,
            "title": title,
            "label": f"{title} {year}",
            "file": f"/data/{filename}",
            "places": len(payload),
            "size": output_path.stat().st_size,
        })
    return catalog


def main() -> None:
    if len(sys.argv) < 6 or (len(sys.argv) - 4) % 2:
        raise SystemExit("Usage: build_territorial_results.py SLUG CATALOG OUT_DIR YEAR CSV [YEAR CSV ...]")
    slug, catalog_name, output_dir = sys.argv[1], sys.argv[2], Path(sys.argv[3])
    output_dir.mkdir(parents=True, exist_ok=True)
    catalog = []
    for index in range(4, len(sys.argv), 2):
        catalog.extend(transform(Path(sys.argv[index + 1]), int(sys.argv[index]), slug, output_dir))
    catalog.sort(key=lambda item: (item["year"], item["corporation"]))
    (output_dir / catalog_name).write_text(json.dumps(catalog, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(catalog, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
