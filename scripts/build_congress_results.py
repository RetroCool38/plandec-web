"""Transform 2026 Registraduria pre-count MMV files for one department."""

from __future__ import annotations

import json
import sys
import zipfile
from collections import defaultdict
from pathlib import Path


SPECIAL_CANDIDATES = {
    "996": "VOTOS EN BLANCO",
    "997": "VOTOS NULOS",
    "998": "VOTOS NO MARCADOS",
}
CORPORATIONS = {
    "001": ("Senado", "SEN_MMV_9999.txt"),
    "002": ("Cámara de Representantes", "CAM_MMV_9999.txt"),
    "006": ("Consultas", "CNS_MMV_9999.txt"),
}


def basic_member(names: list[str], needle: str) -> str:
    return next(name for name in names if needle in name)


def load_basics(path: Path):
    parties = {}
    candidates = {}
    fallback = {}
    with zipfile.ZipFile(path) as archive:
        names = archive.namelist()
        party_member = basic_member(names, "PARTIDOS_")
        for raw in archive.open(party_member):
            line = raw.decode("latin-1").rstrip("\r\n")
            parties[line[0:5]] = line[5:205].strip()

        candidate_member = basic_member(names, "CANDIDATOS_")
        for raw in archive.open(candidate_member):
            line = raw.decode("latin-1").rstrip("\r\n")
            if len(line) < 120:
                continue
            corporation, circ, department = line[0:3], line[3:4], line[4:6]
            party, candidate = line[11:16], line[16:19]
            name = " ".join(part.strip() for part in (line[20:70], line[70:120]) if part.strip())
            candidates[(corporation, circ, department, party, candidate)] = name
            fallback[(corporation, circ, party, candidate)] = name
    return parties, candidates, fallback


def candidate_name(corporation, circ, department, party, candidate, parties, candidates, fallback):
    if candidate in SPECIAL_CANDIDATES:
        return SPECIAL_CANDIDATES[candidate], "Candidatos totales"
    party_name = parties.get(party, party)
    name = candidates.get((corporation, circ, department, party, candidate))
    name = name or candidates.get((corporation, circ, "00", party, candidate))
    name = name or fallback.get((corporation, circ, party, candidate))
    if candidate == "000":
        name = name or party_name
    return name or f"CANDIDATO {candidate}", party_name


def transform(source: Path, department_code: str, slug: str, basics: Path, output_dir: Path):
    parties, candidates, fallback = load_basics(basics)
    catalog = []
    for corporation, (title, filename) in CORPORATIONS.items():
        source_file = source / filename
        if not source_file.exists():
            continue
        totals = defaultdict(lambda: defaultdict(int))
        with source_file.open("r", encoding="ascii", newline="") as handle:
            for line in handle:
                if line[0:2] != department_code:
                    continue
                municipality, zone, place = line[2:5], line[5:7], line[7:9]
                circ, party, candidate = line[21:22], line[22:27], line[27:30]
                votes = int(line[30:38])
                totals[f"{municipality}-{zone}-{place}"][(circ, party, candidate)] += votes

        payload = {}
        for place_key, result_rows in totals.items():
            rendered = []
            for (circ, party, candidate), votes in sorted(result_rows.items(), key=lambda item: item[1], reverse=True):
                name, party_name = candidate_name(corporation, circ, department_code, party, candidate, parties, candidates, fallback)
                rendered.append({"candidato": name, "partido": party_name, "codigo": f"{party}-{candidate}", "votos": votes})
            payload[place_key] = rendered

        output_name = f"resultados_{slug}_2026_{corporation}.json"
        output_path = output_dir / output_name
        output_path.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        catalog.append({
            "id": f"2026-{corporation}",
            "year": 2026,
            "corporation": corporation,
            "title": title,
            "label": f"{title} 2026",
            "file": f"/data/{output_name}",
            "places": len(payload),
            "size": output_path.stat().st_size,
        })
    return catalog


def main() -> None:
    if len(sys.argv) != 7:
        raise SystemExit("Usage: build_congress_results.py DEPARTMENT_CODE SLUG PRECOUNT_DIR BASICS_ZIP OUTPUT_DIR CATALOG")
    department_code, slug = sys.argv[1], sys.argv[2]
    pre_count, basics, output_dir = Path(sys.argv[3]), Path(sys.argv[4]), Path(sys.argv[5])
    catalog_path = output_dir / sys.argv[6]
    existing = json.loads(catalog_path.read_text(encoding="utf-8")) if catalog_path.exists() else []
    existing = [item for item in existing if item["year"] != 2026]
    existing.extend(transform(pre_count, department_code, slug, basics, output_dir))
    existing.sort(key=lambda item: (item["year"], item["corporation"]))
    catalog_path.write_text(json.dumps(existing, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(existing, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
