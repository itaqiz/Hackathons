# 🎓 AI Study Buddy

An AI-powered web app that helps students learn any topic by giving simple explanations, real-world examples, and quiz questions — with instant AI feedback on their answers.

## Problem Statement
Students often struggle to find clear, simple explanations of concepts, and don't have a way to test their understanding immediately. Tutoring isn't always available or affordable.

## Solution Overview
AI Study Buddy lets a student type any topic (e.g. "Photosynthesis" or "Recursion") and instantly receive:
1. A simple explanation in plain language
2. A real-world example
3. A short quiz question

The student answers the quiz question, and the AI gives instant, encouraging feedback on whether they got it right — explaining the correct answer either way.

## Key Features
- Simple, clean web interface
- Works for ANY topic/subject
- AI-generated explanations tailored for students
- Instant quiz + feedback loop to reinforce learning
- No login or setup needed for the student

## Technologies Used
- Python (Flask) — backend web server
- Anthropic Claude API — AI explanations and feedback
- HTML/CSS/JavaScript — frontend interface

## Target Users
- Students (middle school through college) studying any subject
- Self-learners who want quick, on-demand explanations
- Educators looking for a supplementary learning tool

## How to Run
1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
2. Set your Anthropic API key as an environment variable:
   ```
   export ANTHROPIC_API_KEY=your_key_here       # Mac/Linux
   set ANTHROPIC_API_KEY=your_key_here          # Windows
   ```
3. Run the app:
   ```
   python app.py
   ```
4. Open your browser to `http://localhost:5000`

## Future Improvements
- Track student progress over time
- Support image/diagram explanations
- Multi-language support
- Adaptive difficulty based on quiz performance
