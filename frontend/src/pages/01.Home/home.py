import os
import sys
from dash import html
import dash_bootstrap_components as dbc

# Importa configurazione centralizzata
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from app_config import cfg, PATHS, get_path, read_text

# ── carousel items ─────────────────────────────────────────────────────────────

EXTS = {".jpg", ".jpeg", ".png", ".webp"}
assets_dir = get_path("assets")
slide_files = sorted([
    f for f in os.listdir(assets_dir)
    if os.path.splitext(f)[1].lower() in EXTS
    and f != os.path.basename(PATHS["immagine_concessionaria"])
    and not f.endswith(".txt")
])
carousel_items = [
    {"key": str(i), "src": f"/assets/{fname}"}
    for i, fname in enumerate(slide_files)
] or [{"key": "0", "src": "/assets/" + os.path.basename(PATHS["immagine_concessionaria"])}]

# ── descrizione ────────────────────────────────────────────────────────────────

descrizione_paragrafi = [p.strip() for p in read_text("descrizione").split("\n\n") if p.strip()]

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
            html.Div([
                html.P(p, style={
                    "fontFamily": "Inter", "fontWeight": "300",
                    "lineHeight": "1.8", "color": "#444", "maxWidth": "640px",
                    "marginBottom": "16px"
                }) for p in descrizione_paragrafi
            ])
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


    # SERVIZI
    html.Div([
        html.Div([
            html.P("I NOSTRI SERVIZI", style={
                "letterSpacing": "4px", "fontSize": "12px",
                "color": "#C9A84C", "marginBottom": "12px",
                "fontFamily": "Inter", "textAlign": "center"
            }),
            html.H2("Professionalità, cortesia e onestà", style={
                "fontFamily": "Playfair Display", "fontSize": "2rem",
                "color": "#1a1a1a", "marginBottom": "16px", "textAlign": "center"
            }),
            html.P(
                "Da oltre vent'anni mettiamo al centro il cliente. "
                "Ogni intervento viene eseguito con cura, trasparenza sui costi e rispetto dei tempi.",
                style={
                    "fontFamily": "Inter", "fontWeight": "300", "color": "#555",
                    "textAlign": "center", "maxWidth": "600px",
                    "margin": "0 auto 48px", "lineHeight": "1.8"
                }
            ),
        ]),

        # Cards servizi
        html.Div([

            # Vendita auto
            html.Div([
                html.Div("🚗", style={"fontSize": "2.5rem", "marginBottom": "16px"}),
                html.H3("Vendita Auto", style={
                    "fontFamily": "Playfair Display", "fontSize": "1.3rem",
                    "color": "#1a1a1a", "marginBottom": "10px"
                }),
                html.P(
                    "Ampia selezione di auto usate e km 0, selezionate con cura e garantite. "
                    "Ti accompagniamo in ogni fase dell'acquisto con consulenza personalizzata.",
                    style={"fontFamily": "Inter", "fontWeight": "300",
                           "color": "#555", "lineHeight": "1.7", "fontSize": "0.95rem"}
                ),
            ], style={
                "flex": "1", "minWidth": "220px", "padding": "32px",
                "backgroundColor": "#fff", "borderRadius": "4px",
                "boxShadow": "0 2px 12px rgba(0,0,0,0.07)",
                "borderTop": "3px solid #C9A84C"
            }),

            # Officina autorizzata Volvo
            html.Div([
                html.Div("🔧", style={"fontSize": "2.5rem", "marginBottom": "16px"}),
                html.H3("Officina Autorizzata Volvo", style={
                    "fontFamily": "Playfair Display", "fontSize": "1.3rem",
                    "color": "#1a1a1a", "marginBottom": "10px"
                }),
                html.P(
                    "Dal 2023 officina autorizzata Volvo. Tecnici certificati, "
                    "ricambi originali e strumentazione diagnostica ufficiale per garantire "
                    "il massimo standard qualitativo sul tuo veicolo.",
                    style={"fontFamily": "Inter", "fontWeight": "300",
                           "color": "#555", "lineHeight": "1.7", "fontSize": "0.95rem"}
                ),
            ], style={
                "flex": "1", "minWidth": "220px", "padding": "32px",
                "backgroundColor": "#fff", "borderRadius": "4px",
                "boxShadow": "0 2px 12px rgba(0,0,0,0.07)",
                "borderTop": "3px solid #1a1a1a"
            }),

            # Riparazioni generali
            html.Div([
                html.Div("⚙️", style={"fontSize": "2.5rem", "marginBottom": "16px"}),
                html.H3("Riparazioni e Manutenzione", style={
                    "fontFamily": "Playfair Display", "fontSize": "1.3rem",
                    "color": "#1a1a1a", "marginBottom": "10px"
                }),
                html.P(
                    "Tagliandi, revisioni, freni, gomme e molto altro. "
                    "Interveniamo su tutte le marche con diagnosi accurata e preventivi chiari, "
                    "senza sorprese.",
                    style={"fontFamily": "Inter", "fontWeight": "300",
                           "color": "#555", "lineHeight": "1.7", "fontSize": "0.95rem"}
                ),
            ], style={
                "flex": "1", "minWidth": "220px", "padding": "32px",
                "backgroundColor": "#fff", "borderRadius": "4px",
                "boxShadow": "0 2px 12px rgba(0,0,0,0.07)",
                "borderTop": "3px solid #C9A84C"
            }),

            # Auto sostitutiva
            html.Div([
                html.Div("🔑", style={"fontSize": "2.5rem", "marginBottom": "16px"}),
                html.H3("Auto Sostitutiva Gratuita", style={
                    "fontFamily": "Playfair Display", "fontSize": "1.3rem",
                    "color": "#1a1a1a", "marginBottom": "10px"
                }),
                html.P(
                    "Non restare senza mobilità. Durante la riparazione mettiamo a disposizione "
                    "un'auto sostitutiva gratuita, soggetta a disponibilità.",
                    style={"fontFamily": "Inter", "fontWeight": "300",
                           "color": "#555", "lineHeight": "1.7", "fontSize": "0.95rem"}
                ),
            ], style={
                "flex": "1", "minWidth": "220px", "padding": "32px",
                "backgroundColor": "#fff", "borderRadius": "4px",
                "boxShadow": "0 2px 12px rgba(0,0,0,0.07)",
                "borderTop": "3px solid #1a1a1a"
            }),

        ], style={
            "display": "flex", "flexWrap": "wrap", "gap": "24px",
        }),

    ], style={
        "maxWidth": "1100px", "margin": "0 auto 80px", "padding": "0 5%"
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