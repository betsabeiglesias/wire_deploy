# edge/historian/services.py
# Estrategia de timestamps: docs/architecture/timestamp_strategy.md
import os
import pyodbc
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone


def _normalize_dt(dt_str: str) -> str:
    """Normaliza a YYYY-MM-DDTHH:MM:SS en UTC.

    Acepta strings con zona horaria (Z, +HH:MM) — los convierte a UTC antes
    de formatear, para que coincidan con los timestamps UTC del SQL Server.
    Los strings naive se devuelven tal cual (compatibilidad con datos legados).
    """
    # Aware: convierte a UTC y elimina info de zona
    normalized = dt_str.strip().replace("Z", "+00:00")
    try:
        dt = datetime.fromisoformat(normalized)
        if dt.tzinfo is not None:
            return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")
    except ValueError:
        pass
    # Naive: formatos clásicos
    for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M", "%Y-%m-%d"):
        try:
            return datetime.strptime(dt_str.strip(), fmt).strftime("%Y-%m-%dT%H:%M:%S")
        except ValueError:
            continue
    return dt_str


# ── Conexión ─────────────────────────────────────────────────────────────────

def _conn_str() -> str:
    return (
        f"DRIVER={{{os.getenv('MSSQL_DRIVER', 'ODBC Driver 18 for SQL Server')}}};"
        f"SERVER={os.getenv('MSSQL_HOST', 'sqlserver')};"
        f"DATABASE={os.getenv('MSSQL_DB', 'textil')};"
        f"UID={os.getenv('MSSQL_USER', 'sa')};"
        f"PWD={os.getenv('MSSQL_PASSWORD', '')};"
        "TrustServerCertificate=yes;"
    )


def _coalesce_value(
    v_float: Optional[float],
    v_int: Optional[int],
    v_string: Optional[str],
    v_bool: Optional[bool],
) -> Any:
    """Devuelve el primer valor no None, preservando el cero."""
    for v in (v_float, v_int, v_string, v_bool):
        if v is not None:
            return v
    return None


def _serialize_utc_iso(value: Any) -> str:
    """
    Serializa timestamps en ISO-8601 con zona explícita UTC (`Z`).

    pyodbc suele devolver `DATETIME2` como naive datetime; en este proyecto
    esos valores se persisten en UTC, así que los marcamos como UTC antes
    de serializar para evitar ambigüedad en frontend.
    """
    if not hasattr(value, "isoformat"):
        return str(value)

    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    else:
        value = value.astimezone(timezone.utc)

    return value.isoformat().replace("+00:00", "Z")


def _row_to_dict(rd: Dict) -> Dict[str, Any]:
    ts = rd["timestamp"]
    return {
        "timestamp": _serialize_utc_iso(ts),
        "equipment_id": rd["equipment_id"],
        "variable": rd["variable"],
        "value": _coalesce_value(
            rd["value_float"], rd["value_int"], rd["value_string"], rd["value_bool"]
        ),
        "datatype": rd.get("datatype") or "",
        "unit": rd.get("unit") or "",
        "quality": rd.get("quality") or "",
    }


# ── query_history ─────────────────────────────────────────────────────────────

def query_history(
    tags: List[Dict[str, str]],
    start: str,
    stop: str,
    limit: int = 5000,
) -> Dict[str, Any]:
    """
    Consulta telemetry_history para una lista de tags y un rango de tiempo.

    Cada tag recibe su propia cuota del límite (limit // len(tags)) para que
    un tag con muestreo muy denso no acapare el resultado y deje sin datos
    a los demás. El resultado final se ordena por timestamp ascendente.

    tags    : [{"equipment_id": "...", "variable": "..."}]
    start   : ISO8601 string  (ej. "2026-03-22T00:00:00")
    stop    : ISO8601 string  (ej. "2026-03-23T00:00:00")
    limit   : max filas totales devueltas

    Devuelve:
    {
        "rows": [...],
        "count": int,
        "truncated": bool
    }
    """
    if not tags:
        return {"rows": [], "count": 0, "truncated": False}

    safe_limit = max(1, min(int(limit), 50_000))
    per_tag_limit = max(1, safe_limit // len(tags))

    start = _normalize_dt(start)
    stop = _normalize_dt(stop)

    all_rows: List[Dict[str, Any]] = []
    truncated = False

    sql = f"""
        SELECT TOP {per_tag_limit + 1}
            [timestamp],
            equipment_id,
            variable,
            value_float,
            value_int,
            value_string,
            value_bool,
            datatype,
            unit,
            quality
        FROM telemetry_history
        WHERE equipment_id = ?
          AND variable = ?
          AND [timestamp] >= ?
          AND [timestamp] <= ?
        ORDER BY [timestamp] ASC
    """

    with pyodbc.connect(_conn_str(), timeout=15) as conn:
        cursor = conn.cursor()
        for tag in tags:
            cursor.execute(sql, [tag["equipment_id"], tag["variable"], start, stop])
            columns = [col[0] for col in cursor.description]
            tag_rows = cursor.fetchall()

            if len(tag_rows) > per_tag_limit:
                truncated = True
                tag_rows = tag_rows[:per_tag_limit]

            for row in tag_rows:
                all_rows.append(_row_to_dict(dict(zip(columns, row))))

    all_rows.sort(key=lambda r: r["timestamp"])

    return {"rows": all_rows, "count": len(all_rows), "truncated": truncated}


# ── query_aggregate ───────────────────────────────────────────────────────────

_AGG_FN_MAP = {
    "avg":   "AVG(value_float)",
    "min":   "MIN(value_float)",
    "max":   "MAX(value_float)",
    "sum":   "SUM(value_float)",
    "count": "COUNT(*)",
}


def query_aggregate(
    tags: List[Dict[str, str]],
    start: str,
    stop: str,
    window_seconds: int = 60,
    fn: str = "avg",
) -> Dict[str, Any]:
    """
    Devuelve datos agregados por ventana temporal.

    window_seconds : tamaño de bucket en segundos (ej. 60 = 1 min, 3600 = 1h)
    fn             : "avg" | "min" | "max" | "sum" | "count"

    Devuelve:
    {
        "rows": [
            {
                "bucket":       "2026-03-22T10:00:00",
                "equipment_id": "...",
                "variable":     "...",
                "value":        42.5,
                "samples":      12
            }
        ],
        "count": int
    }
    """
    if not tags:
        return {"rows": [], "count": 0}

    agg_expr = _AGG_FN_MAP.get(fn, "AVG(value_float)")
    safe_window = max(1, int(window_seconds))

    tag_filters: List[str] = []
    params: List[Any] = []
    for tag in tags:
        tag_filters.append("(equipment_id = ? AND variable = ?)")
        params.extend([tag["equipment_id"], tag["variable"]])

    tag_clause = " OR ".join(tag_filters)
    # Solo start y stop: safe_window se inyecta aparte en full_params
    params.extend([start, stop])

    # SQL Server no permite referenciar alias en GROUP BY,
    # por eso la expresión DATEADD se repite — y sus parámetros también.
    sql = f"""
        SELECT
            DATEADD(
                SECOND,
                (DATEDIFF(SECOND, '19700101', [timestamp]) / ?) * ?,
                '19700101'
            ) AS bucket,
            equipment_id,
            variable,
            {agg_expr}  AS value,
            COUNT(*)     AS samples
        FROM telemetry_history
        WHERE ({tag_clause})
          AND [timestamp] >= ?
          AND [timestamp] <= ?
          AND value_float IS NOT NULL
        GROUP BY
            DATEADD(
                SECOND,
                (DATEDIFF(SECOND, '19700101', [timestamp]) / ?) * ?,
                '19700101'
            ),
            equipment_id,
            variable
        ORDER BY bucket ASC
    """

    # Orden de parámetros:
    # 1. safe_window x2  → SELECT DATEADD (/ ?) * ?
    # 2. tag params      → WHERE equipment_id = ? AND variable = ?  (por cada tag)
    # 3. start, stop     → WHERE [timestamp] >= ? AND [timestamp] <= ?
    # 4. safe_window x2  → GROUP BY DATEADD (/ ?) * ?
    full_params = [safe_window, safe_window] + params + [safe_window, safe_window]

    with pyodbc.connect(_conn_str(), timeout=15) as conn:
        cursor = conn.cursor()
        cursor.execute(sql, full_params)
        columns = [col[0] for col in cursor.description]
        raw_rows = cursor.fetchall()

    rows: List[Dict[str, Any]] = []
    for row in raw_rows:
        rd = dict(zip(columns, row))
        bucket = rd["bucket"]
        rows.append({
            "bucket": _serialize_utc_iso(bucket),
            "equipment_id": rd["equipment_id"],
            "variable": rd["variable"],
            "value": rd["value"],
            "samples": rd["samples"],
        })

    return {"rows": rows, "count": len(rows)}
