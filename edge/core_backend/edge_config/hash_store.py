from pathlib import Path

# RETOMAR?
HASH_FILE = Path("/opt/suite/config/.config_hash")


def read_last_hash():
    if not HASH_FILE.exists():
        return None
    return HASH_FILE.read_text().strip()


def save_hash(h):
    HASH_FILE.parent.mkdir(parents=True, exist_ok=True)
    HASH_FILE.write_text(h)