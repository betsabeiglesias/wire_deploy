"""
Modelo canónico interno de datos de proceso industrial.

Este modelo define la representación única y estable de un valor
de proceso dentro del gateway, independientemente de transporte,
persistencia o consumidores externos.
"""

from datetime import datetime, timezone
from typing import Any, Dict, Optional, Union
import logging

logger = logging.getLogger(__name__)


class ProcessValue:
    __slots__ = (
        'equipment_id', 'variable', 'value', 'datatype',
        'timestamp', 'quality', 'unit', 'source'
    )
    
    def __init__(
        self,
        equipment_id: str,
        variable: str,
        value: Any,
        datatype: str,
        timestamp: Optional[Union[datetime, str, int]] = None,
        quality: str = "Good",
        unit: str = "-",
        source: Optional[Dict[str, Any]] = None
    ):
        self.equipment_id = equipment_id
        self.variable = variable
        self.value = value
        self.datatype = datatype
        self.timestamp = self._normalize_timestamp(timestamp)
        self.quality = self._normalize_quality(quality)
        self.unit = unit or "-"
        self.source = source or {}
    
    @staticmethod
    def _normalize_timestamp(ts: Optional[Union[datetime, str, int]]) -> str:
        if ts is None:
            dt = datetime.now(timezone.utc)

        elif isinstance(ts, datetime):
            dt = ts.astimezone(timezone.utc)

        elif isinstance(ts, int):
            # Detectar milisegundos vs segundos
            if ts > 10_000_000_000:  # > año 2286 en segundos
                ts = ts / 1000
            dt = datetime.fromtimestamp(ts, tz=timezone.utc)

        elif isinstance(ts, str):
            if "Z" in ts or "+" in ts:
                return ts.replace("+00:00", "Z")
            return ts + "Z"

        else:
            dt = datetime.now(timezone.utc)

        return dt.isoformat().replace("+00:00", "Z")
    
    @staticmethod
    def _normalize_quality(quality: str) -> str:
        if not quality:
            return "Good"
        return quality.capitalize()
    
    def validate(self) -> bool:
        """Valida coherencia del ProcessValue"""
        if not self.equipment_id or not self.variable:
            logger.error(f"ProcessValue inválido: equipment_id o variable vacío")
            return False
        
        if self.value is None:
            logger.error(f"ProcessValue inválido: value es None")
            return False
        
        # Validar coherencia datatype <-> value
        if self.datatype == "Boolean":
            if not isinstance(self.value, bool):
                logger.error(f"Datatype=Boolean pero value={type(self.value).__name__}")
                return False
        
        elif self.datatype in ("Int16", "Int32", "UInt16", "UInt32"):
            if isinstance(self.value, bool):
                logger.error(f"Datatype={self.datatype} pero value es bool")
                return False
            if not isinstance(self.value, int):
                logger.error(f"Datatype={self.datatype} pero value={type(self.value).__name__}")
                return False
        
        elif self.datatype in ("Float", "Double"):
            if isinstance(self.value, bool):
                logger.error(f"Datatype={self.datatype} pero value es bool")
                return False
            if not isinstance(self.value, (int, float)):
                logger.error(f"Datatype={self.datatype} pero value={type(self.value).__name__}")
                return False
        
        return True
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "timestamp": self.timestamp,
            "equipment_id": self.equipment_id,
            "variable": self.variable,
            "value": self.value,
            "datatype": self.datatype,
            "unit": self.unit,
            "quality": self.quality,
            "source": self.source
        }
    
    def to_event(self, *, tenant: str) -> Dict[str, Any]:
        """
        Convierte el ProcessValue al contrato externo versionado v1.
        """
        return {
            "schema": "v1.process_value",
            "tenant": tenant,
            "equipment_id": self.equipment_id,
            "variable": self.variable,
            "value": self.value,
            "datatype": self.datatype,
            "unit": self.unit,
            "quality": self.quality.upper(),
            "ts": self.timestamp,
            "source": self.source,
        }

    
    @classmethod
    def from_tag(cls, tag: Dict[str, Any]) -> Optional['ProcessValue']:
        """
        Crea ProcessValue desde un tag del driver.
        
        Args:
            tag: Dict con equipment_id, variable, value, datatype, etc.
        
        Returns:
            ProcessValue validado o None si inválido
        """
        try:
            pv = cls(
                equipment_id=tag.get("equipment_id", ""),
                variable=tag.get("variable", ""),
                value=tag.get("value"),
                datatype=tag.get("datatype", "Float"),
                timestamp=tag.get("timestamp"),
                quality=tag.get("quality", "Good"),
                unit=tag.get("unit", "-"),
                source=tag.get("source", {})
            )
            
            if not pv.validate():
                return None
            
            return pv
        
        except Exception as e:
            logger.error(f"Error creando ProcessValue: {e}")
            return None
    
    def __repr__(self):
        return f"ProcessValue({self.equipment_id}/{self.variable}={self.value} [{self.datatype}])"