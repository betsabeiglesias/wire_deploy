# gateway/gateway_manager.py
from __future__ import annotations
from typing import Callable, Dict, Any, List
import threading, time, traceback
import logging
from gateway.driver_registry import make_driver
import yaml
from pathlib import Path

class GatewayManager:
    def __init__(self, root_cfg: Dict[str, Any], equipment_cfgs: List[Dict[str, Any]], publisher: Callable[[Dict[str, Any]], None]):
        gw = root_cfg.get("gateway") or {}
        self.name = gw.get("name", "gateway")
        self.log_level = gw.get("log_level", "INFO")
        self.log = logging.getLogger(f"gateway.manager.{self.name}")
        self.publisher = publisher
        self.equipment_cfgs = equipment_cfgs
        self.drivers = []
        self._stop = False

    def start(self):
        # Instancia drivers
        for cfg in self.equipment_cfgs:
            try:
                drv = make_driver(cfg, self.publisher)
                self.drivers.append(drv)
                self.log.info(
                    f"Driver creado: {drv.driver_name} | equipment={getattr(drv, 'equipment_id', '?')}"
                )
            except Exception:
                self.log.exception("Error creando driver")
                print(f"[ERR] Creando driver:\n{traceback.format_exc()}")

        # Conecta y arranca
        for d in self.drivers:
            # 1) Intentar conexión (puede fallar si servidor está apagado)
            try:
                d.connect()
                self.log.info(f"✅ Conectado {d.driver_name}/{d.equipment_id}")
            except Exception as e:
                self.log.warning(f"⚠️  No se pudo conectar {d.driver_name}/{d.equipment_id}: {e!r}")

            # 2) Intentar arrancar (puede fallar si no hay conexión)
            try:
                d.start()
            except Exception as e:
                self.log.error(f"Error en start() de {d.equipment_id}: {e!r}")

            # 3) 🔥 SIEMPRE arrancar el supervisor aunque connect() haya fallado
            try:
                d.start_supervisor()
                self.log.info(f"🔄 Supervisor iniciado para {d.driver_name}/{d.equipment_id}")
            except Exception:
                self.log.exception(
                    "Error iniciando supervisor %s/%s",
                    getattr(d,'driver_name','?'),
                    getattr(d,'equipment_id','?')
                )
                print(f"[ERR] Iniciando supervisor:\n{traceback.format_exc()}")
        threading.Thread(target=self._watchdog, daemon=True).start()

    def stop(self):
        self._stop = True
        for d in self.drivers:
            try: d.stop()
            except Exception: self.log.exception("Error parando driver %s/%s", getattr(d,'driver_name','?'), getattr(d,'equipment_id','?'))
        for d in self.drivers:
            try: d.disconnect()
            except Exception: self.log.exception("Error desconectando driver %s/%s", getattr(d,'driver_name','?'), getattr(d,'equipment_id','?'))
        self.log.info("Gateway parado correctamente.")

    def _watchdog(self):
        while not self._stop:
            time.sleep(5)
            # Aquí se puede imprimir estados, métricas o intentar reconectar si cae algo.
    
    @classmethod
    def from_yaml(cls, yaml_path: str, publisher):
        """
        Construye un GatewayManager leyendo gateway.yaml + todos los YAML de equipos.
        """
        yaml_path = Path(yaml_path)

        if not yaml_path.exists():
            raise FileNotFoundError(f"Gateway YAML not found: {yaml_path}")

        # --- Cargar gateway.yaml ---
        with open(yaml_path, "r") as f:
            root_cfg = yaml.safe_load(f) or {}
        
        # --- Cargar YAMLs de equipos (items_file) ---
        equipments_cfgs = []
        for entry in root_cfg.get("equipments", []):
            items_file = entry.get("items_file")
            if not items_file:
                continue

            base_dir = yaml_path.parent

            items_file_path = Path(items_file)

            # Si es ruta relativa → resolver respecto al gateway.yaml
            if not items_file_path.is_absolute():
                items_file_path = base_dir / items_file_path

            items_file_path = items_file_path.resolve()

            if not items_file_path.exists():
                raise FileNotFoundError(f"PLC YAML not found: {items_file_path}")

            with open(items_file_path, "r") as f:
                equipment_cfg = yaml.safe_load(f) or {}

            equipments_cfgs.append(equipment_cfg)

        # Crear instancia del gateway con las configs cargadas
        return cls(root_cfg, equipments_cfgs, publisher)

