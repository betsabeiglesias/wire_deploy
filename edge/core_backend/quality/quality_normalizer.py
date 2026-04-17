# wire_copy\edge\core_backend\quality\quality_normalizer.py

from typing import Optional

def normalize_quality(pv) -> str:
    """
    Normaliza la calidad de un ProcessValue basado en:
    - pv.value
    - pv.source.raw_status
    """

    src = pv.source or {}
    protocol = src.get("protocol")
    raw_status = src.get("raw_status")
    value = pv.value

    # =========================
    # MODBUS
    # =========================
    if protocol == "modbus":

        # Caso OK
        if raw_status == "ok" and value is not None:
            return "GOOD"

        # Errores claros
        if raw_status in ["modbus_exception", "exception"]:
            return "BAD"

        if raw_status == "read_error":
            return "BAD"

        # Caso raro (fallback)
        if value is None:
            return "BAD"

        return "UNCERTAIN"

    # =========================
    # DEFAULT (otros protocolos)
    # =========================
    if value is None:
        return "BAD"

    return "GOOD"