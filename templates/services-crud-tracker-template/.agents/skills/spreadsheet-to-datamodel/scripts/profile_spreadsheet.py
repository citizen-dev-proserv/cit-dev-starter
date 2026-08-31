#!/usr/bin/env python3
"""Profile a spreadsheet (.csv / .xlsx / .xlsm) into a Rayfin-oriented data-model report.

This is the *deterministic* half of the `spreadsheet-to-datamodel` skill. It does
NOT decide the final data model — it produces a structured JSON profile that an
AI agent reviews (the "vibe coding" step) to author `rayfin/data/*.ts` entities.

What it does:
  - Enumerates every sheet (CSV = one implicit sheet).
  - Detects the header row heuristically.
  - Infers a Rayfin decorator per column (@int/@decimal/@date/@boolean/@email/@text).
  - Reports null %, distinct count, sample values, and a suggested @text max length.
  - Nominates a candidate primary key per sheet.
  - Proposes cross-sheet relationships (@one) by matching a column's value
    set against another sheet's candidate key.
  - Flags VBA macros in .xlsm (surfaced as notes only — macros are NEVER executed).

Usage:
  python profile_spreadsheet.py <path> [--json out.json] [--sample-rows 200] [--draft-entities]

Output: JSON on stdout (or to --json). Exit code 0 on success, non-zero on error.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import warnings
from pathlib import Path
from typing import Any

try:
    import pandas as pd
except ImportError:  # pragma: no cover - dependency guard
    sys.stderr.write(
        "Missing dependency: pandas. Install with:\n"
        "  pip install -r requirements.txt\n"
    )
    sys.exit(2)

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
BOOL_TRUE = {"true", "yes", "y", "1", "t"}
BOOL_FALSE = {"false", "no", "n", "0", "f"}
IDENTIFIER_HINTS = ("id", "code", "key", "number", "no")


def _slug(name: str) -> str:
    """Turn a sheet/column label into a TS-safe PascalCase identifier stem."""
    cleaned = re.sub(r"[^0-9a-zA-Z]+", " ", str(name)).strip()
    return "".join(w.capitalize() for w in cleaned.split()) or "Field"


def _camel(name: str) -> str:
    p = _slug(name)
    return p[:1].lower() + p[1:] if p else "field"


def _round_up_len(n: int) -> int:
    """Suggest a sane @text max: next bucket up, min 20, cap 4000."""
    for bucket in (20, 40, 60, 80, 120, 200, 400, 1000, 2000, 4000):
        if n <= bucket:
            return bucket
    return 4000


def _is_intlike(series: "pd.Series") -> bool:
    s = pd.to_numeric(series, errors="coerce")
    if s.isna().any():
        return False
    return bool((s.dropna() % 1 == 0).all())


def _is_floatlike(series: "pd.Series") -> bool:
    s = pd.to_numeric(series, errors="coerce")
    return not s.isna().any()


def _is_datelike(series: "pd.Series") -> bool:
    # Avoid treating plain numbers (e.g. hours) as epoch dates.
    if _is_floatlike(series):
        return False
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        parsed = pd.to_datetime(series, errors="coerce")
    return not parsed.isna().any()


def _is_boollike(values: list[str]) -> bool:
    lowered = {v.strip().lower() for v in values}
    return 0 < len(lowered) <= 2 and lowered.issubset(BOOL_TRUE | BOOL_FALSE)


def _is_emaillike(values: list[str]) -> bool:
    return len(values) > 0 and all(EMAIL_RE.match(v.strip()) for v in values)


def infer_column(series: "pd.Series") -> dict[str, Any]:
    """Infer a Rayfin decorator and metadata for one column."""
    non_null = series.dropna()
    total = int(len(series))
    n = int(len(non_null))
    null_pct = round((total - n) / total * 100, 1) if total else 0.0
    distinct = int(non_null.nunique())
    str_values = [str(v) for v in non_null.tolist()]
    max_len = max((len(v) for v in str_values), default=0)

    if n == 0:
        decorator, detail, ts = "@text", {"max": 200}, "string"
    elif _is_boollike(str_values):
        decorator, detail, ts = "@boolean", {}, "boolean"
    elif _is_intlike(non_null):
        decorator, detail, ts = "@int", {}, "number"
    elif _is_floatlike(non_null):
        decorator, detail, ts = "@decimal", {"precision": 18, "scale": 2}, "number"
    elif _is_datelike(non_null):
        decorator, detail, ts = "@date", {}, "Date"
    elif _is_emaillike(str_values):
        decorator, detail, ts = "@email", {}, "string"
    else:
        decorator, detail, ts = "@text", {"max": _round_up_len(max_len)}, "string"

    unique = n > 0 and distinct == n
    return {
        "decorator": decorator,
        "decoratorArgs": detail,
        "tsType": ts,
        "nullPct": null_pct,
        "distinct": distinct,
        "unique": unique,
        "maxLength": max_len,
        "sampleValues": str_values[:5],
    }


def _detect_header_offset(raw: "pd.DataFrame", max_scan: int = 10) -> int:
    """Find the first row that looks like a header (mostly non-null, non-numeric)."""
    for i in range(min(max_scan, len(raw))):
        row = raw.iloc[i]
        non_null = row.dropna()
        if len(non_null) < max(1, len(row) // 2):
            continue
        numeric = sum(
            1 for v in non_null if isinstance(v, (int, float)) and not isinstance(v, bool)
        )
        if numeric <= len(non_null) // 2:
            return i
    return 0


def _read_sheet(path: Path, sheet_name: str | None, sample_rows: int) -> "pd.DataFrame":
    ext = path.suffix.lower()
    if ext == ".csv":
        raw = pd.read_csv(
            path, header=None, dtype=str, keep_default_na=True, nrows=sample_rows + 15
        )
    else:
        raw = pd.read_excel(
            path, sheet_name=sheet_name, header=None, dtype=object, nrows=sample_rows + 15
        )
    offset = _detect_header_offset(raw)
    header = [
        str(c).strip() if pd.notna(c) else f"col_{i}"
        for i, c in enumerate(raw.iloc[offset])
    ]
    body = raw.iloc[offset + 1 : offset + 1 + sample_rows].copy()
    body.columns = header
    body = body.dropna(axis=1, how="all").dropna(axis=0, how="all")
    return body


def _candidate_key(columns: list[dict[str, Any]]) -> str | None:
    """Pick the best primary-key candidate: unique, no nulls, id/code-named preferred."""
    unique_cols = [c for c in columns if c["unique"] and c["nullPct"] == 0.0]
    if not unique_cols:
        return None

    def score(c: dict[str, Any]) -> tuple[int, int]:
        name = c["name"].lower()
        named = any(name == h or name.endswith("_" + h) or name.endswith(h) for h in IDENTIFIER_HINTS)
        typed = c["decorator"] in ("@int", "@uuid")
        return (int(named), int(typed))

    return max(unique_cols, key=score)["name"]


def profile_file(path: Path, sample_rows: int) -> dict[str, Any]:
    ext = path.suffix.lower()
    notes: list[str] = []
    sheets: list[dict[str, Any]] = []

    if ext == ".csv":
        sheet_names: list[str] = [path.stem]
    else:
        sheet_names = list(pd.ExcelFile(path).sheet_names)

    if ext == ".xlsm":
        notes.append(
            "File is macro-enabled (.xlsm). Macros were NOT executed. Treat any VBA "
            "logic as documentation hints only; derive the data model from the data."
        )

    for sheet in sheet_names:
        df = _read_sheet(path, None if ext == ".csv" else sheet, sample_rows)
        if df.shape[1] == 0:
            continue
        columns: list[dict[str, Any]] = []
        for col in df.columns:
            info = infer_column(df[col])
            info["name"] = str(col)
            info["fieldName"] = _camel(col)
            columns.append(info)
        sheets.append(
            {
                "sheet": str(sheet),
                "entityName": _slug(sheet),
                "rowsSampled": int(df.shape[0]),
                "candidateKey": _candidate_key(columns),
                "columns": columns,
            }
        )

    return {
        "file": path.name,
        "format": ext.lstrip("."),
        "sheetCount": len(sheets),
        "notes": notes,
        "sheets": sheets,
        "relationships": _infer_relationships(path, sheets, sample_rows, ext),
    }


def _infer_relationships(
    path: Path, sheets: list[dict[str, Any]], sample_rows: int, ext: str
) -> list[dict[str, Any]]:
    """Propose FK relationships: a column whose values are a subset of another sheet's key."""
    key_sets: dict[str, set[str]] = {}
    for s in sheets:
        if not s["candidateKey"]:
            continue
        df = _read_sheet(path, None if ext == ".csv" else s["sheet"], sample_rows)
        if s["candidateKey"] in df.columns:
            key_sets[s["entityName"]] = {str(v) for v in df[s["candidateKey"]].dropna().tolist()}

    rels: list[dict[str, Any]] = []
    for s in sheets:
        df = _read_sheet(path, None if ext == ".csv" else s["sheet"], sample_rows)
        for col in s["columns"]:
            name = col["name"]
            if name == s["candidateKey"] or name not in df.columns:
                continue
            values = {str(v) for v in df[name].dropna().tolist()}
            if not values:
                continue
            for target_entity, key_values in key_sets.items():
                if target_entity == s["entityName"]:
                    continue
                name_hint = _slug(name).lower().startswith(target_entity.lower()) or any(
                    name.lower().endswith(h) for h in IDENTIFIER_HINTS
                )
                if values.issubset(key_values) and name_hint:
                    rels.append(
                        {
                            "from": s["entityName"],
                            "fromColumn": name,
                            "to": target_entity,
                            "kind": "@one",
                            "confidence": "high"
                            if col["decorator"] in ("@int", "@uuid")
                            else "medium",
                        }
                    )
    return rels


def render_draft_entities(profile: dict[str, Any]) -> str:
    """Render a *draft* set of Rayfin @entity classes for the agent to refine."""
    lines: list[str] = [
        "// DRAFT -- generated by profile_spreadsheet.py. Review names, types, and",
        "// relationships before use. See SKILL.md for the finalize checklist.",
        "import { boolean, date, decimal, email, entity, int, one, text, uuid } from '@microsoft/rayfin-core';",
        "",
    ]
    rels_by_entity: dict[str, list[dict[str, Any]]] = {}
    for r in profile["relationships"]:
        rels_by_entity.setdefault(r["from"], []).append(r)

    for s in profile["sheets"]:
        lines.append("@entity()")
        lines.append(f"export class {s['entityName']} {{")
        lines.append("  @uuid() id!: string;")
        for c in s["columns"]:
            if c["fieldName"] == "id":
                continue
            args = c["decoratorArgs"]
            arg_str = ""
            if args:
                arg_str = "{ " + ", ".join(f"{k}: {v}" for k, v in args.items()) + " }"
            lines.append(f"  {c['decorator']}({arg_str}) {c['fieldName']}!: {c['tsType']};")
        for r in rels_by_entity.get(s["entityName"], []):
            lines.append(f"  @one(() => {r['to']}) {_camel(r['to'])}?: {r['to']};")
        lines.append("}")
        lines.append("")
    return "\n".join(lines)


def main() -> int:
    ap = argparse.ArgumentParser(
        description="Profile a spreadsheet into a Rayfin data-model report."
    )
    ap.add_argument("path", type=Path, help="Path to a .csv, .xlsx, or .xlsm file")
    ap.add_argument("--json", type=Path, default=None, help="Write the JSON profile to this file")
    ap.add_argument("--sample-rows", type=int, default=200, help="Max data rows sampled per sheet")
    ap.add_argument(
        "--draft-entities", action="store_true", help="Also print draft Rayfin @entity classes"
    )
    args = ap.parse_args()

    if not args.path.exists():
        sys.stderr.write(f"File not found: {args.path}\n")
        return 1
    if args.path.suffix.lower() not in (".csv", ".xlsx", ".xlsm"):
        sys.stderr.write("Unsupported format. Use .csv, .xlsx, or .xlsm.\n")
        return 1

    profile = profile_file(args.path, args.sample_rows)
    payload = json.dumps(profile, indent=2)

    if args.json:
        args.json.write_text(payload, encoding="utf-8")
        sys.stderr.write(f"Wrote profile to {args.json}\n")
    else:
        print(payload)

    if args.draft_entities:
        print("\n// ---- DRAFT ENTITIES ----")
        print(render_draft_entities(profile))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
