# gateway/main.py
import threading
import signal, sys, time, os
from gateway.config_loader import load_all_plc_config, load_gateway_root
from gateway.publishers import make_publisher
from gateway.loggin_setup import configure_logging
from gateway.gateway_manager import GatewayManager


def main():
    # DEVELOP --- [1] Resolver rutas absolutas ---
    # Esto hace que funcione igual en local y en Docker.
    # project_root = os.getenv("PROJECT_ROOT", "/app")
    # root_path = os.getenv("GATEWAY_CONFIG", "/opt/suite/config/gateway.yaml")
    # gateway_path = os.path.join(project_root, root_path)

    # PRODUCTION --- [1] Ruta real del archivo gateway.yaml generado por Django ---
    gateway_path = os.getenv("GATEWAY_CONFIG", "/opt/suite/config/gateway.yaml")

    if not os.path.isfile(gateway_path):
        print(f"[ERROR] No se encuentra gateway.yaml en {gateway_path}")
        sys.exit(1)

    # --- [2] Cargar configuración raíz ---
    root_cfg = load_gateway_root(gateway_path)

    # --- [3] Configurar logging ---
    gw_level = root_cfg.get("gateway", {}).get("log_level", "INFO")
    logfile = root_cfg.get("gateway", {}).get("log_file", None)
    configure_logging(level=gw_level, logfile=logfile)

    # --- [4] Inicializar publisher MQTT / STDOUT / etc. ---
    # publisher_cfg = root_cfg.get("gateway", {}).get("publisher", {})
    # publisher = make_publisher(publisher_cfg)
    publisher = make_publisher(root_cfg)

    # DEVELOP --- [5] Cargar configuraciones de equipos (YAML individuales) ---
    # equipment_cfgs = load_all_plc_config(root_cfg, project_root=project_root)
    # if not equipment_cfgs:
    #     print("[WARN] No se cargó ningún equipo — revisa 'equipments' en gateway.yaml")

    # PRODUCTION --- [5] Crear GatewayManager leyendo TODOS los YAML desde disco ---
    gm = GatewayManager.from_yaml(gateway_path, publisher)


    # --- [6] Crear y arrancar GatewayManager ---
    # DEVELOP gm = GatewayManager(root_cfg, equipment_cfgs, publisher)
    gm.start()

    # --- [7] Control de apagado limpio ---
    shutdown = threading.Event()

    def _graceful(*_):
        print("[INFO] ENTRAMOS EN GRACEFUL (Ctrl+C o SIGTERM recibido)")
        shutdown.set()

    signal.signal(signal.SIGINT, _graceful)
    signal.signal(signal.SIGTERM, _graceful)

    # --- [8] Espera bloqueante y parada ordenada ---
    try:
        while not shutdown.is_set():
            time.sleep(1)
    except KeyboardInterrupt:
        print("[INFO] Interrupción manual (KeyboardInterrupt).")
    finally:
        print("[INFO] Cerrando GatewayManager...")
        gm.stop()
        print("[INFO] Gateway detenido correctamente.")


if __name__ == "__main__":
    main()
