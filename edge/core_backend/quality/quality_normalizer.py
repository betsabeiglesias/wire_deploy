# wire_copy/edge/core_backend/quality/quality_normalizer.py

from typing import Optional
import time


# RETOMAR
STALE_THRESHOLD_SEC = 10


def normalize_quality(pv) -> str:
    """
    Normaliza la calidad SCADA de un ProcessValue.

    Inputs:
    - pv.value
    - pv.timestamp
    - pv.source (protocol-specific info)

    Output:
    - GOOD / BAD / BAD_COMM / BAD_DEVICE / BAD_CONFIG / UNCERTAIN / STALE
    """

    # -------------------------
    # SAFE ACCESS
    # -------------------------
    src = pv.source or {}
    protocol = src.get("protocol")
    value = pv.value

    # -------------------------
    # STALE (cross-protocol)
    # -------------------------
    try:
        if pv.timestamp:
            age = time.time() - pv.timestamp.timestamp()
            if age > STALE_THRESHOLD_SEC:
                return "STALE"
    except Exception:
        pass  # nunca romper por timestamp

    # =========================
    # MODBUS
    # =========================
    if protocol == "modbus":
        raw_status = src.get("raw_status")

        if raw_status == "ok" and value is not None:
            return "GOOD"

        if raw_status in ["modbus_exception", "exception"]:
            return "BAD_COMM"

        if raw_status == "read_error":
            return "BAD_DEVICE"

        if value is None:
            return "BAD"

        return "UNCERTAIN"

    # =========================
    # OPC UA
    # =========================
    if protocol == "opcua":
        status = src.get("status_code", "")

        if "BadNoCommunication" in status:
            return "BAD_COMM"

        if "BadDeviceFailure" in status or "BadSensorFailure" in status:
            return "BAD_DEVICE"

        if "Bad" in status:
            return "BAD"

        if "Uncertain" in status:
            return "UNCERTAIN"

        return "GOOD"

    # =========================
    # S7 (básico)
    # =========================
    if protocol == "s7":
        raw_status = src.get("raw_status")

        if raw_status == "ok" and value is not None:
            return "GOOD"

        if raw_status in ["timeout", "connection_lost"]:
            return "BAD_COMM"

        if raw_status in ["datatype_error", "address_error"]:
            return "BAD_CONFIG"

        if raw_status == "exception":
            return "BAD"

        if value is None:
            return "BAD"

        return "UNCERTAIN"

    # =========================
    # DEFAULT
    # =========================
    if value is None:
        return "BAD"

    return "GOOD"