from flask import Flask

app = Flask(__name__)


@app.get("/")
def health() -> tuple[str, int]:
    return "alive", 200
