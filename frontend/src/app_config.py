import json
import os

# Root del progetto (due livelli sopra frontend/src)
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

# Carica config.json dalla root
with open(os.path.join(ROOT, "config.json"), "r", encoding="utf-8") as f:
    cfg = json.load(f)

PATHS = cfg["paths"]
PORT  = cfg.get("port", 3000)

def get_path(key: str) -> str:
    """Restituisce il path assoluto dato una chiave in PATHS."""
    return os.path.join(ROOT, PATHS[key])

def read_text(key: str) -> str:
    """Legge e restituisce il contenuto di un file di testo dato una chiave in PATHS."""
    with open(get_path(key), "r", encoding="utf-8") as f:
        return f.read().strip()