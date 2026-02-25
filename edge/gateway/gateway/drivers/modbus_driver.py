# gateway/drivers/modbus_driver.py
# Driver Modbus TCP COMPLETO: FC1 / FC2 / FC3 / FC4 soportados

from __future__ import annotations
import time
import threading
import logging
from typing import Any, Dict, Optional, Tuple
from datetime import datetime, timezone
from struct import pack, unpack

from pymodbus.client import ModbusTcpClient
from gateway.drivers.base_driver import BaseDriver
from domain.process_value import ProcessValue

def utc_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


class ModbusTCPDriver(BaseDriver):
    """
    Driver Modbus TCP completo con soporte para:
    - FC1  read_coils
    - FC2  read_discrete_inputs
    - FC3  read_holding_registers
    - FC4  read_input_registers
    """

    def __init__(self, config: Dict[str, Any], publisher=None):
        super().__init__(config, publisher, driver_name="modbus")

        conn = config["connection"]
        self.host = conn["host"]
        self.port = conn.get("port", 502)
        self.unit_id = conn.get("unit_id", 1)  # Modbus Unit/Slave ID
        self.poll_rate_ms = conn.get("poll_rate_ms", 500)

        fmt = config.get("modbus_format", {})
        self.default_byte_order = fmt.get("byte_order", "big").lower()
        self.default_word_order = fmt.get("word_order", "big").lower()

        self.items = config["items"]
        self.client: Optional[ModbusTcpClient] = None
      
        self._stop_flag = threading.Event()
        self._thread: Optional[threading.Thread] = None
        self.last_emit_ts = 0
        
        # Logger específico
        self.logger = logging.getLogger(f"gateway.modbus.{self.equipment_id}")
        
        self.logger.info(
            f"🔧 ModbusDriver inicializado: {self.host}:{self.port} (Unit ID={self.unit_id}), "
            f"poll={self.poll_rate_ms}ms, items={len(self.items)}, "
            f"formato: byte={self.default_byte_order}, word={self.default_word_order}"
        )

    # -----------------------------------------------------------
    # Lifecycle
    # -----------------------------------------------------------
    def connect(self):
        """Conecta al servidor Modbus TCP"""
        try:
            if self.client is None:
                self.logger.info(f"📡 Creando cliente Modbus para {self.host}:{self.port}")
                self.client = ModbusTcpClient(self.host, port=self.port, timeout=3)
            
            # Intento de conexión ModbusTCP
            self.logger.info(f"🔌 Conectando a {self.host}:{self.port}...")
            connected = self.client.connect()
            
            if connected:
                self.logger.info(f"✅ Conectado exitosamente a {self.host}:{self.port}")
                self.set_state("ONLINE", connected=True)
            else:
                self.logger.warning(f"❌ No se pudo conectar a {self.host}:{self.port}")
                self.set_state("OFFLINE", connected=False)
            
            return connected
            
        except Exception as e:
            self.logger.error(f"💥 Error en connect(): {e!r}", exc_info=True)
            self.set_state("OFFLINE", err=e, connected=False)
            return False

    def disconnect(self):
        """Desconecta del servidor Modbus TCP"""
        if self.client:
            try:
                self.logger.info("🔌 Desconectando cliente Modbus...")
                self.client.close()
                self.logger.info("✅ Cliente Modbus desconectado")
            except Exception as e:
                self.logger.error(f"⚠️ Error al desconectar: {e!r}")
        self.client = None
        self.set_state("OFFLINE", connected=False)

    def start(self):
        """Inicia el thread de polling"""
        if self._thread and self._thread.is_alive():
            self.logger.warning("⚠️ Thread de polling ya está corriendo")
            return
            
        self.logger.info("🚀 Iniciando thread de polling...")
        self._stop_flag.clear()
        self._thread = threading.Thread(
            target=self._run_loop, 
            name=f"modbus-poll-{self.equipment_id}",
            daemon=True
        )
        self._thread.start()
        self.logger.info("✅ Thread de polling iniciado")

    def stop(self):
        """Detiene el thread de polling"""
        self.logger.info("🛑 Deteniendo thread de polling...")
        self._stop_flag.set()
        self.disconnect()
        if self._thread:
            self._thread.join(timeout=2)
            if self._thread.is_alive():
                self.logger.warning("⚠️ Thread no terminó en 2 segundos")
        self.logger.info("✅ Thread detenido")

    # -----------------------------------------------------------
    # Polling loop
    # -----------------------------------------------------------
    def _run_loop(self):
        """Loop principal de polling"""
        interval = self.poll_rate_ms / 1000.0
        self.logger.info(f"🔄 Loop iniciado con intervalo={interval:.3f}s")
        
        reconnect_attempts = 0
        max_reconnect_attempts = 5
        
        while not self._stop_flag.is_set():
            try:
                # Verificar/restablecer conexión
                if not self.client or not self.client.connected:
                    self.logger.warning(f"⚠️ Cliente no conectado, reconectando (intento {reconnect_attempts + 1}/{max_reconnect_attempts})...")
                    if self.connect():
                        reconnect_attempts = 0  # Reset counter on success
                    else:
                        reconnect_attempts += 1
                        if reconnect_attempts >= max_reconnect_attempts:
                            self.logger.error(f"❌ Máximo de intentos de reconexión alcanzado, esperando {interval*5:.1f}s")
                            time.sleep(interval * 5)  # Wait longer after multiple failures
                            reconnect_attempts = 0
                        time.sleep(interval)
                        continue
                
                # Ejecutar ciclo de lectura
                self._poll_once()
                
            except Exception as exc:
                self.logger.error(f"💥 Error en loop principal: {exc!r}", exc_info=True)
                self.disconnect()
                time.sleep(interval)
                continue

            time.sleep(interval)
        
        self.logger.info("🏁 Loop de polling finalizado")

    # -----------------------------------------------------------
    # One cycle
    # -----------------------------------------------------------
    def _poll_once(self):
        """Ejecuta un ciclo de lectura de todos los items"""
        if not self.client or not self.client.connected:
            self.logger.debug("⏭️ Skipping poll - not connected")
            return
            
        success_count = 0
        error_count = 0
        
        for item in self.items:
            variable = item["name"]
                        
            addressing = item.get("addressing", {})
            address_str = (
                addressing.get("register") or
                addressing.get("address") or
                item.get("address")
            )

            # 🔥 Convertir a entero
            try:
                address = int(address_str)
            except (ValueError, TypeError) as e:
                self.logger.warning(f"⚠️ Address inválido '{address_str}' para '{variable}': {e}")
                continue



            datatype = item.get("datatype", "Int16")
            scale = item.get("scale", None)
            unit = item.get("unit", "")
            fc = item.get("fc", self._auto_fc(address))

            item_format = item.get("format", {})
            byte_order = item_format.get("byte_order", self.default_byte_order)
            word_order = item_format.get("word_order", self.default_word_order)

            try:
                # Leer valor
                value = self._read(address, datatype, fc, byte_order, word_order)

                if value is None:
                    self.logger.warning(f"⚠️ Lectura falló para {variable}@{address} (FC{fc})")
                    error_count += 1
                    continue

                # Aplicar escala si existe
                if scale:
                    try:
                        original_value = value
                        value = value * float(scale)
                        self.logger.debug(f"📐 Escala aplicada: {original_value} * {scale} = {value}")
                    except Exception as e:
                        self.logger.warning(f"⚠️ Error aplicando escala a {variable}: {e}")

                # Normalizar datatype para Boolean
                normalized_datatype = "Boolean" if datatype == "Bool" else datatype

                # Emitir CDC tag
                pv = ProcessValue(
                    equipment_id=self.equipment_id,
                    variable=variable,
                    value=value,
                    datatype=normalized_datatype,
                    unit=unit,
                    quality="Good",
                    timestamp=utc_iso(),
                    source={
                        "protocol": "modbus",
                        "address": address,
                        "fc": fc,
                        "format": f"{byte_order}-{word_order}"
                    }
                )
                
                self.logger.debug(f"📤 Emitiendo: {variable}={value} ({normalized_datatype})")
                self.emit_tag(pv)
                
                self.last_emit_ts = time.time()
                success_count += 1

            except Exception as exc:
                self.logger.error(
                    f"💥 Error leyendo {variable}@{address} (FC{fc}): {exc!r}", 
                    exc_info=True
                )
                error_count += 1
        
        if success_count > 0:
            self.logger.debug(f"✅ Ciclo completado: {success_count} OK, {error_count} errores")

    # -----------------------------------------------------------
    # Selección automática del FC (si YAML no indica fc:)
    # -----------------------------------------------------------
    def _auto_fc(self, address: int = None) -> int:
        """Detecta FC automáticamente por rango de address"""
        if address is not None:
            if 1 <= address <= 9999:
                return 1  # Coils (FC1)
            elif 10001 <= address <= 19999:
                return 2  # Discrete Inputs (FC2)
            elif 30001 <= address <= 39999:
                return 4  # Input Registers (FC4)
            elif 40001 <= address <= 49999:
                return 3  # Holding Registers (FC3)
        return 3
    
    # -----------------------------------------------------------
    # Lectura Modbus genérica
    # -----------------------------------------------------------
    def _read(self, address: int, datatype: str, fc: int, 
              byte_order: str = "big", word_order: str = "big"):
        """
        Lee desde Modbus según Function Code con formato configurable.
        
        byte_order: "big" o "little" - orden de bytes dentro de cada palabra
        word_order: "big" o "little" - orden de palabras (para 32-bit)
        
        Combinaciones:
        - big-big     = ABCD (estándar Modbus)
        - little-little = DCBA
        - big-little  = BADC (byte swap)
        - little-big  = CDAB (word swap)
        """
        
        try:
            # === LECTURA DE BITS (FC1, FC2) ===
            if fc == 1:
                self.logger.debug(f"🔍 FC1 read_coils({address}, 1, slave={self.unit_id})")
                rr = self.client.read_coils(address, 1, slave=self.unit_id)
                if rr.isError():
                    self.logger.warning(f"❌ FC1 error en @{address}: {rr}")
                    return None
                return bool(rr.bits[0])

            elif fc == 2:
                self.logger.debug(f"🔍 FC2 read_discrete_inputs({address}, 1, slave={self.unit_id})")
                rr = self.client.read_discrete_inputs(address, 1, slave=self.unit_id)
                if rr.isError():
                    self.logger.warning(f"❌ FC2 error en @{address}: {rr}")
                    return None
                return bool(rr.bits[0])

            # === LECTURA DE REGISTROS (FC3, FC4) ===
            elif fc in (3, 4):
                count = 1
                if datatype in ("Float", "Int32", "UInt32"):
                    count = 2

                if fc == 3:
                    self.logger.debug(f"🔍 FC3 read_holding_registers({address}, {count}, slave={self.unit_id})")
                    rr = self.client.read_holding_registers(address, count, slave=self.unit_id)
                else:
                    self.logger.debug(f"🔍 FC4 read_input_registers({address}, {count}, slave={self.unit_id})")
                    rr = self.client.read_input_registers(address, count, slave=self.unit_id)

                if rr.isError():
                    self.logger.warning(f"❌ FC{fc} error en @{address}: {rr}")
                    return None
                    
                if not rr.registers:
                    self.logger.warning(f"❌ FC{fc} sin registros en @{address}")
                    return None

                regs = rr.registers
                self.logger.debug(f"📊 FC{fc} @{address}: regs={regs} (formato: {byte_order}-{word_order})")

                # === DECODIFICACIÓN SEGÚN TIPO ===
                
                # Int16 / UInt16 - solo 1 registro, byte_order afecta
                if datatype == "Int16":
                    return self._decode_int16(regs[0], byte_order)
                
                elif datatype == "UInt16":
                    return self._decode_uint16(regs[0], byte_order)
                
                # Int32 / UInt32 - 2 registros, ambos orders afectan
                elif datatype == "Int32":
                    return self._decode_int32(regs, byte_order, word_order)
                
                elif datatype == "UInt32":
                    return self._decode_uint32(regs, byte_order, word_order)
                
                # Float - 2 registros, ambos orders afectan
                elif datatype == "Float":
                    return self._decode_float(regs, byte_order, word_order)

                else:
                    self.logger.error(f"❌ Datatype no soportado: {datatype}")
                    return None

            else:
                self.logger.error(f"❌ FC {fc} no soportado")
                return None
                
        except Exception as e:
            self.logger.error(
                f"💥 Excepción en _read(@{address}, {datatype}, FC{fc}, "
                f"{byte_order}-{word_order}): {e!r}", 
                exc_info=True
            )
            return None

    # === 🔥 MÉTODOS DE DECODIFICACIÓN ===
    
    def _decode_int16(self, reg: int, byte_order: str) -> int:
        """Decodifica Int16 con signo"""
        if byte_order == "little":
            # Swap bytes dentro del registro
            reg = ((reg & 0xFF) << 8) | ((reg & 0xFF00) >> 8)
        
        # Interpretar como signed
        if reg > 32767:
            reg -= 65536
        return reg
    
    def _decode_uint16(self, reg: int, byte_order: str) -> int:
        """Decodifica UInt16 sin signo"""
        if byte_order == "little":
            reg = ((reg & 0xFF) << 8) | ((reg & 0xFF00) >> 8)
        return reg & 0xFFFF
    
    def _decode_int32(self, regs: list, byte_order: str, word_order: str) -> int:
        """Decodifica Int32 con signo"""
        # Aplicar word order
        if word_order == "little":
            regs = [regs[1], regs[0]]  # Swap words
        
        # Determinar formato de pack según byte_order
        fmt = ">HH" if byte_order == "big" else "<HH"
        
        # Empacar y desempacar como int32
        raw_bytes = pack(fmt, regs[0], regs[1])
        fmt_int = ">i" if byte_order == "big" else "<i"
        return unpack(fmt_int, raw_bytes)[0]
    
    def _decode_uint32(self, regs: list, byte_order: str, word_order: str) -> int:
        """Decodifica UInt32 sin signo"""
        # Aplicar word order
        if word_order == "little":
            regs = [regs[1], regs[0]]
        
        fmt = ">HH" if byte_order == "big" else "<HH"
        raw_bytes = pack(fmt, regs[0], regs[1])
        fmt_int = ">I" if byte_order == "big" else "<I"
        return unpack(fmt_int, raw_bytes)[0]
    
    def _decode_float(self, regs: list, byte_order: str, word_order: str) -> float:
        """
        Decodifica Float32 con formato configurable.
        
        Ejemplos:
        - big-big (ABCD): Estándar Modbus, pack(">HH"), unpack(">f")
        - little-little (DCBA): pack("<HH"), unpack("<f")
        - big-little (BADC): pack(">HH") con words swapped
        - little-big (CDAB): pack("<HH") con words swapped
        """
        # Aplicar word order
        if word_order == "little":
            regs = [regs[1], regs[0]]  # Swap words
        
        # Determinar formato según byte_order
        if byte_order == "big":
            raw_bytes = pack(">HH", regs[0], regs[1])
            return unpack(">f", raw_bytes)[0]
        else:  # little
            raw_bytes = pack("<HH", regs[0], regs[1])
            return unpack("<f", raw_bytes)[0]

    def get_health(self) -> Dict[str, Any]:
        """Retorna estado de salud del driver"""
        return {
            "equipment_id": self.equipment_id,
            "driver": "modbus",
            "state": self.state,
            "connected": self.client.connected if self.client else False,
            "last_emit_ts": self.last_emit_ts,
            "last_emit_age": time.time() - self.last_emit_ts if self.last_emit_ts else None,
            "thread_alive": self._thread.is_alive() if self._thread else False,
            "format": f"{self.default_byte_order}-{self.default_word_order}"
        }