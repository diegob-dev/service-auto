import sys
import os
import json
from datetime import datetime

from dash import Dash, Input, Output, State, callback_context
import dash_bootstrap_components as dbc

# Aggiungi il path root al sys.path per trovare config.json e le pagine
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "pages", "01.Home"))
os.chdir(ROOT)

from home import layout

# Load config
with open("config.json", "r", encoding="utf-8") as f:
    cfg = json.load(f)

PATHS = cfg["paths"]

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
        return "⚠️ Inserisci un'email valida.", {**base_style, "color": "#c0392b"}
    save_appointment(email)
    return "✅ Richiesta inviata! Ti contatteremo presto.", {**base_style, "color": "#27ae60"}


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=3000)