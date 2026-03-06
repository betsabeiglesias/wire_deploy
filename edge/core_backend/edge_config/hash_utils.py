import hashlib
import json


def config_hash(cfg: dict) -> str:
    """
    Calcula hash determinístico del JSON de configuración.
    """
    data = json.dumps(cfg, sort_keys=True).encode("utf-8")
    return hashlib.sha256(data).hexdigest()