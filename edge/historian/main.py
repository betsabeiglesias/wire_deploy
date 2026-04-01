# edge/historian/main.py
import logging
import os
from typing import Any, Dict, List, Literal, Optional

from fastapi import FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import services

# ── Logging ───────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
log = logging.getLogger("historian")

# ── Config desde env ──────────────────────────────────────────────────────────

HISTORIAN_API_KEY: str = os.getenv("HISTORIAN_API_KEY", "")
_cors_raw: str = os.getenv("CORS_ORIGINS", "*")
CORS_ORIGINS: List[str] = [o.strip() for o in _cors_raw.split(",") if o.strip()]

# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Historian API",
    description="Consulta de datos históricos de telemetría desde SQL Server.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Auth helper ───────────────────────────────────────────────────────────────

def _check_key(x_api_key: str) -> None:
    """Si HISTORIAN_API_KEY está configurada, valida la cabecera X-API-Key."""
    if HISTORIAN_API_KEY and x_api_key != HISTORIAN_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key inválida o ausente",
        )


# ── Modelos Pydantic ──────────────────────────────────────────────────────────

class TagItem(BaseModel):
    equipment_id: str
    variable: str


class HistorianQueryRequest(BaseModel):
    tags: List[TagItem] = Field(min_length=1)
    start: str = Field(description="ISO8601 datetime, ej. 2026-03-22T00:00:00")
    stop: str = Field(description="ISO8601 datetime, ej. 2026-03-23T00:00:00")
    limit: int = Field(default=5000, ge=1, le=50_000)


class AggregateRequest(BaseModel):
    tags: List[TagItem] = Field(min_length=1)
    start: str
    stop: str
    window_seconds: int = Field(default=60, ge=1, le=86_400,
                                 description="Tamaño de bucket en segundos")
    fn: Literal["avg", "min", "max", "sum", "count"] = "avg"


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health", tags=["meta"])
def health() -> Dict[str, str]:
    """Comprueba que el servicio está vivo."""
    return {"status": "ok"}


@app.post("/api/historian/query/", tags=["historian"])
def historian_query(
    body: HistorianQueryRequest,
    x_api_key: str = Header(default=""),
) -> Dict[str, Any]:
    """
    Devuelve filas crudas de telemetry_history para los tags y rango indicados.

    La respuesta incluye `truncated=true` si se alcanzó el límite de filas.
    """
    _check_key(x_api_key)
    log.info(
        "query tags=%d start=%s stop=%s limit=%d",
        len(body.tags), body.start, body.stop, body.limit,
    )
    try:
        result = services.query_history(
            tags=[t.model_dump() for t in body.tags],
            start=body.start,
            stop=body.stop,
            limit=body.limit,
        )
    except Exception as exc:
        log.exception("Error en query_history")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        )
    log.info("query → %d filas, truncated=%s", result["count"], result["truncated"])
    return result


@app.post("/api/historian/aggregate/", tags=["historian"])
def historian_aggregate(
    body: AggregateRequest,
    x_api_key: str = Header(default=""),
) -> Dict[str, Any]:
    """
    Devuelve datos agregados (avg/min/max/sum/count) por ventana temporal.
    """
    _check_key(x_api_key)
    log.info(
        "aggregate tags=%d start=%s stop=%s window=%ds fn=%s",
        len(body.tags), body.start, body.stop, body.window_seconds, body.fn,
    )
    try:
        result = services.query_aggregate(
            tags=[t.model_dump() for t in body.tags],
            start=body.start,
            stop=body.stop,
            window_seconds=body.window_seconds,
            fn=body.fn,
        )
    except Exception as exc:
        log.exception("Error en query_aggregate")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        )
    log.info("aggregate → %d buckets", result["count"])
    return result
