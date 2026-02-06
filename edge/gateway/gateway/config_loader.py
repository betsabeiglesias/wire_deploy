# gateway/config_loader.py
from typing import Dict, Any, List
import os, copy, yaml

# Claves donde queremos merge "profundo" (dict a dict)
_DEEP_KEYS = {"subscription", "polling", "deadband"}

def _deep_merge(base: Dict[str, Any], ext: Dict[str, Any]) -> Dict[str, Any]:
    out = copy.deepcopy(base or {})
    for k, v in (ext or {}).items():
        if k in _DEEP_KEYS and isinstance(v, dict) and isinstance(out.get(k), dict):
            out[k] = {**out[k], **v}
        else:
            out[k] = copy.deepcopy(v)
    return out

def _apply_defaults(equip_cfg: Dict[str, Any], defaults: Dict[str, Any]) -> Dict[str, Any]:
    # Aplica defaults del root al equipo (deep en algunas claves)
    return _deep_merge(defaults or {}, equip_cfg or {})

def load_gateway_root(path: str) -> Dict[str, Any]:
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}

def load_all_plc_config(root_cfg: Dict[str, Any], project_root: str = ".") -> List[Dict[str, Any]]:
    """
    Carga cada items_file declarado en gateway.yaml → equipments[*].items_file
    Aplica defaults del root a cada equipo y devuelve la lista de configs.
    """
    defaults = root_cfg.get("defaults") or {}
    equipments = root_cfg.get("equipments") or []
    loaded: List[Dict[str, Any]] = []

    for entry in equipments:
        items_file = entry.get("items_file")
        if not items_file:
            continue
        # Resuelve ruta relativa al proyecto
        file_path = items_file if os.path.isabs(items_file) else os.path.join(project_root, items_file)
        with open(file_path, "r", encoding="utf-8") as f:
            equip_cfg = yaml.safe_load(f) or {}
        merged = _apply_defaults(equip_cfg, defaults)
        loaded.append(merged)

    return loaded
