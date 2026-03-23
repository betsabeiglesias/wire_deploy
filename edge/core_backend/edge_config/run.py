# edge_config/run.py

import os
import time
import subprocess

from .sync import fetch_config
from .yaml_builder import build_yaml
from .hash_utils import config_hash
from .hash_store import read_last_hash, save_hash

INTERVAL = int(os.getenv("CONFIG_SYNC_INTERVAL", "30"))

def restart_gateway():
    container = os.getenv("GATEWAY_CONTAINER_NAME", "gateway_customerA")
    try:
        subprocess.run(["docker", "restart", container], check=True)
        print(f"gateway {container} restarted")
    except Exception as e:
        print(f"gateway restart failed: {e}")


def main():
    print("Begin edge_config_sync")
    while True:
        try:
            cfg = fetch_config()
            new_hash = config_hash(cfg)
            old_hash = read_last_hash()

            if new_hash != old_hash:
                print("config changed → regenerating YAML")
                build_yaml(cfg)
                save_hash(new_hash)
                restart_gateway()

            else:
                print("config unchanged")

        except Exception as e:
            print("config sync error:", e)
        time.sleep(INTERVAL)


if __name__ == "__main__":
    main()