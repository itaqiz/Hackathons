"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { analyzeMood } from "@/lib/analyzer";
import { getRecommendation } from "@/lib/recommender";
import { saveEntry } from "@/lib/storage";

const EMOJI_SHORTCUTS = [
  { emoji: "😊", label: "Good",      text: "Feeling good and positive today" },
  { emoji: "😐", label: "Okay",      text: "Just okay, nothing special" },
  { emoji: "😔", label: "Low",       text: "Feeling a bit low and tired" },
  { emoji: "😰", label: "Anxious",   text: "Feeling anxious and stressed" },
  { emoji: "🔥", label: "Motivated", text: "Feeling motivated and energetic" },
  { emoji: "😴", label: "Drained",   text: "Feeling exhausted and drained" },
];

export default function HomePage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [activeEmoji, setActiveEmoji] = useState<number | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  function pickEmoji(idx: number) {
    setActiveEmoji(idx);
    setText(EMOJI_SHORTCUTS[idx].text);
    textRef.current?.focus();
  }

  function handleRating(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseInt(e.target.value);
    setRating(v);
    const pct = ((v - 1) / 9) * 100;
    e.target.style.background = `linear-gradient(to right, var(--arc) ${pct}%, var(--border) ${pct}%)`;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);

    const { label, score } = analyzeMood(text, rating);
    const tip = getRecommendation(label);
    const entry = saveEntry({ userInput: text, rating, moodLabel: label, score, tip });

    // Store last result in sessionStorage for the result page
    sessionStorage.setItem("mindpulse_last", JSON.stringify(entry));
    router.push("/result");
  }

  return (
    <div className="container">
      {/* Hero */}
      <section className="hero">
        <div className="pill">
          <span className="pill-dot" />
          SDG 3 · Mental Health Tracker
        </div>
        <h1>How are you feeling <em>today?</em></h1>
        <p className="sub">
          A 30-second daily check-in to track your mental wellness.
          Honest input. Personalized insight. No sign-up required.
        </p>
      </section>

      {/* Form card */}
      <div className="card">
        <form onSubmit={handleSubmit}>
          {/* Quick emoji shortcuts */}
          <div className="field">
            <div className="field-label">Quick pick</div>
            <div className="emoji-row">
              {EMOJI_SHORTCUTS.map((e, i) => (
                <button
                  type="button"
                  key={i}
                  className={`emoji-btn${activeEmoji === i ? " active" : ""}`}
                  onClick={() => pickEmoji(i)}
                >
                  <span>{e.emoji}</span>
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text area */}
          <div className="field">
            <div className="field-label">
              <span>Describe your mood</span>
              <span className="char-count">{text.length} / 500</span>
            </div>
            <textarea
              ref={textRef}
              value={text}
              onChange={e => { setText(e.target.value.slice(0, 500)); setActiveEmoji(null); }}
              rows={4}
              placeholder="e.g. feeling a bit anxious about deadlines but hopeful overall..."
              required
            />
          </div>

          {/* Slider */}
          <div className="field">
            <div className="field-label">
              <span>Well-being rating</span>
              <span className="rating-badge">{rating} / 10</span>
            </div>
            <div className="slider-wrap">
              <input
                type="range" min={1} max={10} value={rating}
                onChange={handleRating}
                style={{ background: `linear-gradient(to right, var(--arc) ${((rating-1)/9)*100}%, var(--border) ${((rating-1)/9)*100}%)` }}
              />
            </div>
            <div className="rating-scale">
              <span>1 — very poor</span>
              <span>10 — excellent</span>
            </div>
          </div>

          <div className="actions">
            <button type="submit" className="btn-primary" disabled={loading || !text.trim()}>
              {loading ? "Analyzing…" : "Submit Check-In →"}
            </button>
          </div>
        </form>
      </div>

      {/* SDG note */}
      <div className="sdg-note">
        <span className="sdg-badge">UN SDG 3</span>
        <span>Promoting mental wellness through daily self-reflection and awareness.</span>
      </div>
    </div>
  );
}
