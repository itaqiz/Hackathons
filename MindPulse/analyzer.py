"""
analyzer.py
-----------
Analyzes user mood input using keyword-based NLP scoring.
Combines text sentiment with a self-reported numeric rating.

SDG 3: Good Health and Well-being
iTaqiZ - PK
"""

POSITIVE_KEYWORDS = [
    "happy", "great", "amazing", "wonderful", "good", "excited", "joyful",
    "fantastic", "cheerful", "motivated", "energetic", "productive", "calm",
    "peaceful", "grateful", "hopeful", "confident", "loved", "content",
    "relaxed", "thrilled", "blessed", "awesome", "positive", "strong",
]

NEGATIVE_KEYWORDS = [
    "sad", "bad", "terrible", "awful", "depressed", "anxious", "stressed",
    "overwhelmed", "tired", "exhausted", "lonely", "hopeless", "worthless",
    "angry", "frustrated", "worried", "scared", "nervous", "lost", "broken",
    "hurt", "miserable", "empty", "numb", "dark", "fearful", "panicked",
]

NEUTRAL_KEYWORDS = [
    "okay", "fine", "alright", "normal", "average", "so-so", "meh",
    "neutral", "usual", "same", "nothing", "just", "regular",
]


def _score_text(text: str) -> float:
    """Return a sentiment score between -1.0 (negative) and +1.0 (positive)."""
    words = text.lower().split()
    pos = sum(1 for w in words if w in POSITIVE_KEYWORDS)
    neg = sum(1 for w in words if w in NEGATIVE_KEYWORDS)
    total = pos + neg
    if total == 0:
        return 0.0
    return (pos - neg) / total


def _label_from_score(combined_score: float) -> str:
    """Map a combined score to a mood label."""
    if combined_score >= 0.6:
        return "Excellent"
    elif combined_score >= 0.3:
        return "Good"
    elif combined_score >= 0.0:
        return "Neutral"
    elif combined_score >= -0.3:
        return "Low"
    else:
        return "Critical"


def analyze_mood(text: str, rating: int) -> tuple[str, float]:
    """
    Analyze mood from free text + numeric self-rating (1–10).

    Returns:
        tuple: (mood_label: str, combined_score: float)
    """
    text_score = _score_text(text)
    rating_score = (rating - 5.5) / 4.5  # normalize 1–10 → ~-1 to +1

    # Weighted blend: 60% rating, 40% text
    combined = round(0.6 * rating_score + 0.4 * text_score, 3)
    label = _label_from_score(combined)

    return label, combined

# iTaqiZ - PK
