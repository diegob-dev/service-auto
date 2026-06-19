import sys
import os
import json
import logging
import functools
from datetime import datetime
from logging.handlers import RotatingFileHandler

from dash import Dash, Input, Output, State, callback_context, dcc, html, ALL
import dash_bootstrap_components as dbc

# ── config centralizzata ──────────────────────────────────────────────────────
sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "pages", "01.Home"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "pages", "02.Servizi"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "pages", "03.Prenota"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "pages", "04.ParcoAuto"))

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
            maxBytes=5 * 1024 * 1024,
            backupCount=3,
            encoding="utf-8"
        ),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("service-vigevano")
logger.info("Avvio applicazione...")

def log_cb(name):
    """Decorator che logga eccezioni nei callback su file."""
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                return fn(*args, **kwargs)
            except Exception as e:
                logger.exception(f"Errore callback [{name}]: {e}")
                raise
        return wrapper
    return decorator

# ── import pagine ─────────────────────────────────────────────────────────────
try:
    from home import layout as home_layout
    from servizi import layout as servizi_layout
    from prenota import layout as prenota_layout
    from parco_auto import layout_fn as parco_auto_layout_fn, auto_card
    from auto_detail import layout_fn as auto_detail_layout_fn
    from sidebar import sidebar
    logger.info("Tutte le pagine caricate correttamente")
except Exception as e:
    logger.exception(f"Errore nel caricamento pagine: {e}")
    raise

# ── app init ──────────────────────────────────────────────────────────────────
app = Dash(
    __name__,
    external_stylesheets=[
        dbc.themes.BOOTSTRAP,
        "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@300;400;500;600&display=swap"
    ],
    assets_folder=get_path("assets"),
    use_pages=False,
    suppress_callback_exceptions=True
)
server = app.server

app.layout = html.Div([
    dcc.Location(id="url", refresh=False),
    html.Div(id="sidebar-container"),
    html.Div(id="page-content", className="main-content"),

    # Modal contattami - sempre nel DOM, gestito da app.py
    dbc.Modal([
        dbc.ModalHeader(dbc.ModalTitle("Richiedi informazioni",
                                       style={"fontFamily": "Playfair Display"})),
        dbc.ModalBody([
            html.P("Lascia il tuo numero di telefono e ti ricontattiamo al più presto.",
                   style={"fontFamily": "Inter", "color": "#555", "marginBottom": "16px"}),
            dbc.Input(id="contatta-telefono", type="tel",
                      placeholder="+39 333 1234567",
                      style={"fontFamily": "Inter", "marginBottom": "12px"}),
            dbc.Input(id="contatta-auto-id", type="hidden"),
            html.Div(id="contatta-msg", style={"fontFamily": "Inter", "fontSize": "14px"})
        ]),
        dbc.ModalFooter([
            dbc.Button("Annulla", id="contatta-annulla", color="secondary", className="me-2"),
            dbc.Button("Invia", id="contatta-invia", color="warning",
                       style={"backgroundColor": "#C9A84C", "border": "none"})
        ])
    ], id="modal-contatta", is_open=False),
])
logger.info("App Dash inizializzata")

# ── helpers ───────────────────────────────────────────────────────────────────
def save_appointment(email="", note="", telefono="", auto_id=""):
    path = PATHS["appuntamenti"]
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception:
        data = []
    data.append({"email": email, "telefono": telefono,
                 "auto_id": auto_id, "note": note,
                 "data": datetime.now().isoformat()})
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    logger.info(f"Contatto salvato - email:{email} tel:{telefono} auto:{auto_id}")

# ── routing ───────────────────────────────────────────────────────────────────
@app.callback(
    Output("page-content", "children"),
    Output("sidebar-container", "children"),
    Input("url", "pathname")
)
@log_cb("render_page")
def render_page(pathname):
    if pathname == "/servizi":
        return servizi_layout, sidebar("/servizi")
    elif pathname == "/prenota":
        return prenota_layout, sidebar("/prenota")
    elif pathname == "/parco-auto":
        return parco_auto_layout_fn(), sidebar("/parco-auto")
    elif pathname and pathname.startswith("/parco-auto/"):
        auto_id = pathname.split("/parco-auto/")[1]
        return auto_detail_layout_fn(auto_id), sidebar("/parco-auto")
    else:
        return home_layout, sidebar("/")

# ── modal contattami (parco auto lista) ──────────────────────────────────────
@app.callback(
    Output("modal-contatta", "is_open"),
    Output("contatta-auto-id", "value"),
    Input({"type": "btn-contatta", "index": ALL}, "n_clicks"),
    Input("contatta-annulla", "n_clicks"),
    Input("contatta-invia", "n_clicks"),
    State("modal-contatta", "is_open"),
    State("url", "pathname"),
    prevent_initial_call=True
)
@log_cb("toggle_modal_contatta")
def toggle_modal_contatta(n_list, n_annulla, n_invia, is_open, pathname):
    if pathname and pathname.startswith("/parco-auto/"):
        return False, ""
    ctx = callback_context
    if not ctx.triggered:
        return is_open, ""
    trigger = ctx.triggered[0]["prop_id"]
    if "btn-contatta" in trigger:
        triggered_id = json.loads(trigger.split(".")[0])
        return True, triggered_id["index"]
    if trigger in ("contatta-annulla.n_clicks", "contatta-invia.n_clicks"):
        return False, ""
    return is_open, ""

@app.callback(
    Output("contatta-msg", "children"),
    Input("contatta-invia", "n_clicks"),
    State("contatta-telefono", "value"),
    State("contatta-auto-id", "value"),
    prevent_initial_call=True
)
@log_cb("invia_contatta")
def invia_contatta(n, telefono, auto_id):
    if not telefono:
        return html.Span("⚠️ Inserisci il tuo numero.", style={"color": "#c0392b"})
    save_appointment(telefono=telefono, auto_id=auto_id)
    return html.Span("✅ Richiesta inviata! Ti ricontattiamo presto.", style={"color": "#27ae60"})

# ── form contatto pagina dettaglio ────────────────────────────────────────────
@app.callback(
    Output("detail-contact-msg", "children"),
    Input({"type": "btn-detail-tel", "index": ALL}, "n_clicks"),
    State("detail-contact-tel", "value"),
    prevent_initial_call=True
)
@log_cb("invia_detail_contatta")
def invia_detail_contatta(n_list, telefono):
    ctx = callback_context
    if not ctx.triggered or not any(n for n in n_list if n):
        return ""
    trigger = ctx.triggered[0]["prop_id"]
    auto_id = json.loads(trigger.split(".")[0])["index"]
    if not telefono:
        return html.Span("⚠️ Inserisci il tuo numero.", style={"color": "#c0392b", "fontFamily": "Inter"})
    save_appointment(telefono=telefono, auto_id=auto_id)
    return html.Span("✅ Ti ricontattiamo presto!", style={"color": "#27ae60", "fontFamily": "Inter"})

# ── lightbox ──────────────────────────────────────────────────────────────────
@app.callback(
    Output("lightbox-modal", "is_open"),
    Output("lightbox-carousel", "active_index"),
    Input("lightbox-trigger", "n_clicks"),
    Input({"type": "thumb", "index": ALL}, "n_clicks"),
    State("lightbox-modal", "is_open"),
    State("thumb-active", "data"),
    prevent_initial_call=True
)
@log_cb("toggle_lightbox")
def toggle_lightbox(n_main, n_thumbs, is_open, active_idx):
    ctx = callback_context
    if not ctx.triggered:
        return is_open, active_idx or 0
    trigger = ctx.triggered[0]["prop_id"]
    logger.debug(f"Lightbox trigger: {trigger}")
    if "lightbox-trigger" in trigger:
        return True, active_idx or 0
    if "thumb" in trigger:
        idx = json.loads(trigger.split(".")[0])["index"]
        return True, idx
    return False, 0

@app.callback(
    Output("lightbox-main-img", "src"),
    Output("thumb-active", "data"),
    Input({"type": "thumb", "index": ALL}, "n_clicks"),
    State({"type": "thumb", "index": ALL}, "src"),
    prevent_initial_call=True
)
@log_cb("update_main_img")
def update_main_img(n_thumbs, srcs):
    ctx = callback_context
    if not ctx.triggered or not srcs:
        return srcs[0] if srcs else "", 0
    trigger = ctx.triggered[0]["prop_id"]
    idx = json.loads(trigger.split(".")[0])["index"]
    return srcs[idx], idx

# ── callbacks home ────────────────────────────────────────────────────────────
@app.callback(
    Output("modal-prenota", "is_open"),
    Input("btn-prenota", "n_clicks"),
    Input("btn-annulla", "n_clicks"),
    Input("btn-invia", "n_clicks"),
    State("modal-prenota", "is_open"),
    prevent_initial_call=True
)
@log_cb("toggle_modal")
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
@log_cb("invia_richiesta_home")
def invia_richiesta_home(n, email):
    base_style = {"marginTop": "12px", "fontFamily": "Inter", "fontSize": "14px"}
    if not email or "@" not in email:
        return "⚠️ Inserisci un'email valida.", {**base_style, "color": "#c0392b"}
    save_appointment(email=email)
    return "✅ Richiesta inviata! Ti contatteremo presto.", {**base_style, "color": "#27ae60"}

# ── callbacks prenota ─────────────────────────────────────────────────────────
@app.callback(
    Output("prenota-msg", "children"),
    Output("prenota-msg", "style"),
    Input("prenota-btn-invia", "n_clicks"),
    State("prenota-email", "value"),
    State("prenota-note", "value"),
    prevent_initial_call=True
)
@log_cb("invia_richiesta_prenota")
def invia_richiesta_prenota(n, email, note):
    base_style = {"fontFamily": "Inter", "fontSize": "14px"}
    if not email or "@" not in email:
        return "⚠️ Inserisci un'email valida.", {**base_style, "color": "#c0392b"}
    save_appointment(email=email, note=note or "")
    return "✅ Richiesta inviata! Ti contatteremo entro il primo giorno lavorativo.", {**base_style, "color": "#27ae60"}

# ── filtri parco auto ─────────────────────────────────────────────────────────
@app.callback(
    Output("auto-grid", "children"),
    Input("filtro-prezzo-min", "value"),
    Input("filtro-prezzo-max", "value"),
    Input("filtro-marca", "value"),
    Input("filtro-tipo", "value"),
    Input("auto-data", "data"),
    State("url", "pathname"),
    prevent_initial_call=False
)
@log_cb("filtra_auto")
def filtra_auto(prezzo_min, prezzo_max, marca, tipo, auto_list, pathname):
    if pathname and pathname.startswith("/parco-auto/"):
        from dash.exceptions import PreventUpdate
        raise PreventUpdate
    if not auto_list:
        return html.P("Nessun veicolo disponibile.", style={"fontFamily": "Inter", "color": "#999"})
    filtrati = []
    for a in auto_list:
        try:
            prezzo = float(a.get("Prezzo scontato") or a.get("Prezzo") or 0)
        except Exception:
            prezzo = 0
        if prezzo_min and prezzo < float(prezzo_min):
            continue
        if prezzo_max and prezzo > float(prezzo_max):
            continue
        if marca and a.get("Casa automobilistica") != marca:
            continue
        if tipo == "km0":
            try:
                if int(a.get("Km", 9999)) > 1000:
                    continue
            except Exception:
                pass
        elif tipo == "usato":
            try:
                if int(a.get("Km", 0)) <= 1000:
                    continue
            except Exception:
                pass
        filtrati.append(a)

    if not filtrati:
        return html.P("Nessun veicolo corrisponde ai filtri.",
                      style={"fontFamily": "Inter", "color": "#999"})
    return html.Div([auto_card(a) for a in filtrati],
                    style={"display": "grid",
                           "gridTemplateColumns": "repeat(auto-fill, minmax(320px, 1fr))",
                           "gap": "24px"})

if __name__ == "__main__":
    logger.info(f"Avvio server su localhost:{PORT}")
    app.run(debug=True, host="localhost", port=PORT)