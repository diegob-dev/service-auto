import json
import os
from dash import html, dcc
import dash_bootstrap_components as dbc

# Load config
with open("config.json", "r", encoding="utf-8") as f:
    cfg = json.load(f)

PATHS = cfg["paths"]

# ── carousel items ─────────────────────────────────────────────────────────────

EXTS = {".jpg", ".jpeg", ".png", ".webp"}
assets_dir = PATHS["assets"]
slide_files = sorted([
    f for f in os.listdir(assets_dir)
    if os.path.splitext(f)[1].lower() in EXTS
    and f != os.path.basename(PATHS["immagine_concessionaria"])
])
carousel_items = [
    {"key": str(i), "src": f"/{assets_dir}{fname}"}
    for i, fname in enumerate(slide_files)
] or [{"key": "0", "src": "/" + PATHS["immagine_concessionaria"]}]

# ── layout ─────────────────────────────────────────────────────────────────────

layout = html.Div([

    # HERO con carosello
    html.Div([
        dbc.Carousel(
            items=carousel_items,
            id="hero-carousel",
            controls=True,
            indicators=True,
            interval=4000,
            className="hero-carousel",
            style={"height": "480px", "overflow": "hidden"}
        ),
        html.Div([
            html.P("CONCESSIONARIA AUTO", style={
                "letterSpacing": "4px", "fontSize": "12px",
                "color": "#C9A84C", "marginBottom": "12px", "fontFamily": "Inter"
            }),
            html.H1(cfg["azienda"], style={
                "fontFamily": "Playfair Display", "color": "#fff",
                "fontSize": "clamp(2rem, 5vw, 3.5rem)", "marginBottom": "8px"
            }),
            html.P(cfg["indirizzo"], style={
                "color": "#ddd", "fontFamily": "Inter",
                "fontWeight": "300", "fontSize": "1rem"
            }),
        ], style={
            "position": "absolute", "bottom": "48px", "left": "5%",
            "zIndex": "10", "pointerEvents": "none"
        }),
    ], style={"position": "relative"}),

    # ABOUT
    html.Div([
        html.Div([
            html.H2("La nostra storia", style={
                "fontFamily": "Playfair Display", "fontSize": "2rem",
                "color": "#1a1a1a", "marginBottom": "16px"
            }),
            html.P(
                "Service Srl è una azienda storica del vigevanese. Nata come autofficina si è "
                "evoluta nel tempo diventando officina autorizzata per alcuni dei marchi del settore "
                "e affiancando un autosalone per la vendita diretta.",
                style={
                    "fontFamily": "Inter", "fontWeight": "300",
                    "lineHeight": "1.8", "color": "#444", "maxWidth": "640px"
                }
            )
        ], style={"flex": "1", "minWidth": "280px"}),

        # INFO BOX
        html.Div([
            html.Div([
                html.P("ORARI", style={"letterSpacing": "3px", "fontSize": "11px",
                                       "color": "#C9A84C", "marginBottom": "8px", "fontFamily": "Inter"}),
                html.P("Lun – Ven", style={"fontFamily": "Inter", "fontWeight": "600",
                                           "marginBottom": "2px", "color": "#1a1a1a"}),
                html.P(cfg["orari"]["lunedi_venerdi"], style={"fontFamily": "Inter",
                                                              "color": "#555", "marginBottom": "12px"}),
                html.P("Sab – Dom", style={"fontFamily": "Inter", "fontWeight": "600",
                                           "marginBottom": "2px", "color": "#1a1a1a"}),
                html.P("Chiuso", style={"fontFamily": "Inter", "color": "#555", "marginBottom": "20px"}),
                html.Hr(style={"borderColor": "#e0e0e0"}),
                html.P("CONTATTI", style={"letterSpacing": "3px", "fontSize": "11px",
                                          "color": "#C9A84C", "marginBottom": "8px",
                                          "marginTop": "16px", "fontFamily": "Inter"}),
                html.P(["📞 ", html.A(cfg["telefono"],
                                      href=f"tel:{cfg['telefono'].replace(' ', '')}",
                                      style={"color": "#1a1a1a", "textDecoration": "none",
                                             "fontFamily": "Inter"})],
                       style={"marginBottom": "6px"}),
                html.P(["✉️ ", html.A(cfg["email"],
                                      href=f"mailto:{cfg['email']}",
                                      style={"color": "#1a1a1a", "textDecoration": "none",
                                             "fontFamily": "Inter"})]),
                html.Hr(style={"borderColor": "#e0e0e0", "marginTop": "20px"}),
                html.Div([
                    html.A("📞 Contattaci", href=f"tel:{cfg['telefono'].replace(' ', '')}",
                           style={
                               "display": "inline-block", "padding": "12px 24px",
                               "backgroundColor": "#C9A84C", "color": "#fff",
                               "fontFamily": "Inter", "fontWeight": "600",
                               "textDecoration": "none", "borderRadius": "4px",
                               "marginRight": "12px", "marginTop": "16px", "fontSize": "14px"
                           }),
                    html.Button("📅 Prenota appuntamento", id="btn-prenota",
                                style={
                                    "padding": "12px 24px", "backgroundColor": "#1a1a1a",
                                    "color": "#fff", "fontFamily": "Inter", "fontWeight": "600",
                                    "border": "none", "borderRadius": "4px",
                                    "cursor": "pointer", "marginTop": "16px", "fontSize": "14px"
                                }),
                ]),
            ], style={"padding": "32px", "backgroundColor": "#f9f9f7",
                      "borderLeft": "3px solid #C9A84C"})
        ], style={"flex": "0 0 340px", "minWidth": "280px"})

    ], style={
        "display": "flex", "flexWrap": "wrap", "gap": "48px",
        "maxWidth": "1100px", "margin": "64px auto", "padding": "0 5%"
    }),

    # MAPPA
    html.Div([
        html.H2("Dove siamo", style={
            "fontFamily": "Playfair Display", "fontSize": "2rem",
            "color": "#1a1a1a", "marginBottom": "24px"
        }),
        html.Iframe(
            src=f"https://maps.google.com/maps?q={cfg['indirizzo'].replace(' ', '+')}&output=embed",
            style={"width": "100%", "height": "380px", "border": "none", "borderRadius": "4px"}
        )
    ], style={"maxWidth": "1100px", "margin": "0 auto 80px", "padding": "0 5%"}),

    # MODAL PRENOTA
    dbc.Modal([
        dbc.ModalHeader(dbc.ModalTitle("Prenota un appuntamento",
                                       style={"fontFamily": "Playfair Display"})),
        dbc.ModalBody([
            html.P("Inserisci la tua email e ti contatteremo per fissare l'appuntamento.",
                   style={"fontFamily": "Inter", "color": "#555", "marginBottom": "16px"}),
            dbc.Input(id="input-email", type="email", placeholder="tua@email.it",
                      style={"fontFamily": "Inter"}),
            html.Div(id="msg-prenota", style={"marginTop": "12px",
                                              "fontFamily": "Inter", "fontSize": "14px"})
        ]),
        dbc.ModalFooter([
            dbc.Button("Annulla", id="btn-annulla", color="secondary", className="me-2"),
            dbc.Button("Invia richiesta", id="btn-invia", color="warning",
                       style={"backgroundColor": "#C9A84C", "border": "none"})
        ])
    ], id="modal-prenota", is_open=False),

], style={"backgroundColor": "#fff", "minHeight": "100vh"})