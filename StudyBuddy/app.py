from flask import Flask, render_template, request, jsonify
import os
import requests

app = Flask(__name__)

# Set your Groq API key as an environment variable: GROQ_API_KEY
# Get your free key at: https://console.groq.com
API_KEY = os.environ.get("GROQ_API_KEY", "")
API_URL = "https://api.groq.com/openai/v1/chat/completions"

def ask_claude(prompt):
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "llama3-8b-8192",
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
        f"Explain the concept of '{topic}' to a student in simple terms. "
        f"Give a clear explanation, one real-world example, and end with one short quiz question to test understanding."
    )
    answer = ask_claude(prompt)
    return jsonify({"reply": answer})

@app.route("/check", methods=["POST"])
def check():
    topic = request.json.get("topic", "")
    question = request.json.get("question", "")
    user_answer = request.json.get("answer", "")
    prompt = (
        f"Topic: {topic}\nQuiz question: {question}\nStudent's answer: {user_answer}\n\n"
        f"Tell the student if their answer is correct, and give a short, encouraging explanation of the correct answer."
    )
    feedback = ask_claude(prompt)
    return jsonify({"reply": feedback})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
