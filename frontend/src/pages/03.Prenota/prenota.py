import os
import sys
from dash import html, dcc
import dash_bootstrap_components as dbc

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from app_config import cfg

layout = html.Div([
    html.Div([
        html.P("PRENOTA", style={
            "letterSpacing": "4px", "fontSize": "12px",
            "color": "#C9A84C", "marginBottom": "12px", "fontFamily": "Inter"
        }),
        html.H1("Prenota un appuntamento", style={
            "fontFamily": "Playfair Display", "fontSize": "2.5rem",
            "color": "#1a1a1a", "marginBottom": "48px"
        }),

        html.Div([
            # Orari
            html.Div([
                html.H3("Orari di apertura", style={
                    "fontFamily": "Playfair Display", "fontSize": "1.4rem",
                    "color": "#1a1a1a", "marginBottom": "24px"
                }),
                html.Div([
                    html.Div([
                        html.Div([
                            html.Span("Lunedì – Venerdì", style={
                                "fontFamily": "Inter", "fontWeight": "600",
                                "color": "#1a1a1a", "display": "block", "marginBottom": "4px"
                            }),
                            html.Span(cfg["orari"]["lunedi_venerdi"], style={
                                "fontFamily": "Inter", "color": "#555"
                            }),
                        ]),
                        html.Span("●", style={"color": "#C9A84C", "fontSize": "20px"})
                    ], style={
                        "display": "flex", "justifyContent": "space-between",
                        "alignItems": "center", "padding": "20px 0",
                        "borderBottom": "1px solid #eee"
                    }),
                    html.Div([
                        html.Div([
                            html.Span("Sabato – Domenica", style={
                                "fontFamily": "Inter", "fontWeight": "600",
                                "color": "#1a1a1a", "display": "block", "marginBottom": "4px"
                            }),
                            html.Span("Chiuso", style={
                                "fontFamily": "Inter", "color": "#999"
                            }),
                        ]),
                        html.Span("○", style={"color": "#ccc", "fontSize": "20px"})
                    ], style={
                        "display": "flex", "justifyContent": "space-between",
                        "alignItems": "center", "padding": "20px 0",
                    }),
                ]),

                html.Div([
                    html.P("📞 " + cfg["telefono"], style={
                        "fontFamily": "Inter", "marginBottom": "8px", "color": "#1a1a1a"
                    }),
                    html.P("✉️ " + cfg["email"], style={
                        "fontFamily": "Inter", "color": "#1a1a1a"
                    }),
                ], style={
                    "marginTop": "32px", "padding": "24px",
                    "backgroundColor": "#f9f9f7", "borderLeft": "3px solid #C9A84C"
                }),

            ], style={"flex": "1", "minWidth": "280px"}),

            # Form
            html.Div([
                html.H3("Richiedi appuntamento", style={
                    "fontFamily": "Playfair Display", "fontSize": "1.4rem",
                    "color": "#1a1a1a", "marginBottom": "8px"
                }),
                html.P("Lascia la tua email e ti ricontattiamo entro il primo giorno lavorativo.",
                       style={"fontFamily": "Inter", "fontWeight": "300",
                              "color": "#555", "marginBottom": "24px"}),
                dbc.Input(
                    id="prenota-email",
                    type="email",
                    placeholder="tua@email.it",
                    style={"marginBottom": "16px", "fontFamily": "Inter"}
                ),
                dbc.Textarea(
                    id="prenota-note",
                    placeholder="Note (opzionale) — es. tipo di intervento, veicolo...",
                    style={"marginBottom": "16px", "fontFamily": "Inter", "height": "120px"}
                ),
                html.Button("Invia richiesta", id="prenota-btn-invia",
                            style={
                                "padding": "14px 32px", "backgroundColor": "#C9A84C",
                                "color": "#fff", "fontFamily": "Inter", "fontWeight": "600",
                                "border": "none", "borderRadius": "4px",
                                "cursor": "pointer", "fontSize": "14px", "width": "100%"
                            }),
                html.Div(id="prenota-msg", style={"marginTop": "16px", "fontFamily": "Inter"})

            ], style={
                "flex": "1", "minWidth": "280px", "padding": "36px",
                "backgroundColor": "#fff", "borderRadius": "4px",
                "boxShadow": "0 2px 16px rgba(0,0,0,0.06)"
            }),

        ], style={"display": "flex", "flexWrap": "wrap", "gap": "48px"}),

    ], style={"maxWidth": "1100px", "margin": "0 auto", "padding": "64px 5%"}),
])