# gateway/logging_setup.py
import logging
from logging.handlers import RotatingFileHandler
from typing import Optional

DEFAULT_FORMAT = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
DEFAULT_DATEFMT = "%Y-%m-%d %H:%M:%S"

def configure_logging(level: str = "INFO", logfile: Optional[str] = None, max_bytes: int = 10_000_000, backup_count: int = 3) -> None:
    """
    Configura logging global con handler a consola y, opcionalmente, a fichero rotativo.
    Llamar *antes* de crear/arrancar drivers y del GatewayManager.
    """
    numeric_level = getattr(logging, level.upper(), logging.INFO)

    # Root logger
    root = logging.getLogger()
    root.setLevel(numeric_level)

    # Consola
    console_handler = logging.StreamHandler()
    console_handler.setLevel(numeric_level)
    console_fmt = logging.Formatter(DEFAULT_FORMAT, datefmt=DEFAULT_DATEFMT)
    console_handler.setFormatter(console_fmt)

    # Evitar duplicados: si ya hay un handler de stream, reemplazarlo
    # (útil si se llama configure_logging varias veces)
    had_stream = False
    for h in list(root.handlers):
        if isinstance(h, logging.StreamHandler):
            root.removeHandler(h)
            had_stream = True
    root.addHandler(console_handler)

    # Fichero rotativo opcional
    if logfile:
        fh = RotatingFileHandler(logfile, maxBytes=max_bytes, backupCount=backup_count, encoding="utf-8")
        fh.setLevel(numeric_level)
        fh.setFormatter(logging.Formatter(DEFAULT_FORMAT, datefmt=DEFAULT_DATEFMT))
        # Evitar múltiples file handlers idénticos
        existing_files = [getattr(h, "baseFilename", None) for h in root.handlers if hasattr(h, "baseFilename")]
        if logfile not in existing_files:
            root.addHandler(fh)

    # Opcional: silenciar logs muy verbosos de librerías (ajusta según convenga)
    logging.getLogger("asyncio").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("opcua").setLevel(logging.INFO)  # si quieres ver algo de OPC UA, deja INFO o DEBUG

    # Mensaje inicial
    logging.getLogger("gateway.logging_setup").debug("Logging configured", extra={"level": level, "logfile": logfile})
