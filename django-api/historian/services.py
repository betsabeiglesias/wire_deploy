# historian/services.py
import os
import pyodbc
from typing import Any, Dict, List, Optional


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

    # Construir cláusula de filtro de tags
    tag_filters: List[str] = []
    params: List[Any] = []
    for tag in tags:
        tag_filters.append("(equipment_id = ? AND variable = ?)")
        params.extend([tag["equipment_id"], tag["variable"]])

    tag_clause = " OR ".join(tag_filters)
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
