from flask import Flask, render_template, request, jsonify
import os
import requests

app = Flask(__name__)

API_KEY = os.environ.get("GROQ_API_KEY", "")
API_URL = "https://api.groq.com/openai/v1/chat/completions"

def ask_groq(prompt):
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "llama-3.1-8b-instant",
        "max_tokens": 600,
        "messages": [{"role": "user", "content": prompt}]
    }
    response = requests.post(API_URL, headers=headers, json=data)
    result = response.json()
    try:
        return result["choices"][0]["message"]["content"]
    except Exception:
        return "Error: " + str(result)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/explain", methods=["POST"])
def explain():
    topic = request.json.get("topic", "")
    prompt = (
        f"Explain the concept of '{topic}' to a student in simple, friendly terms. "
        f"Structure your response in exactly 3 parts:\n"
        f"1. EXPLANATION: A clear 2-3 sentence explanation in plain language.\n"
        f"2. EXAMPLE: One short, relatable real-world example (1-2 sentences).\n"
        f"3. QUIZ: One multiple choice question with options A, B, C, D. "
        f"Do NOT include the answer or any hint about which option is correct. "
        f"End after option D, nothing more."
    )
    answer = ask_groq(prompt)
    return jsonify({"reply": answer})

@app.route("/check", methods=["POST"])
def check():
    topic = request.json.get("topic", "")
    question = request.json.get("question", "")
    user_answer = request.json.get("answer", "")
    prompt = (
        f"A student was asked this quiz question about '{topic}':\n{question}\n\n"
        f"The student answered: '{user_answer}'\n\n"
        f"Tell them if they are correct or not, and give a short encouraging explanation of the right answer. "
        f"Be warm and supportive. Keep it under 4 sentences."
    )
    feedback = ask_groq(prompt)
    return jsonify({"reply": feedback})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
