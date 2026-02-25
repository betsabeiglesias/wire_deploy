# mqtt_writer.py
import os
import json
import time
import logging
from datetime import datetime
from typing import Optional, Dict, Any, Tuple

import paho.mqtt.client as mqtt
import pyodbc

# ---------------- CONFIG ----------------
MSSQL_DRIVER = os.getenv("MSSQL_DRIVER")
MSSQL_HOST = os.getenv("MSSQL_HOST")
MSSQL_DB = os.getenv("MSSQL_DB")
MSSQL_USER = os.getenv("MSSQL_USER")
MSSQL_PASSWORD = os.getenv("MSSQL_PASSWORD")

MSSQL_CONN = (
    f"DRIVER={{{MSSQL_DRIVER}}};"
    f"SERVER={MSSQL_HOST};"
    f"DATABASE={MSSQL_DB};"
    f"UID={MSSQL_USER};"
    f"PWD={MSSQL_PASSWORD};"
    "TrustServerCertificate=yes;"
)

MQTT_HOST = os.getenv("MQTT_HOST")
MQTT_PORT = int(os.getenv("MQTT_PORT"))
MQTT_USER = os.getenv("MQTT_USER")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD")
MQTT_TOPIC = os.getenv("MQTT_TOPIC")

# ---------------- LOGGING ----------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger("mqtt_writer")

# ---------------- DB CONNECTION ----------------
def connect_db():
    while True:
        try:
            conn = pyodbc.connect(MSSQL_CONN, timeout=5)
            log.info("✓ Connected to SQL Server")
            return conn
        except Exception as e:
            log.error(f"SQL Server not ready: {e}")
            time.sleep(5)

db_conn = connect_db()
cursor = db_conn.cursor()

def ensure_tables(cursor, conn):
    """
    Verifica que raw_data existe y que los índices necesarios están creados.
    NO redefine la tabla.
    """

    # ---------- raw_data ----------
    cursor.execute("""
    IF OBJECT_ID('dbo.raw_data', 'U') IS NULL
    BEGIN
        CREATE TABLE raw_data (
            id BIGINT IDENTITY PRIMARY KEY,
            ts DATETIME2(6) NOT NULL DEFAULT SYSUTCDATETIME(),
            topic NVARCHAR(255) NOT NULL,
            payload NVARCHAR(MAX) NOT NULL
        )
    END
    """)

    # ---------- índice por timestamp ----------
    cursor.execute("""
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_raw_data_ts')
        CREATE INDEX idx_raw_data_ts
        ON dbo.raw_data(ts DESC);
    """)

    # ---------- índice por topic + ts ----------
    cursor.execute("""
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_raw_data_topic_ts')
        CREATE INDEX idx_raw_data_topic_ts
        ON dbo.raw_data(topic, ts DESC);
    """)

    conn.commit()
    log.info("✓ raw_data table & indexes ready")



# ---------------- PARSING FUNCTIONS ----------------
def parse_topic(topic: str) -> Optional[Dict[str, str]]:
    """
    Parsea: clienteA/planta1/area1/horno01/temperatura
    Returns: {'equipment_id': 'horno01', 'variable': 'temperatura'}
    """
    parts = topic.split('/')
    if len(parts) < 5:
        return None
    
    return {
        'equipment_id': parts[3],
        'variable': parts[4]
    }

def parse_payload(payload_str: str) -> Optional[Dict[str, Any]]:
    try:
        return json.loads(payload_str)
    except json.JSONDecodeError:
        return None

def extract_typed_value(data: Dict[str, Any], datatype: str) -> Tuple:
    """
    Returns: (value_float, value_int, value_string, value_bool)
    """
    value = data.get('value')
    if value is None:
        return (None, None, None, None)
    
    datatype = datatype.lower()
    try:
        if datatype == 'float':
            return (float(value), None, None, None)
        elif datatype == 'int':
            return (None, int(value), None, None)
        elif datatype == 'bool':
            return (None, None, None, bool(value))
        elif datatype == 'string':
            return (None, None, str(value), None)
        else:
            return (None, None, None, None)
    except (ValueError, TypeError):
        return (None, None, None, None)

# ---------------- MQTT HANDLER FACTORY ----------------
def create_message_handler(cursor, conn):
    """
    Factory que crea el handler con acceso a cursor y conn
    """
    def on_message(client, userdata, msg):
        """
        Estrategia de escritura dual:
        1. SIEMPRE escribir a raw_data (backup/auditoría)
        2. INTENTAR escribir a telemetry_history (datos procesados)
        """
        received_at = datetime.utcnow()
        payload_str = msg.payload.decode()
        topic = msg.topic
        
        try:
            # ========================================
            # PASO 1: GUARDAR EN RAW_DATA (SIEMPRE)
            # ========================================
            cursor.execute("""
                INSERT INTO raw_data (ts, topic, payload)
                VALUES (?, ?, ?)
            """, received_at, topic, payload_str)
            
            log.debug(
                f"SQL WRITE raw_data | topic={msg.topic} | payload_len={len(payload_str)}"
            )

            # ========================================
            # PASO 2: PARSEAR Y GUARDAR EN TELEMETRY_HISTORY
            # ========================================
            topic_data = parse_topic(topic)
            if not topic_data:
                log.warning(f"Invalid topic format: {topic}")
                conn.commit()  # Commit solo raw_data
                return
            
            payload_data = parse_payload(payload_str)
            if not payload_data:
                log.warning(f"Invalid JSON from {topic}")
                conn.commit()  # Commit solo raw_data
                return
            
            # Extraer campos del topic
            equipment_id = topic_data['equipment_id']
            variable = topic_data['variable']
            
            # Timestamp (usar del payload o received_at)
            ts_str = payload_data.get('ts')
            if ts_str:
                try:
                    ts = datetime.fromisoformat(ts_str.replace('Z', '+00:00'))
                except:
                    ts = received_at
            else:
                ts = received_at
            
            # Campos del payload
            datatype = payload_data.get('datatype', 'float')
            unit = payload_data.get('unit')
            quality = payload_data.get('quality', 'good')
            gateway_id = payload_data.get('gateway_id')
            batch_id = payload_data.get('batch_id')
            
            # Extraer valor tipado
            value_float, value_int, value_string, value_bool = extract_typed_value(
                payload_data, datatype
            )
            
            # Validar que haya valor válido
            if all(v is None for v in [value_float, value_int, value_string, value_bool]):
                log.warning(f"No valid value: {equipment_id}/{variable} datatype={datatype}")
                conn.commit()  # Commit solo raw_data
                return
            
            # Insert en telemetry_history
            cursor.execute("""
                INSERT INTO telemetry_history 
                (ts, equipment_id, variable, value_float, value_int, value_string, value_bool,
                 datatype, unit, quality, gateway_id, batch_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, ts, equipment_id, variable, value_float, value_int, value_string, value_bool,
                 datatype, unit, quality, gateway_id, batch_id)
            

            # Commit de ambas tablas
            conn.commit()

            # Log con los valores CORRECTOS (del topic_data, no payload_data)
            log.info(
                f"✓ telemetry_history | "
                f"{equipment_id}/{variable} | "
                f"datatype={datatype} | "
                f"value={value_float or value_int or value_string or value_bool} | "
                f"quality={quality}"
               )      
            
        except Exception as e:
            log.error(f"✗ Error processing message: {e}")
            conn.rollback()
    
    return on_message

def on_connect(client, userdata, flags, rc):
    """Callback cuando se conecta a MQTT"""
    if rc == 0:
        log.info("✓ Connected to MQTT")
        client.subscribe(MQTT_TOPIC)
        log.info(f"✓ Subscribed to {MQTT_TOPIC}")
    else:
        log.error(f"✗ MQTT connection failed: {rc}")


# ---------------- MAIN FUNCTION ----------------
def main():
    """Función principal que ejecuta el servicio"""
    log.info("=" * 60)
    log.info("Starting Dual Writer (MQTT → SQL Server)")
    log.info("=" * 60)
    log.info(f"Target DB: {MSSQL_HOST}/{MSSQL_DB}")
    log.info(f"MQTT Broker: {MQTT_HOST}:{MQTT_PORT}")
    log.info(f"MQTT Topic: {MQTT_TOPIC}")
    log.info("=" * 60)
    
    # Setup DB
    db_conn = connect_db()
    cursor = db_conn.cursor()
    ensure_tables(cursor, db_conn)
    
    # Setup MQTT
    client = mqtt.Client()
    client.username_pw_set(MQTT_USER, MQTT_PASSWORD)
    client.on_connect = on_connect
    client.on_message = create_message_handler(cursor, db_conn)
    
    # Main loop
    while True:
        try:
            log.info("Connecting to MQTT broker...")
            client.connect(MQTT_HOST, MQTT_PORT, 60)
            client.loop_forever()
        except KeyboardInterrupt:
            log.info("\n✓ Shutting down gracefully...")
            client.disconnect()
            cursor.close()
            db_conn.close()
            break
        except Exception as e:
            log.error(f"✗ MQTT error: {e}")
            time.sleep(5)


# ---------------- ENTRY POINT ----------------
if __name__ == "__main__":
    main()