"""Chennai Organics service scaffold; shop behavior arrives in C05."""

from flask import Flask, render_template

app = Flask(__name__)


@app.get("/")
def index():
    return render_template("index.html")


@app.get("/health")
def health():
    return {"ok": True, "service": "demo-shop", "stage": "scaffold"}


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5050, debug=False, use_reloader=False)
