import os
import sys
import requests
from dash import html, dcc
import dash_bootstrap_components as dbc

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from app_config import cfg, get_path

SHEET_ID = "1LC4rv-H-kcuZN6TdD89ur87hrPJ2gsjMBEKHejpE2bY"
SHEET_URL = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid=0"
EXTS = {".jpg", ".jpeg", ".png", ".webp"}

def fetch_auto_by_id(auto_id: str):
    try:
        r = requests.get(SHEET_URL, timeout=10)
        r.raise_for_status()
        lines = r.text.strip().split("\n")
        headers = [h.strip() for h in lines[0].split(",")]
        for line in lines[1:]:
            values = [v.strip() for v in line.split(",")]
            row = dict(zip(headers, values))
            if row.get("ID Auto") == auto_id:
                return row
    except Exception:
        pass
    return None

def get_images(auto_id: str):
    folder = os.path.join(get_path("auto_assets"), str(auto_id))
    if os.path.isdir(folder):
        return sorted([
            f"/assets/auto/{auto_id}/{f}"
            for f in os.listdir(folder)
            if os.path.splitext(f)[1].lower() in EXTS
        ])
    return []

def format_prezzo(prezzo):
    try:
        return f"€ {int(float(prezzo)):,}".replace(",", ".")
    except Exception:
        return prezzo or "–"

def layout_fn(auto_id: str):
    auto = fetch_auto_by_id(auto_id)

    if not auto:
        return html.Div([
            html.Div([
                dcc.Link("← Torna al parco auto", href="/parco-auto",
                         style={"fontFamily": "Inter", "color": "#C9A84C",
                                "textDecoration": "none"}),
                html.H2("Auto non trovata", style={"fontFamily": "Playfair Display", "marginTop": "32px"}),
            ], style={"maxWidth": "1100px", "margin": "0 auto", "padding": "64px 5%"})
        ])

    images = get_images(auto_id)
    prezzo = format_prezzo(auto.get("Prezzo", ""))
    prezzo_scontato = format_prezzo(auto.get("Prezzo scontato", ""))
    ha_sconto = auto.get("Prezzo scontato") and auto.get("Prezzo scontato") != auto.get("Prezzo")
    titolo = f"{auto.get('Casa automobilistica', '')} {auto.get('Modello', '')}"

    # Thumbnail strip + lightbox
    if images:
        foto_section = html.Div([
            # Immagine principale cliccabile
            html.Div([
                html.Img(
                    src=images[0],
                    id="lightbox-main-img",
                    style={
                        "width": "100%", "height": "360px",
                        "objectFit": "cover", "borderRadius": "4px",
                        "cursor": "zoom-in", "display": "block"
                    }
                ),
                html.Div("🔍 Clicca per ingrandire", style={
                    "position": "absolute", "bottom": "12px", "right": "12px",
                    "backgroundColor": "rgba(0,0,0,0.5)", "color": "#fff",
                    "fontFamily": "Inter", "fontSize": "12px",
                    "padding": "4px 10px", "borderRadius": "3px",
                    "pointerEvents": "none"
                }),
            ], id="lightbox-trigger", style={"position": "relative", "cursor": "zoom-in"}),

            # Thumbnails
            html.Div([
                html.Img(
                    src=img,
                    id={"type": "thumb", "index": i},
                    style={
                        "width": "80px", "height": "60px",
                        "objectFit": "cover", "borderRadius": "3px",
                        "cursor": "pointer", "opacity": "1" if i == 0 else "0.6",
                        "border": "2px solid #C9A84C" if i == 0 else "2px solid transparent",
                        "transition": "all 0.2s"
                    }
                ) for i, img in enumerate(images)
            ], style={"display": "flex", "gap": "8px", "marginTop": "12px",
                      "flexWrap": "wrap"}) if len(images) > 1 else None,

            # Lightbox modal
            dbc.Modal([
                dbc.ModalBody([
                    dbc.Carousel(
                        items=[{"key": str(i), "src": src} for i, src in enumerate(images)],
                        id="lightbox-carousel",
                        controls=True,
                        indicators=True,
                        interval=None,
                        style={"maxHeight": "80vh"}
                    )
                ], style={"padding": "0", "backgroundColor": "#000"}),
            ], id="lightbox-modal", is_open=False, size="xl",
               centered=True, contentClassName="bg-dark"),

            # Store per indice corrente thumbnails
            dcc.Store(id="thumb-active", data=0),
        ])
    else:
        foto_section = html.Div("🚗", style={
            "height": "300px", "display": "flex", "alignItems": "center",
            "justifyContent": "center", "backgroundColor": "#f5f5f3",
            "fontSize": "5rem", "borderRadius": "4px"
        })

    return html.Div([
        html.Div([
            dcc.Link("← Torna al parco auto", href="/parco-auto",
                     style={"fontFamily": "Inter", "color": "#C9A84C",
                            "textDecoration": "none", "fontSize": "0.9rem",
                            "display": "block", "marginBottom": "32px"}),

            html.Div([
                # Colonna sinistra: foto
                html.Div([foto_section], style={"flex": "1.2", "minWidth": "280px"}),

                # Colonna destra: dettagli
                html.Div([
                    html.H1(titolo, style={
                        "fontFamily": "Playfair Display", "fontSize": "2rem",
                        "color": "#1a1a1a", "marginBottom": "8px"
                    }),

                    # Prezzo
                    html.Div([
                        html.Span(prezzo_scontato if ha_sconto else prezzo, style={
                            "fontFamily": "Inter", "fontWeight": "700",
                            "color": "#C9A84C", "fontSize": "2rem"
                        }),
                        html.Span(prezzo, style={
                            "fontFamily": "Inter", "color": "#aaa",
                            "fontSize": "1.1rem", "textDecoration": "line-through",
                            "marginLeft": "12px"
                        }) if ha_sconto else None,
                    ], style={"marginBottom": "28px"}),

                    # Specifiche
                    html.Div([
                        html.Div([
                            html.Span("ANNO", style={"fontFamily": "Inter", "fontSize": "10px",
                                                     "color": "#999", "letterSpacing": "2px",
                                                     "display": "block", "marginBottom": "4px"}),
                            html.Span(auto.get("Anno di immatricolazione", "–"),
                                      style={"fontFamily": "Inter", "fontWeight": "600",
                                             "fontSize": "1.1rem", "color": "#1a1a1a"})
                        ]),
                        html.Div([
                            html.Span("KM", style={"fontFamily": "Inter", "fontSize": "10px",
                                                   "color": "#999", "letterSpacing": "2px",
                                                   "display": "block", "marginBottom": "4px"}),
                            html.Span(f"{auto.get('Km', '–')} km",
                                      style={"fontFamily": "Inter", "fontWeight": "600",
                                             "fontSize": "1.1rem", "color": "#1a1a1a"})
                        ]),
                    ], style={"display": "flex", "gap": "40px", "marginBottom": "24px",
                              "padding": "24px", "backgroundColor": "#f9f9f7",
                              "borderLeft": "3px solid #C9A84C"}),

                    # Descrizione
                    html.Div([
                        html.P("DESCRIZIONE", style={"fontFamily": "Inter", "fontSize": "10px",
                                                     "color": "#999", "letterSpacing": "2px",
                                                     "marginBottom": "8px"}),
                        html.P(auto.get("Descrizione", "–"),
                               style={"fontFamily": "Inter", "fontWeight": "300",
                                      "color": "#444", "lineHeight": "1.7"})
                    ], style={"marginBottom": "24px"}) if auto.get("Descrizione") else None,

                    # Note venditore
                    html.Div([
                        html.P("NOTE", style={"fontFamily": "Inter", "fontSize": "10px",
                                              "color": "#999", "letterSpacing": "2px",
                                              "marginBottom": "8px"}),
                        html.P(auto.get("Note venditore", ""),
                               style={"fontFamily": "Inter", "fontWeight": "300",
                                      "color": "#666", "lineHeight": "1.7",
                                      "fontStyle": "italic"})
                    ], style={"marginBottom": "28px"}) if auto.get("Note venditore") else None,

                    # Form contatto
                    html.Div([
                        html.H3("Sei interessato?", style={
                            "fontFamily": "Playfair Display", "fontSize": "1.3rem",
                            "color": "#1a1a1a", "marginBottom": "8px"
                        }),
                        html.P("Lascia il tuo numero e ti ricontattiamo.",
                               style={"fontFamily": "Inter", "fontWeight": "300",
                                      "color": "#555", "marginBottom": "16px"}),
                        dbc.Input(id="detail-contact-tel", type="tel",
                                  placeholder="+39 333 1234567",
                                  style={"marginBottom": "12px", "fontFamily": "Inter"}),
                        html.Button("📞 Richiedi informazioni",
                                    id={"type": "btn-detail-tel", "index": auto_id},
                                    style={
                                        "padding": "12px 24px", "backgroundColor": "#C9A84C",
                                        "color": "#fff", "fontFamily": "Inter",
                                        "fontWeight": "600", "border": "none",
                                        "borderRadius": "4px", "cursor": "pointer",
                                        "fontSize": "14px", "width": "100%"
                                    }),
                        html.Div(id="detail-contact-msg",
                                 style={"marginTop": "12px", "fontFamily": "Inter",
                                        "fontSize": "14px"})
                    ], style={
                        "padding": "28px", "backgroundColor": "#fff",
                        "borderRadius": "4px", "boxShadow": "0 2px 16px rgba(0,0,0,0.06)"
                    }),

                ], style={"flex": "1", "minWidth": "280px"}),

            ], style={"display": "flex", "flexWrap": "wrap", "gap": "48px"}),

        ], style={"maxWidth": "1100px", "margin": "0 auto", "padding": "64px 5%"}),
    ])