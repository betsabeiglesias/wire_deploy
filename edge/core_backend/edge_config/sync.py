# edge_config/sync.py

"""
Servicio que descarga la configuración desde la API de central
"""

import requests
import os

CENTRAL_HOST = os.getenv("CENTRAL_HOST")
EDGE_TOKEN = os.getenv("EDGE_TOKEN")

# RETOMAR
CONFIG_ENDPOINT = "/api/edge/config/"
CENTRAL_API = f"{CENTRAL_HOST}{CONFIG_ENDPOINT}"
print("CENTRAL_API:", CENTRAL_API)

def fetch_config():
    r = requests.get(
        CENTRAL_API,
        headers={
            "X-EDGE-KEY": os.getenv("EDGE_API_KEY")
        },
        timeout=10
    )
    r.raise_for_status()
    return r.json()