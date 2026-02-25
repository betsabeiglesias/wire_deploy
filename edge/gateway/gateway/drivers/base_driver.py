import threading
import logging
import time
from typing import Any, Dict, List, Callable, Optional
from domain.process_value import ProcessValue


class BaseDriver:
    """
    Clase base abstracta para todos los drivers del gateway SCADA.

    Define los atributos y el ciclo de vida común (connect/start/stop/emit),
    pero delega la lógica específica de lectura o suscripción a las subclases.
    """
    def __init__(
        self,
        mapping_cfg: Dict[str, Any],
        publisher: Optional[Callable[[Dict[str, Any]], None]] = None,
        driver_name: Optional[str] = None,
    ) -> None:
        

        # Configuración completa del driver (mapping validado)
        self.cfg: Dict[str, Any] = mapping_cfg
        self._started_at = time.monotonic()
        self._first_emit_seen = False

        # Nombre lógico del driver (snap7, opcua, modbus, etc.)
        self.driver_name: str = driver_name or mapping_cfg.get("driver", "unknown")

        # Identidad lógica del equipo (CDC)
        self.equipment_id: str = mapping_cfg.get("equipment_id", "")

        # Lista de señales mapeadas
        self.items: List[Dict[str, Any]] = mapping_cfg.get("items", [])

        # Estado de conexión actual
        self.connected: bool = False
        self.state: str = "INIT" # INIT → CONNECTING → ONLINE → DEGRADED → OFFLINE
        self.last_error: Optional[str] = None

        # Mecanismo de publicación (ej. MQTT, DB, logger, etc.)
        self.publisher: Optional[Callable[[Dict[str, Any]], None]] = publisher

        # Mecanismo de lectura
        self.mode: str = mapping_cfg.get("mode", "polling")

        # Intervalo de lectura (solo para drivers con polling)
        self.poll_ms: int = mapping_cfg.get("poll_ms", 10000)

        # Logger propio, contextualizado por driver/equipo
        self.log: logging.Logger = logging.getLogger(
            f"gateway.{self.driver_name}.{self.equipment_id}"
        )
        self.log.info(f"Publisher asignado: {self.publisher}")

        # Cliente interno (snap7.Client, opcua.Client, etc.)
        self._client: Optional[Any] = None

        # Señal de parada (para loops de polling o tareas async)
        self._stop_event: threading.Event = threading.Event()
        self._supervisor_thread: Optional[threading.Thread] = None
        self._reconnect_backoff: int = 10


        # Heartbeat transversal (última vez que **emitimos** un tag CDC)
        self._last_emit_ts: Optional[float] = None # time.time()
        self._last_emit_monotonic: float = 0.0 
        

        
    def connect(self) -> None:
        raise NotImplementedError

    def disconnect(self) -> None:
        raise NotImplementedError

    def start(self) -> None:
        raise NotImplementedError

    def stop(self) -> None:
        raise NotImplementedError
    
    # -------------------------------
    # Supervisor genérico por driver
    # -------------------------------
    def start_supervisor(self, name_suffix: Optional[str] = None, interval_sec: float = 0.5) -> None:
        """
        Lanza un hilo *ligero* que ejecuta periódicamente `run_supervisor_step()`.
        - `run_supervisor_step()` debe ser *rápido* y no bloquear.
        - Maneja backoff ante errores para evitar bucles apretados.
        """
        if self._supervisor_thread and self._supervisor_thread.is_alive():
            return # ya está corriendo


        self._stop_event.clear()
        thread_name = f"{self.driver_name}-supervisor-{self.equipment_id}"
        if name_suffix:
            thread_name += f"-{name_suffix}"


        def _loop():
            min_backoff, max_backoff = 0.5, 10.0 # segundos
            backoff = min_backoff
            while not self._stop_event.is_set():
                try:
                    self.run_supervisor_step()
                    backoff = min_backoff # si fue bien, reinicia backoff
                    time.sleep(interval_sec)
                except Exception as ex:
                # Cualquier excepción aquí debe *nunca* tumbar el proceso
                    self.last_error = repr(ex)
                    self.log.error(
                    f"Supervisor error: {ex!r}; reintentando en {backoff:.1f}s",
                    exc_info=True,
                    )
                    time.sleep(backoff)
                    backoff = min(backoff * 1.5, max_backoff)


        self._supervisor_thread = threading.Thread(
            target=_loop, name=thread_name, daemon=True
            )
        self._supervisor_thread.start()


    def stop_supervisor(self, join_timeout: float = 2.0) -> None:
        self._stop_event.set()
        t = self._supervisor_thread
        if t and t.is_alive():
            t.join(timeout=join_timeout)
        # Siempre limpia la referencia, esté o no vivo
        self._supervisor_thread = None

    def run_supervisor_step(self) -> None:
        """
        Hook específico de cada driver. Debe:
        - Verificar estado (conexión, sesión/suscripción/polling vivo).
        - Detectar *silencio* (si tu driver tiene callbacks o latidos) usando
        info propia del driver (p. ej., `_last_data_ts` en OPC UA) o el
        heartbeat transversal `_last_emit_ts` si aplica.
        - Reparar en caliente cuando toque (recrear sesión/suscripción, etc.).
        Debe retornar rápido y NO bloquear.
        """
        return
            
    # -------------------------------
    # Utilidades comunes
    # -------------------------------
    def set_state(self, state: str, err: Optional[Exception] = None, connected: Optional[bool] = None) -> None:
        self.state = state
        if connected is not None:
            self.connected = connected
        self.last_error = repr(err) if err else None

    def get_health(self) -> Dict[str, Any]:
        age = None
        if self._last_emit_monotonic:
            age = time.monotonic() - self._last_emit_monotonic
        return {
            "driver": self.driver_name,
            "equipment_id": self.equipment_id,
            "state": self.state,
            "connected": self.connected,
            "last_emit_age_sec": age,
            "last_error": self.last_error,
            "supervisor_running": self.is_supervisor_running(),
        }

    def emit_tag(self, pv: ProcessValue) -> None:
        """
            Envía un ProcessValue de forma segura.
            Actualiza el heartbeat transversal.
        """
        self.log.info(f"🔥 EMIT_TAG CALLED {pv.variable} value={pv.value}")
        try:
            if self.publisher:
                self.publisher(pv)
            else:
                print(f"[EMIT] {self.driver_name} | {self.equipment_id} | {pv}")
            self._last_emit_ts = time.time()
            self._last_emit_monotonic = time.monotonic()
            self._first_emit_seen = True
        except Exception as ex:
            self.log.error(f"Error al emitir ProcessValue: {ex}", exc_info=True)

   
    def last_emit_age_sec(self) -> float:
        """Retorna el tiempo en segundos desde la última emisión de datos."""
        if self._last_emit_ts is None:
            return 0.0  # Si nunca se ha emitido, retornar 0
        return time.time() - self._last_emit_ts

    def is_supervisor_running(self) -> bool:
        return bool(self._supervisor_thread and self._supervisor_thread.is_alive())