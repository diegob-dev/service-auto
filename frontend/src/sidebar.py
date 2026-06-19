from dash import html, dcc

MENU_ITEMS = [
    {"label": "🏠  Home",                    "href": "/"},
    {"label": "🔧  Servizi",                 "href": "/servizi"},
    {"label": "📅  Prenota appuntamento",    "href": "/prenota"},
    {"label": "🚗  Parco auto",              "href": "/parco-auto"},
]

def sidebar(current_path: str = "/"):
    return html.Div([
        html.Div([
            html.Span("CONCESSIONARIA"),
            "Service Vigevano"
        ], className="sidebar-logo"),

        html.Div([
            html.A(
                item["label"],
                href=item["href"],
                className="sidebar-item active" if current_path == item["href"] else "sidebar-item"
            )
            for item in MENU_ITEMS
        ])
    ], className="sidebar")