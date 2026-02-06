import os
import json
import time
import logging
from datetime import datetime

import paho.mqtt.client as mqtt
import pyodbc

# ---------------- CONFIG ----------------

MSSQL_DRIVER = os.getenv("MSSQL_DRIVER")
MSSQL_HOST = os.getenv("MSSQL_HOST")
MSSQL_DB = os.getenv("MSSQL_DB")
MSSQL_USER = os.getenv("MSSQL_USER")
MSSQL_PASSWORD = os.getenv("MSSQL_PASSWORD")

# ODBC Open Database Connectivity.
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
log = logging.getLogger("writer")

# ---------------- DB ----------------

def connect_db():
    while True:
        try:
            conn = pyodbc.connect(MSSQL_CONN, timeout=5)
            log.info("Connected to MSSQL")
            return conn
        except Exception as e:
            log.error(f"MSSQL not ready: {e}")
            time.sleep(5)

db_conn = connect_db()
cursor = db_conn.cursor()

def ensure_table():
    cursor.execute("""
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='raw_data' AND xtype='U')
    CREATE TABLE raw_data (
        id BIGINT IDENTITY PRIMARY KEY,
        ts DATETIME2 NOT NULL,
        topic NVARCHAR(255) NOT NULL,
        payload NVARCHAR(MAX) NOT NULL
    )
    """)
    db_conn.commit()

ensure_table()

# ---------------- MQTT ----------------

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        log.info("Connected to MQTT")
        client.subscribe(MQTT_TOPIC)
        log.info(f"Subscribed to {MQTT_TOPIC}")
    else:
        log.error(f"MQTT connection failed: {rc}")

def on_message(client, userdata, msg):
    log.info(f"MQTT msg recibido: {msg.topic} -> {msg.payload[:50]}")
    try:
        payload = msg.payload.decode()
        ts = datetime.utcnow()

        cursor.execute(
            "INSERT INTO raw_data (ts, topic, payload) VALUES (?, ?, ?)",
            ts, msg.topic, payload
        )
        db_conn.commit()

    except Exception as e:
        log.error(f"Insert failed: {e}")

client = mqtt.Client()
client.username_pw_set(MQTT_USER, MQTT_PASSWORD)
client.on_connect = on_connect
client.on_message = on_message

while True:
    try:
        log.info("Connecting to MQTT...")
        client.connect(MQTT_HOST, MQTT_PORT, 60)
        client.loop_forever()
    except Exception as e:
        log.error(f"MQTT error: {e}")
        time.sleep(5)
