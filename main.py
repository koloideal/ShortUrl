from flask import Flask, jsonify

app = Flask(__name__)


@app.get("/")
def index():
    return app.send_static_file("index.html")

@app.route("/health")
def health_check():
    return jsonify({"status" : "ok"}), 200