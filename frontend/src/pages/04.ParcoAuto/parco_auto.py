import os
import sys
import requests
from dash import html, dcc, Input, Output, callback
import dash_bootstrap_components as dbc

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from app_config import cfg, PATHS, get_path

SHEET_ID = "1LC4rv-H-kcuZN6TdD89ur87hrPJ2gsjMBEKHejpE2bY"
SHEET_URL = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid=0"
EXTS = {".jpg", ".jpeg", ".png", ".webp"}

def fetch_auto():
    try:
        r = requests.get(SHEET_URL, timeout=10)
        r.raise_for_status()
        lines = r.text.strip().split("\n")
        headers = [h.strip() for h in lines[0].split(",")]
        auto = []
        for line in lines[1:]:
            values = [v.strip() for v in line.split(",")]
            if len(values) >= len(headers):
                auto.append(dict(zip(headers, values)))
        return auto
    except Exception:
        return []

def get_main_image(auto_id: str):
    folder = os.path.join(get_path("auto_assets"), str(auto_id))
    if os.path.isdir(folder):
        images = sorted([f for f in os.listdir(folder) if os.path.splitext(f)[1].lower() in EXTS])
        if images:
            return f"/assets/auto/{auto_id}/{images[0]}"
    return None

def format_prezzo(prezzo):
    try:
        return f"€ {int(float(prezzo)):,}".replace(",", ".")
    except Exception:
        return prezzo or "–"

def auto_card(auto: dict):
    auto_id = auto.get("ID Auto", "")
    prezzo = format_prezzo(auto.get("Prezzo", ""))
    prezzo_scontato = format_prezzo(auto.get("Prezzo scontato", ""))
    ha_sconto = auto.get("Prezzo scontato") and auto.get("Prezzo scontato") != auto.get("Prezzo")
    main_img = get_main_image(auto_id)
    titolo = f"{auto.get('Casa automobilistica', '')} {auto.get('Modello', '')}"

    return html.Div([
        # Immagine
        html.Div([
            html.Img(src=main_img, style={
                "width": "100%", "height": "200px",
                "objectFit": "cover", "display": "block"
            }) if main_img else html.Div("🚗", style={
                "height": "200px", "display": "flex",
                "alignItems": "center", "justifyContent": "center",
                "backgroundColor": "#f5f5f3", "fontSize": "4rem"
            })
        ], style={"position": "relative"}),

        # Contenuto
        html.Div([
            html.Span(titolo, style={
                "fontFamily": "Playfair Display", "fontSize": "1.1rem",
                "color": "#1a1a1a", "fontWeight": "700", "display": "block",
                "marginBottom": "12px"
            }),

            # Prezzo
            html.Div([
                html.Span(prezzo_scontato if ha_sconto else prezzo, style={
                    "fontFamily": "Inter", "fontWeight": "700",
                    "color": "#C9A84C", "fontSize": "1.15rem"
                }),
                html.Span(prezzo, style={
                    "fontFamily": "Inter", "color": "#aaa", "fontSize": "0.85rem",
                    "textDecoration": "line-through", "marginLeft": "8px"
                }) if ha_sconto else None,
            ], style={"marginBottom": "16px"}),

            # Specifiche
            html.Div([
                html.Div([
                    html.Span("ANNO", style={"fontFamily": "Inter", "fontSize": "10px",
                                             "color": "#999", "letterSpacing": "2px",
                                             "display": "block", "marginBottom": "4px"}),
                    html.Span(auto.get("Anno di immatricolazione", "–"),
                              style={"fontFamily": "Inter", "fontWeight": "600", "color": "#1a1a1a"})
                ]),
                html.Div([
                    html.Span("KM", style={"fontFamily": "Inter", "fontSize": "10px",
                                           "color": "#999", "letterSpacing": "2px",
                                           "display": "block", "marginBottom": "4px"}),
                    html.Span(f"{auto.get('Km', '–')} km",
                              style={"fontFamily": "Inter", "fontWeight": "600", "color": "#1a1a1a"})
                ]),
            ], style={"display": "flex", "gap": "32px", "marginBottom": "20px"}),

            # Bottoni
            html.Div([
                dcc.Link("Vedi dettaglio →", href=f"/parco-auto/{auto_id}", style={
                    "fontFamily": "Inter", "fontWeight": "600", "color": "#1a1a1a",
                    "textDecoration": "none", "fontSize": "0.9rem",
                    "borderBottom": "2px solid #C9A84C", "paddingBottom": "2px"
                }),
                html.Button("📞 Contattami", id={"type": "btn-contatta", "index": auto_id},
                            style={
                                "padding": "8px 18px", "backgroundColor": "#C9A84C",
                                "color": "#fff", "fontFamily": "Inter", "fontWeight": "600",
                                "border": "none", "borderRadius": "4px",
                                "cursor": "pointer", "fontSize": "13px"
                            }),
            ], style={"display": "flex", "justifyContent": "space-between", "alignItems": "center"}),

        ], style={"padding": "20px"}),

    ], style={
        "backgroundColor": "#fff", "borderRadius": "4px",
        "boxShadow": "0 2px 16px rgba(0,0,0,0.07)",
        "overflow": "hidden", "borderTop": "3px solid #C9A84C"
    })

def layout_fn():
    auto_list = fetch_auto()
    marche = sorted(set(a.get("Casa automobilistica", "") for a in auto_list if a.get("Casa automobilistica")))

    label_style = {"fontFamily": "Inter", "fontSize": "11px", "color": "#999",
                    "letterSpacing": "2px", "display": "block", "marginBottom": "6px"}

    filtri = html.Div([
        # Prezzo da
        html.Div([
            html.Label("PREZZO DA (€)", style=label_style),
            dbc.Input(id="filtro-prezzo-min", type="number", placeholder="es. 5000",
                      min=0, step=500, style={"fontFamily": "Inter", "fontSize": "0.9rem"}),
        ], style={"flex": "1", "minWidth": "140px"}),

        # Prezzo a
        html.Div([
            html.Label("PREZZO A (€)", style=label_style),
            dbc.Input(id="filtro-prezzo-max", type="number", placeholder="es. 30000",
                      min=0, step=500, style={"fontFamily": "Inter", "fontSize": "0.9rem"}),
        ], style={"flex": "1", "minWidth": "140px"}),

        # Marca
        html.Div([
            html.Label("MARCA", style=label_style),
            dcc.Dropdown(
                id="filtro-marca",
                options=[{"label": m, "value": m} for m in marche],
                placeholder="Tutte",
                clearable=True,
                style={"fontFamily": "Inter", "fontSize": "0.9rem"}
            ),
        ], style={"flex": "1", "minWidth": "160px"}),

        # Tipologia
        html.Div([
            html.Label("TIPOLOGIA", style=label_style),
            dcc.Dropdown(
                id="filtro-tipo",
                options=[
                    {"label": "Tutte", "value": "tutte"},
                    {"label": "Usato", "value": "usato"},
                    {"label": "Km 0", "value": "km0"},
                ],
                value="tutte",
                clearable=False,
                style={"fontFamily": "Inter", "fontSize": "0.9rem"}
            ),
        ], style={"flex": "1", "minWidth": "140px"}),

    ], style={
        "display": "flex", "flexWrap": "wrap", "gap": "20px", "alignItems": "flex-end",
        "padding": "20px 24px", "backgroundColor": "#f9f9f7",
        "borderRadius": "4px", "marginBottom": "40px",
        "border": "1px solid #eee"
    })

    return html.Div([
        html.Div([
            html.P("PARCO AUTO", style={
                "letterSpacing": "4px", "fontSize": "12px",
                "color": "#C9A84C", "marginBottom": "12px", "fontFamily": "Inter"
            }),
            html.H1("Le nostre auto in vendita", style={
                "fontFamily": "Playfair Display", "fontSize": "2.5rem",
                "color": "#1a1a1a", "marginBottom": "8px"
            }),
            html.P(f"{len(auto_list)} veicoli disponibili",
                   style={"fontFamily": "Inter", "fontWeight": "300",
                          "color": "#999", "marginBottom": "40px"}),

            filtri,

            # Griglia iniziale (tutti i veicoli)
            html.Div([
                auto_card(a) for a in auto_list
            ], id="auto-grid", style={
                "display": "grid",
                "gridTemplateColumns": "repeat(auto-fill, minmax(320px, 1fr))",
                "gap": "24px"
            }),

            # Store dati auto per i filtri
            dcc.Store(id="auto-data", data=auto_list),

        ], style={"maxWidth": "1100px", "margin": "0 auto", "padding": "64px 5%"}),


    ])