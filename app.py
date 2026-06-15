from dash import Dash, html

app = Dash(__name__)

app.layout = html.Div(
    children=[
        html.H1(
            "Benvenuto!",
            style={
                "textAlign": "center",
                "fontFamily": "Arial, sans-serif",
                "marginTop": "20%",
                "fontSize": "4rem",
                "color": "#2c3e50",
            },
        )
    ],
    style={"backgroundColor": "#ecf0f1", "height": "100vh"},
)

if __name__ == "__main__":
    app.run(debug=True, port=3000) 