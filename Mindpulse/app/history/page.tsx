"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getEntries, clearEntries, type MoodEntry } from "@/lib/storage";

const MOOD_ORDER = ["Excellent", "Good", "Neutral", "Low", "Critical"] as const;
const MOOD_CLR: Record<string, string> = {
  Excellent: "var(--c-excellent)",
  Good:      "var(--c-good)",
  Neutral:   "var(--c-neutral)",
  Low:       "var(--c-low)",
  Critical:  "var(--c-critical)",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [toast, setToast] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setEntries(getEntries(50));
  }, []);

  function handleClear() {
    if (!confirm("Clear all mood history? This cannot be undone.")) return;
    clearEntries();
    setEntries([]);
    setToast("History cleared.");
    setTimeout(() => setToast(""), 3000);
  }

  // --- stats ---
  const total = entries.length;
  const avgRating = total
    ? (entries.reduce((s, e) => s + Number(e.rating), 0) / total).toFixed(1)
    : "—";
  const moodCounts = Object.fromEntries(MOOD_ORDER.map(m => [m, 0]));
  for (const e of entries) moodCounts[e.moodLabel] = (moodCounts[e.moodLabel] ?? 0) + 1;
  const topMood = total
    ? MOOD_ORDER.reduce((a, b) => (moodCounts[a] >= moodCounts[b] ? a : b))
    : "—";

  // chart: last 10 entries (oldest → newest)
  const chartEntries = [...entries].reverse().slice(-10);
  const maxRating = 10;

  if (!mounted) return null;

  return (
    <div className="container">
      <div className="history-header">
        <div className="pill">
          <span className="pill-dot" />
          Mood Log
        </div>
        <h1>Your Wellness History</h1>
        <p>Last 50 check-ins — spot patterns in your mental health over time.</p>
      </div>

      {total === 0 ? (
        <div className="history-table-wrap">
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>No entries yet.<br /><Link href="/">Complete your first check-in.</Link></p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="stats-row">
            <div className="stat-card" style={{"--accent-clr": "var(--arc)"} as React.CSSProperties}>
              <div className="stat-value">{total}</div>
              <div className="stat-key">Check-ins</div>
            </div>
            <div className="stat-card" style={{"--accent-clr": "var(--c-good)"} as React.CSSProperties}>
              <div className="stat-value">{avgRating}</div>
              <div className="stat-key">Avg rating</div>
            </div>
            <div className="stat-card" style={{"--accent-clr": MOOD_CLR[topMood] ?? "var(--arc)"} as React.CSSProperties}>
              <div className="stat-value" style={{ fontSize: "1.1rem" }}>{topMood}</div>
              <div className="stat-key">Top mood</div>
            </div>
            <div className="stat-card" style={{"--accent-clr": "var(--c-excellent)"} as React.CSSProperties}>
              <div className="stat-value">{moodCounts["Excellent"] + moodCounts["Good"]}</div>
              <div className="stat-key">Good days</div>
            </div>
          </div>

          {/* Mini chart */}
          {chartEntries.length > 1 && (
            <div className="mood-chart">
              <div className="chart-title">Rating trend — last {chartEntries.length} entries</div>
              <div className="chart-bars">
                {chartEntries.map((e, i) => {
                  const h = Math.max(4, (Number(e.rating) / maxRating) * 80);
                  return (
                    <div className="bar-wrap" key={i}>
                      <div
                        className="bar"
                        style={{
                          height: h,
                          background: MOOD_CLR[e.moodLabel] ?? "var(--arc)",
                          opacity: 0.75,
                        }}
                        title={`${e.moodLabel} — ${e.rating}/10`}
                      />
                      <div className="bar-label">{shortDate(e.timestamp)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Table */}
          <div className="history-table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Entry</th>
                  <th>Rating</th>
                  <th>Mood</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(e => (
                  <tr key={e.id}>
                    <td className="ts-cell">{formatDate(e.timestamp)}</td>
                    <td style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {e.userInput}
                    </td>
                    <td className="rating-cell">{e.rating} / 10</td>
                    <td>
                      <span className={`mood-badge mood-${e.moodLabel.toLowerCase()}`}>
                        {e.moodLabel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="actions" style={{ marginTop: 20 }}>
            <Link href="/" className="btn-primary">New Check-In →</Link>
            <button className="btn-secondary" onClick={handleClear}>Clear History</button>
          </div>
        </>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
