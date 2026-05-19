"""
recommender.py
--------------
Returns personalized wellness recommendations based on mood label.

SDG 3: Good Health and Well-being
iTaqiZ - PK
"""

import random

RECOMMENDATIONS = {
    "Excellent": [
        "You're thriving! Share your energy — reach out to a friend or family member today.",
        "Great mental state. Use this momentum to tackle a goal you've been putting off.",
        "Feeling excellent? Document what's working in your life — it's powerful data for your future self.",
    ],
    "Good": [
        "You're doing well. Take a short walk to keep the positive energy flowing.",
        "Good day? Consider journaling for 5 minutes — it reinforces positive patterns.",
        "Stay consistent. Small healthy habits compound over time. Drink some water and breathe.",
    ],
    "Neutral": [
        "Neutral isn't bad — it's stable. Try a 5-minute breathing exercise to lift your baseline.",
        "When feeling neutral, light movement (stretching, short walk) can shift your mood positively.",
        "Consider talking to someone you trust. Connection is one of the strongest health boosters.",
    ],
    "Low": [
        "It's okay to feel low. Rest is not laziness — give yourself permission to recover.",
        "Try the 5-4-3-2-1 grounding technique: name 5 things you see, 4 you feel, 3 you hear.",
        "Reach out to a friend, family member, or counselor. You don't have to carry this alone.",
        "Limit screen time for 30 minutes and step outside, even briefly. Light and air help.",
    ],
    "Critical": [
        "You matter. Please consider reaching out to a mental health professional or trusted person.",
        "Crisis helpline (Pakistan): Umang helpline 0317-4288665 — trained counselors available.",
        "Take one small step: text someone you trust right now. You do not have to be alone in this.",
        "Your feelings are valid. Professional support exists for exactly these moments — please use it.",
    ],
}


def get_recommendation(mood_label: str) -> str:
    """Return a random wellness tip for the given mood label."""
    tips = RECOMMENDATIONS.get(mood_label, RECOMMENDATIONS["Neutral"])
    return random.choice(tips)

# iTaqiZ - PK
