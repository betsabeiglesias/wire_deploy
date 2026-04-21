# writer.py
import os
import json
import time
import logging
from datetime import datetime, timezone
from typing import Any, Dict, Optional, Tuple

import paho.mqtt.client as mqtt
import pyodbc


# ============================================================
# CONFIG
# ============================================================
MSSQL_CONN = (
    f"DRIVER={{{os.getenv('MSSQL_DRIVER')}}};"
    f"SERVER={os.getenv('MSSQL_HOST')};"
    f"DATABASE={os.getenv('MSSQL_DB')};"
    f"UID={os.getenv('MSSQL_USER')};"
    f"PWD={os.getenv('MSSQL_PASSWORD')};"
    "TrustServerCertificate=yes;"
)

MQTT_HOST  = os.getenv("MQTT_HOST")
MQTT_PORT  = int(os.getenv("MQTT_PORT", 1883))
MQTT_USER  = os.getenv("MQTT_USER")
MQTT_PASS  = os.getenv("MQTT_PASSWORD")
MQTT_TOPIC = os.getenv("MQTT_TOPIC")
CLIENT_ID  = os.getenv("WRITER_ID")

_REQUIRED_ENV = [
    "MSSQL_DRIVER", "MSSQL_HOST", "MSSQL_DB", "MSSQL_USER", "MSSQL_PASSWORD",
    "MQTT_HOST", "MQTT_TOPIC", "WRITER_ID",
]


# ============================================================
# LOGGING
# ============================================================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger("mqtt_writer")


# ============================================================
# HELPERS
# ============================================================
def parse_topic(topic: str) -> Optional[Dict[str, str]]:
    """
    Expected: <client>/<plant>/<area>/<equipment_id>/<variable>
    Returns None when depth < 5.
    """
    parts = topic.split("/")
    if len(parts) < 5:
        return None
    return {"equipment_id": parts[3], "variable": parts[4]}


def parse_payload(raw: str) -> Optional[Dict[str, Any]]:
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


def parse_timestamp(payload: Dict[str, Any], fallback: datetime) -> datetime:
    """
    Acepta ISO-8601 string ('ts') o epoch-ms entero ('timestamp').
    Siempre devuelve datetime naive UTC para compatibilidad con pyodbc/DATETIME2.
    """
    ts_str = payload.get("ts")
    if ts_str:
        try:
            dt = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
            return dt.astimezone(timezone.utc).replace(tzinfo=None)
        except ValueError:
            pass

    ts_epoch = payload.get("timestamp")
    if ts_epoch:
        try:
            return datetime.utcfromtimestamp(int(ts_epoch) / 1000)
        except (ValueError, OSError):
            pass

    return fallback


def normalize_datatype(dt: str) -> str:
    dt = dt.lower()
    if dt in ("float", "double"):
        return "float"
    elif dt in ("int", "int16", "int32", "uint16", "uint32"):
        return "int"
    elif dt in ("bool", "boolean"):
        return "bool"
    elif dt in ("string", "char"):
        return "string"
    else:
        return "unknown"


def extract_typed_value(
    value: Any, datatype: str
) -> Tuple[Optional[float], Optional[int], Optional[str], Optional[bool]]:
    if value is None:
        return (None, None, None, None)
    try:
        if datatype == "float":
            return (float(value), None, None, None)
        elif datatype == "int":
            return (None, int(value), None, None)
        elif datatype == "bool":
            return (None, None, None, bool(value))
        elif datatype == "string":
            return (None, None, str(value), None)
        else:
            return (None, None, None, None)
    except (ValueError, TypeError):
        return (None, None, None, None)


# ============================================================
# WRITER SERVICE
# ============================================================
class WriterService:

    def __init__(self):
        self.conn:   pyodbc.Connection = None
        self.cursor: pyodbc.Cursor     = None
        self._connect()

    # --------------------------------------------------------
    # DB lifecycle
    # --------------------------------------------------------

    def _connect(self) -> None:
        """Blocking connect — retries until SQL Server is reachable."""
        while True:
            try:
                self.conn   = pyodbc.connect(MSSQL_CONN, timeout=5)
                self.cursor = self.conn.cursor()
                log.info("✓ Connected to SQL Server")
                return
            except Exception as e:
                log.error(f"SQL connection failed: {e}")
                time.sleep(5)

    def _reconnect(self) -> None:
        log.warning("Reconnecting to SQL Server...")
        self._connect()

    def _safe_rollback(self) -> None:
        try:
            self.conn.rollback()
        except Exception as e:
            log.warning(f"Rollback failed (connection already gone): {e}")


    def close(self) -> None:
        try:
            self.cursor.close()
            self.conn.close()
        except Exception:
            pass

    # --------------------------------------------------------
    # DB writes
    # --------------------------------------------------------

    def _insert_raw(
        self, received_at: datetime, topic: str, payload: str, client_id: str
    ) -> int:
        self.cursor.execute(
            """
            INSERT INTO mqtt_raw_messages (received_at, topic, payload, client)
            OUTPUT INSERTED.id
            VALUES (?, ?, ?, ?)
            """,
            received_at, topic, payload, client_id,
        )
        return self.cursor.fetchone()[0]

    def _insert_parse_error(
        self, raw_id: int, received_at: datetime, topic: str,
        error_code: str, detail: Optional[str] = None
    ) -> None:
        self.cursor.execute(
            """
            INSERT INTO parse_errors (raw_id, received_at, topic, error_code, detail)
            VALUES (?, ?, ?, ?, ?)
            """,
            raw_id, received_at, topic, error_code, detail,
        )

    def _insert_telemetry(
        self,
        ts: datetime,
        equipment_id: str,
        variable: str,
        v_float: Optional[float],
        v_int: Optional[int],
        v_string: Optional[str],
        v_bool: Optional[bool],
        datatype: str,
        unit: Optional[str],
        quality: str,
    ) -> None:
        self.cursor.execute(
            """
            INSERT INTO telemetry_history
                ([timestamp], equipment_id, variable,
                 value_float, value_int, value_string, value_bool,
                 datatype, unit, quality)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            ts, equipment_id, variable,
            v_float, v_int, v_string, v_bool,
            datatype, unit, quality,
        )

    # --------------------------------------------------------
    # Message handler
    # --------------------------------------------------------

    def handle_message(self, client, userdata, msg) -> None:
        """
        Flujo de escritura:
          1. INSERT mqtt_raw_messages  — siempre, incondicionalmente.
          2. Parseo y validación       — cualquier fallo → INSERT parse_errors + commit + return.
          3. INSERT telemetry_history  — solo si todo es válido.
          4. commit único             — al final del camino feliz.
        """
        received_at = datetime.now(timezone.utc).replace(tzinfo=None)
        payload_str = msg.payload.decode()
        topic       = msg.topic

        try:
            # -- 1. Raw insert (siempre) -----------------------
            raw_id = self._insert_raw(received_at, topic, payload_str, CLIENT_ID)

            # -- 2. Parse payload -----------------------------
            data = parse_payload(payload_str)
            if not data:
                self._insert_parse_error(raw_id, received_at, topic, "invalid_json")
                self.conn.commit()
                log.warning(f"Invalid JSON — topic={topic}")
                return

            # -- 3. Extraer identificadores -------------------
            equipment_id = data.get("equipment_id")
            variable     = data.get("variable")

            # Fallback al topic por compatibilidad
            if not equipment_id or not variable:
                topic_data = parse_topic(topic)
                if not topic_data:
                    self._insert_parse_error(
                        raw_id, received_at, topic, "missing_identifiers"
                    )
                    self.conn.commit()
                    log.warning(f"Missing identifiers — topic={topic}")
                    return
                equipment_id = equipment_id or topic_data["equipment_id"]
                variable     = variable or topic_data["variable"]

            if not equipment_id or not variable:
                self._insert_parse_error(
                    raw_id, received_at, topic, "invalid_identifiers"
                )
                self.conn.commit()
                return

            # -- 4. Extraer campos ----------------------------
            ts           = parse_timestamp(data, received_at)
            datatype_raw = data.get("datatype", "float")
            datatype     = normalize_datatype(datatype_raw)

            if datatype == "unknown":
                self._insert_parse_error(
                    raw_id, received_at, topic,
                    "unsupported_datatype", datatype_raw
                )
                self.conn.commit()
                return

            unit    = data.get("unit")
            quality = (data.get("quality") or "GOOD").upper()

            v_float, v_int, v_string, v_bool = extract_typed_value(
                data.get("value"), datatype
            )

            if all(v is None for v in (v_float, v_int, v_string, v_bool)):
                self._insert_parse_error(
                    raw_id, received_at, topic, "no_valid_value",
                    f"{equipment_id}/{variable} datatype={datatype}"
                )
                self.conn.commit()
                log.warning(f"No valid value — {equipment_id}/{variable}")
                return

            # -- 5. Telemetry insert --------------------------
            self._insert_telemetry(
                ts, equipment_id, variable,
                v_float, v_int, v_string, v_bool,
                datatype, unit, quality,
            )

            # -- 6. Commit único ------------------------------
            self.conn.commit()

            display = next(v for v in (v_float, v_int, v_string, v_bool) if v is not None)
            log.info(
                f"✓ {equipment_id}/{variable} | "
                f"value={display} | datatype={datatype} | quality={quality}"
            )

        except pyodbc.Error as e:
            error_code = e.args[0] if e.args else None
            self.conn.rollback()

            if error_code in (2601, 2627):
                log.debug(f"Duplicate skipped — {equipment_id}/{variable}")
                return

            log.error(f"SQL error [{error_code}]: {e}")
            self._reconnect()

        except Exception as e:
            log.error(f"Unexpected error: {e}", exc_info=True)
            self._safe_rollback()


# ============================================================
# MAIN
# ============================================================
def _validate_config() -> None:
    missing = [k for k in _REQUIRED_ENV if not os.getenv(k)]
    if missing:
        raise ValueError(f"Missing env vars: {', '.join(missing)}")


def main() -> None:
    _validate_config()

    log.info("=" * 60)
    log.info("MQTT → SQL Server Writer starting")
    log.info(f"  Broker : {MQTT_HOST}:{MQTT_PORT}  |  Topic: {MQTT_TOPIC}")
    log.info(f"  DB     : {os.getenv('MSSQL_HOST')}/{os.getenv('MSSQL_DB')}")
    log.info(f"  ID     : {CLIENT_ID}")
    log.info("=" * 60)

    service = WriterService()

    client = mqtt.Client(client_id=CLIENT_ID, clean_session=False)
    client.username_pw_set(MQTT_USER, MQTT_PASS)
    client.reconnect_delay_set(min_delay=1, max_delay=30)

    def on_connect(c, u, f, rc):
        if rc == 0:
            log.info("✓ Connected to MQTT broker")
            c.subscribe(MQTT_TOPIC, qos=1)
            log.info(f"✓ Subscribed to {MQTT_TOPIC}")
        else:
            log.error(f"✗ MQTT connection failed (rc={rc})")

    client.on_connect = on_connect
    client.on_message = service.handle_message

    client.connect(MQTT_HOST, MQTT_PORT, keepalive=60)
    client.loop_start()

    try:
        while True:
            time.sleep(5)
    except KeyboardInterrupt:
        log.info("Shutting down...")
    finally:
        client.loop_stop()
        client.disconnect()
        service.close()
        log.info("✓ Clean shutdown complete")


if __name__ == "__main__":
    main()