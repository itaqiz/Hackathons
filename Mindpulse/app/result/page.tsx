"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { MoodEntry } from "@/lib/storage";

const MOOD_EMOJI: Record<string, string> = {
  Excellent: "🌟",
  Good:      "😊",
  Neutral:   "😐",
  Low:       "😔",
  Critical:  "🆘",
};

function scoreToPercent(score: number): number {
  // score is -1..+1, map to 0..100
  return Math.round(((score + 1) / 2) * 100);
}

export default function ResultPage() {
  const [entry, setEntry] = useState<MoodEntry | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("mindpulse_last");
    if (raw) setEntry(JSON.parse(raw));
  }, []);

  if (!entry) {
    return (
      <div className="container" style={{ paddingTop: 60 }}>
        <div className="card" style={{ textAlign: "center" }}>
          <p style={{ color: "var(--mist)", marginBottom: 20 }}>No recent check-in found.</p>
          <Link href="/" className="btn-primary">Start a Check-In →</Link>
        </div>
      </div>
    );
  }

  const moodClass = `mood-${entry.moodLabel.toLowerCase()}`;
  const pct = scoreToPercent(entry.score);
  const emoji = MOOD_EMOJI[entry.moodLabel] ?? "💭";
  const formattedDate = new Date(entry.timestamp).toLocaleString("en-US", {
    weekday: "short", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="container">
      <div className="result-header">
        <div className="pill">
          <span className="pill-dot" />
          Check-In Complete
        </div>
        <h1>Here&rsquo;s your wellness snapshot</h1>
      </div>

      {/* Mood card */}
      <div className={`mood-card ${moodClass}`}>
        <div className="mood-bar" />
        <span className="mood-emoji">{emoji}</span>
        <div className="mood-label">{entry.moodLabel}</div>
        <div className="mood-chips">
          <span className="chip">score {entry.score}</span>
          <span className="chip">rating {entry.rating} / 10</span>
          <span className="chip">{formattedDate}</span>
        </div>

        {/* mini score meter */}
        <div className="score-meter">
          <div className="score-bar-track">
            <div className="score-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="score-labels">
            <span>Critical</span>
            <span>{pct}% positivity</span>
            <span>Excellent</span>
          </div>
        </div>
      </div>

      {/* Tip */}
      <div className="tip-card">
        <div className="section-label">Wellness Recommendation</div>
        <p>{entry.tip}</p>
      </div>

      {/* Echo */}
      <div className="echo-card">
        <div className="section-label">You said</div>
        <blockquote>&ldquo;{entry.userInput}&rdquo;</blockquote>
      </div>

      <div className="actions">
        <Link href="/" className="btn-primary">New Check-In →</Link>
        <Link href="/history" className="btn-secondary">View History</Link>
      </div>

      <div className="sdg-note" style={{ marginTop: 28 }}>
        <span className="sdg-badge">UN SDG 3</span>
        <span>Consistent check-ins help you spot patterns and protect your mental health.</span>
      </div>
    </div>
  );
}
