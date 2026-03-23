# gateway/driver_registry.py
from typing import Dict, Type
from gateway.drivers.base_driver import BaseDriver
from gateway.drivers.opcua_driver import OPCUADriver
from gateway.drivers.s7_driver import S7Driver
from gateway.drivers.modbus_driver import ModbusTCPDriver

import logging
logger = logging.getLogger("gateway.driver_registry")


DRIVER_REGISTRY: Dict[str, Type[BaseDriver]] = {
    "opcua": OPCUADriver,
    "snap7": S7Driver,
    "modbustcp": ModbusTCPDriver
}

def make_driver(cfg: dict, publisher):
    kind = cfg.get("driver", "").lower().replace(" ", "").replace("-", "")
    cls = DRIVER_REGISTRY.get(kind)
    if not cls:
        raise ValueError(f"Driver no soportado: {kind}")
    return cls(cfg, publisher)
