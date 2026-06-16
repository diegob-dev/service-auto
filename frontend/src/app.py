import sys
import os
import json
import logging
from datetime import datetime
from logging.handlers import RotatingFileHandler

from dash import Dash, Input, Output, State, callback_context
import dash_bootstrap_components as dbc

# ── paths ─────────────────────────────────────────────────────────────────────

# ── config centralizzata ─────────────────────────────────────────────────────
sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "pages", "01.Home"))
from app_config import cfg, PATHS, PORT, ROOT, get_path
os.chdir(ROOT)

# ── logger ────────────────────────────────────────────────────────────────────

LOG_DIR = os.path.join(ROOT, "log")
os.makedirs(LOG_DIR, exist_ok=True)

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
    handlers=[
        RotatingFileHandler(
            os.path.join(LOG_DIR, "app.log"),
            maxBytes=5 * 1024 * 1024,  # 5MB
            backupCount=3,
            encoding="utf-8"
        ),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("service-vigevano")
logger.info("Avvio applicazione...")

# ── config ────────────────────────────────────────────────────────────────────

try:
    with open("config.json", "r", encoding="utf-8") as f:
        cfg = json.load(f)
    PATHS = cfg["paths"]
    logger.info("Config caricata correttamente")
except Exception as e:
    logger.exception(f"Errore nel caricamento config: {e}")
    raise

# ── layout import ─────────────────────────────────────────────────────────────

try:
    from home import layout
    logger.info("Layout home caricato correttamente")
except Exception as e:
    logger.exception(f"Errore nel caricamento home layout: {e}")
    raise

# ── app init ──────────────────────────────────────────────────────────────────

app = Dash(
    __name__,
    external_stylesheets=[
        dbc.themes.BOOTSTRAP,
        "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@300;400;500;600&display=swap"
    ],
    assets_folder=os.path.join(ROOT, "frontend", "assets")
)
server = app.server
app.layout = layout
logger.info("App Dash inizializzata")

# ── helpers ───────────────────────────────────────────────────────────────────

def save_appointment(email: str):
    path = PATHS["appuntamenti"]
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception:
        data = []
    data.append({"email": email, "data": datetime.now().isoformat()})
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    logger.info(f"Appuntamento salvato per {email}")

# ── callbacks ─────────────────────────────────────────────────────────────────

@app.callback(
    Output("modal-prenota", "is_open"),
    Input("btn-prenota", "n_clicks"),
    Input("btn-annulla", "n_clicks"),
    Input("btn-invia", "n_clicks"),
    State("modal-prenota", "is_open"),
    prevent_initial_call=True
)
def toggle_modal(n_prenota, n_annulla, n_invia, is_open):
    ctx = callback_context.triggered_id
    if ctx == "btn-prenota":
        return True
    if ctx in ("btn-annulla", "btn-invia"):
        return False
    return is_open


@app.callback(
    Output("msg-prenota", "children"),
    Output("msg-prenota", "style"),
    Input("btn-invia", "n_clicks"),
    State("input-email", "value"),
    prevent_initial_call=True
)
def invia_richiesta(n, email):
    base_style = {"marginTop": "12px", "fontFamily": "Inter", "fontSize": "14px"}
    if not email or "@" not in email:
        logger.warning(f"Email non valida: {email}")
        return "⚠️ Inserisci un'email valida.", {**base_style, "color": "#c0392b"}
    save_appointment(email)
    return "✅ Richiesta inviata! Ti contatteremo presto.", {**base_style, "color": "#27ae60"}


if __name__ == "__main__":
    logger.info(f"Avvio server su 0.0.0.0:{PORT}")
    app.run(debug=True, host="0.0.0.0", port=PORT)