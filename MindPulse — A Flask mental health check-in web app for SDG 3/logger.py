"""
logger.py
---------
Handles persistent mood logging to CSV.
Stores timestamped mood entries for history tracking.

SDG 3: Good Health and Well-being
iTaqiZ - PK
"""

import csv
import os
from datetime import datetime

LOG_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "mood_log.csv")
HEADERS = ["timestamp", "user_input", "rating", "mood_label"]


def _ensure_log_exists():
    """Create the CSV file with headers if it doesn't exist."""
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    if not os.path.exists(LOG_FILE):
        with open(LOG_FILE, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(HEADERS)


def log_entry(user_input: str, rating: int, mood_label: str) -> None:
    """Append a mood check-in entry to the CSV log."""
    _ensure_log_exists()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(LOG_FILE, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([timestamp, user_input, rating, mood_label])


def get_history(limit: int = 20) -> list[dict]:
    """
    Return the last `limit` mood entries as a list of dicts.

    Args:
        limit: Maximum number of entries to return (most recent first).

    Returns:
        list of dicts with keys: timestamp, user_input, rating, mood_label
    """
    _ensure_log_exists()
    entries = []
    with open(LOG_FILE, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            entries.append(row)
    return list(reversed(entries[-limit:]))

# iTaqiZ - PK
