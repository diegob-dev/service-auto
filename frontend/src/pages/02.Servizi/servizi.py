import os
import sys
from dash import html

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from app_config import cfg

SERVIZI = [
    {
        "icon": "🚗",
        "titolo": "Vendita Auto Usate e Km 0",
        "colore": "#C9A84C",
        "descrizione": (
            "Il nostro autosalone propone una selezione accurata di vetture usate e km 0 di ogni fascia. "
            "Ogni auto viene ispezionata, revisionata e documentata prima di essere messa in vendita. "
            "Ti affianchiamo in ogni fase: dalla scelta del veicolo alla gestione delle pratiche burocratiche, "
            "inclusa la valutazione della tua usata."
        ),
        "punti": [
            "Ampia scelta di marchi e modelli",
            "Veicoli revisionati e garantiti",
            "Valutazione e ritiro della tua usata",
            "Assistenza nelle pratiche di passaggio di proprietà",
        ]
    },
    {
        "icon": "🔧",
        "titolo": "Officina Autorizzata Volvo",
        "colore": "#003057",
        "descrizione": (
            "Dal 2023 siamo officina autorizzata Volvo. I nostri tecnici sono formati e certificati "
            "direttamente da Volvo Italia, utilizziamo esclusivamente ricambi originali e "
            "strumentazione diagnostica ufficiale. Che si tratti di un tagliando, di una riparazione "
            "complessa o di un aggiornamento software, il tuo Volvo è in mani sicure."
        ),
        "punti": [
            "Tecnici certificati Volvo Italia",
            "Ricambi originali garantiti",
            "Diagnostica ufficiale",
            "Tagliandi nel rispetto della garanzia casa madre",
        ]
    },
    {
        "icon": "⚙️",
        "titolo": "Riparazioni e Manutenzione",
        "colore": "#C9A84C",
        "descrizione": (
            "Interveniamo su tutte le marche per qualsiasi tipo di riparazione meccanica ed elettronica. "
            "Prima di ogni intervento forniamo un preventivo chiaro e dettagliato, senza costi nascosti. "
            "Rispettiamo i tempi concordati perché sappiamo quanto vale il tuo tempo."
        ),
        "punti": [
            "Tagliandi e revisioni periodiche",
            "Freni, sospensioni, sterzo",
            "Sostituzione pneumatici",
            "Diagnostica elettronica multimarca",
            "Climatizzazione e impianti elettrici",
        ]
    },
    {
        "icon": "🔑",
        "titolo": "Auto Sostitutiva Gratuita",
        "colore": "#1a1a1a",
        "descrizione": (
            "Sappiamo che restare senza auto può essere un problema. "
            "Per questo mettiamo a disposizione dei nostri clienti un'auto sostitutiva gratuita "
            "per tutta la durata della riparazione. Il servizio è soggetto a disponibilità: "
            "ti consigliamo di richiederlo al momento della prenotazione."
        ),
        "punti": [
            "Servizio gratuito per i clienti in riparazione",
            "Disponibile su prenotazione",
            "Soggetto a disponibilità",
        ]
    },
]

layout = html.Div([

    html.Div([
        html.P("I NOSTRI SERVIZI", style={
            "letterSpacing": "4px", "fontSize": "12px",
            "color": "#C9A84C", "marginBottom": "12px", "fontFamily": "Inter"
        }),
        html.H1("Cosa facciamo per te", style={
            "fontFamily": "Playfair Display", "fontSize": "2.5rem",
            "color": "#1a1a1a", "marginBottom": "16px"
        }),
        html.P(
            "Professionalità, cortesia e onestà: i valori che ci guidano da oltre vent'anni.",
            style={"fontFamily": "Inter", "fontWeight": "300",
                   "color": "#555", "fontSize": "1.1rem", "marginBottom": "64px"}
        ),

        html.Div([
            html.Div([
                html.Div([
                    html.Span(s["icon"], style={"fontSize": "2.5rem"}),
                    html.H2(s["titolo"], style={
                        "fontFamily": "Playfair Display", "fontSize": "1.5rem",
                        "color": "#1a1a1a", "margin": "16px 0 12px"
                    }),
                    html.P(s["descrizione"], style={
                        "fontFamily": "Inter", "fontWeight": "300",
                        "color": "#555", "lineHeight": "1.8",
                        "marginBottom": "20px", "fontSize": "0.95rem"
                    }),
                    html.Ul([
                        html.Li(p, style={
                            "fontFamily": "Inter", "fontSize": "0.9rem",
                            "color": "#444", "marginBottom": "6px"
                        }) for p in s["punti"]
                    ], style={"paddingLeft": "20px"}),
                ], style={
                    "padding": "36px",
                    "borderTop": f"4px solid {s['colore']}",
                    "backgroundColor": "#fff",
                    "borderRadius": "4px",
                    "boxShadow": "0 2px 16px rgba(0,0,0,0.06)",
                    "height": "100%"
                })
            ], style={"width": "calc(50% - 12px)", "minWidth": "280px", "boxSizing": "border-box"})
            for s in SERVIZI
        ], style={
            "display": "flex", "flexWrap": "wrap", "gap": "24px"
        }),

    ], style={"maxWidth": "1100px", "margin": "0 auto", "padding": "64px 5%"}),

])