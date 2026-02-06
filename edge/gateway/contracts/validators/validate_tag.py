#contracts/validators/validate_tag.py

import os, json, yaml
from typing import Dict, Any
from jsonschema import Draft202012Validator, validators

# ===========================================================
# Funciones de carga de archivos (JSON / YAML)
# ===========================================================
def load_json(path: str) -> Dict[str, Any]:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def load_yaml(path: str) -> Dict[str, Any]:
    with open(path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    if data is None:
        raise ValueError("El YAML está vacío o mal formateado.")
    if not isinstance(data, dict):
        raise ValueError("La raíz del YAML debe ser un objeto (clave/valor).")
    return data

# ===========================================================
# (Opcional) Extensión de JSON Schema para aplicar valores por defecto
# ===========================================================
def _extend_with_default(validator_class):
    validate_props = validator_class.VALIDATORS["properties"]

    def set_defaults(validator, properties, instance, schema):
        for prop, subschema in properties.items():
            if "default" in subschema and prop not in instance:
                instance[prop] = subschema["default"]
        for error in validate_props(validator, properties, instance, schema):
            yield error

    return validators.extend(validator_class, {"properties": set_defaults})

DefaultingValidator = _extend_with_default(Draft202012Validator)

# ===========================================================
# Rutas y configuración de schemas
# ===========================================================
BASE_DIR = os.path.dirname(__file__)                                   # .../contracts/validators
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, "..", ".."))     # .../PLC_Connect
CONTRACTS_DIR = os.path.join(PROJECT_ROOT, "contracts")

CDC_SCHEMA_PATH = os.path.join(CONTRACTS_DIR, "cdc_schemas")            # .../contracts/cdc_schemas
TAG_SCHEMA_PATH = os.path.join(CONTRACTS_DIR, "schemas", "v1.tag.json") # .../contracts/schemas/v1.tag.json

# ===========================================================
# Carga y selección de schemas
# ===========================================================
def _load_schema_file(name: str) -> Dict[str, Any]:
    path = os.path.join(CDC_SCHEMA_PATH, name)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def schema_for_driver(driver: str, version: str = "v1") -> Dict[str, Any]:
    driver = (driver or "").lower()
    if not driver:
        raise ValueError("Driver no informado.")
    driver_norm = driver.lower().replace(" ", "").replace("-", "")
    fname = f"mapping.{driver_norm}.{version}.json"
    schema = _load_schema_file(fname)
    # Validación del propio schema (solo durante desarrollo)
    Draft202012Validator.check_schema(schema)
    return schema

def get_tag_schema() -> Dict[str, Any]:
    schema = load_json(TAG_SCHEMA_PATH)
    # Validación del propio schema (solo durante desarrollo)
    Draft202012Validator.check_schema(schema)
    return schema

# ===========================================================
# Funciones de validación
# ===========================================================
def validate_tag(instance: Dict[str, Any]):
    schema = get_tag_schema()
    v = Draft202012Validator(schema)
    errors = sorted(v.iter_errors(instance), key=lambda e: e.path)
    return errors

def validate_mapping(mapping_cfg: Dict[str, Any], apply_defaults: bool = False) -> Dict[str, Any]:
    if not isinstance(mapping_cfg, dict):
        raise TypeError("mapping_cfg debe ser un dict (objeto).")

    driver = mapping_cfg.get("driver")
    if not driver:
        raise ValueError("El mapping no tiene campo 'driver'.")

    schema = schema_for_driver(driver, version="v1")

    if apply_defaults:
        DefaultingValidator(schema).validate(mapping_cfg)
    else:
        Draft202012Validator(schema).validate(mapping_cfg)

    return mapping_cfg



__all__ = ["validate_mapping"]