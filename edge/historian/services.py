# edge/historian/services.py
# Copia directa de django-api/historian/services.py — sin dependencias Django.
# Añade query_aggregate() para el endpoint de agregación por ventana temporal.
import os
import pyodbc
from typing import Any, Dict, List, Optional
from datetime import datetime

def _normalize_dt(dt_str: str) -> str:
    """Asegura formato completo YYYY-MM-DDTHH:MM:SS"""
    for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M", "%Y-%m-%d"):
        try:
            return datetime.strptime(dt_str, fmt).strftime("%Y-%m-%dT%H:%M:%S")
        except ValueError:
            continue
    return dt_str  # devuelve tal cual si no reconoce el formato

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


# ── query_history (reutilizado íntegro) ──────────────────────────────────────

def query_history(
    tags: List[Dict[str, str]],
    start: str,
    stop: str,
    limit: int = 5000,
) -> Dict[str, Any]:
    """
    Consulta telemetry_history para una lista de tags y un rango de tiempo.

    tags    : [{"equipment_id": "...", "variable": "..."}]
    start   : ISO8601 string  (ej. "2026-03-22T00:00:00")
    stop    : ISO8601 string  (ej. "2026-03-23T00:00:00")
    limit   : max filas devueltas (se solicita limit+1 para detectar truncado)

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

    tag_filters: List[str] = []
    params: List[Any] = []
    for tag in tags:
        tag_filters.append("(equipment_id = ? AND variable = ?)")
        params.extend([tag["equipment_id"], tag["variable"]])
        
    tag_clause = " OR ".join(tag_filters)

    start = _normalize_dt(start)
    stop = _normalize_dt(stop)

    params.extend([start, stop])

    sql = f"""
        SELECT TOP {safe_limit + 1}
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
        WHERE ({tag_clause})
          AND [timestamp] >= ?
          AND [timestamp] <= ?
        ORDER BY [timestamp] ASC
    """

    with pyodbc.connect(_conn_str(), timeout=15) as conn:
        cursor = conn.cursor()
        cursor.execute(sql, params)
        columns = [col[0] for col in cursor.description]
        raw_rows = cursor.fetchall()

    truncated = len(raw_rows) > safe_limit
    raw_rows = raw_rows[:safe_limit]

    rows: List[Dict[str, Any]] = []
    for row in raw_rows:
        rd = dict(zip(columns, row))
        ts = rd["timestamp"]
        rows.append({
            "timestamp": ts.isoformat() if hasattr(ts, "isoformat") else str(ts),
            "equipment_id": rd["equipment_id"],
            "variable": rd["variable"],
            "value": _coalesce_value(
                rd["value_float"], rd["value_int"], rd["value_string"], rd["value_bool"]
            ),
            "datatype": rd.get("datatype") or "",
            "unit": rd.get("unit") or "",
            "quality": rd.get("quality") or "",
        })

    return {"rows": rows, "count": len(rows), "truncated": truncated}


# ── query_aggregate (BONUS) ───────────────────────────────────────────────────

_AGG_FN_MAP = {
    "avg":  "AVG(value_float)",
    "min":  "MIN(value_float)",
    "max":  "MAX(value_float)",
    "sum":  "SUM(value_float)",
    "count":"COUNT(*)",
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
    params.extend([start, stop, safe_window, safe_window])

    # Agrupa por bucket de N segundos usando aritmética entera sobre epoch
    sql = f"""
        SELECT
            DATEADD(
                SECOND,
                (DATEDIFF(SECOND, '19700101', [timestamp]) / ?) * ?,
                '19700101'
            ) AS bucket,
            equipment_id,
            variable,
            {agg_expr}       AS value,
            COUNT(*)          AS samples
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

    # Los parámetros para GROUP BY tienen que repetirse en SQL Server
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
            "bucket": bucket.isoformat() if hasattr(bucket, "isoformat") else str(bucket),
            "equipment_id": rd["equipment_id"],
            "variable": rd["variable"],
            "value": rd["value"],
            "samples": rd["samples"],
        })

    return {"rows": rows, "count": len(rows)}
