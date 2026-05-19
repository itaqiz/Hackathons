from flask import Flask, render_template, request, redirect, url_for
from app.analyzer import analyze_mood
from app.recommender import get_recommendation
from app.logger import log_entry, get_history

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/checkin", methods=["POST"])
def checkin():
    user_input = request.form.get("mood_text", "").strip()
    rating = int(request.form.get("rating", 5))

    if not user_input:
        return redirect(url_for("index"))

    mood_label, score = analyze_mood(user_input, rating)
    tip = get_recommendation(mood_label)
    log_entry(user_input, rating, mood_label)

    return render_template(
        "result.html",
        mood=mood_label,
        score=score,
        tip=tip,
        user_input=user_input,
        rating=rating,
    )


@app.route("/history")
def history():
    entries = get_history()
    return render_template("history.html", entries=entries)


if __name__ == "__main__":
    app.run(debug=True)

# iTaqiZ - PK
