// lib/analyzer.ts — Mood analysis engine (iTaqiZ · SDG 3)

export type MoodLabel = "Excellent" | "Good" | "Neutral" | "Low" | "Critical";

const POSITIVE: Set<string> = new Set([
  "happy","great","amazing","wonderful","good","excited","joyful","fantastic",
  "cheerful","motivated","energetic","productive","calm","peaceful","grateful",
  "hopeful","confident","loved","content","relaxed","thrilled","blessed",
  "awesome","positive","strong","inspired","fulfilled","delighted","radiant",
  "vibrant","alive","proud","secure","optimistic","uplifted","refreshed",
]);

const NEGATIVE: Set<string> = new Set([
  "sad","bad","terrible","awful","depressed","anxious","stressed","overwhelmed",
  "tired","exhausted","lonely","hopeless","worthless","angry","frustrated",
  "worried","scared","nervous","lost","broken","hurt","miserable","empty",
  "numb","dark","fearful","panicked","drained","burned","helpless","defeated",
  "trapped","disconnected","grief","rage","despair","hollow","shattered",
]);

function scoreText(text: string): number {
  const words = text.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/);
  let pos = 0, neg = 0;
  for (const w of words) {
    if (POSITIVE.has(w)) pos++;
    if (NEGATIVE.has(w)) neg++;
  }
  const total = pos + neg;
  return total === 0 ? 0 : (pos - neg) / total;
}

function labelFromScore(s: number): MoodLabel {
  if (s >= 0.6)  return "Excellent";
  if (s >= 0.3)  return "Good";
  if (s >= 0.0)  return "Neutral";
  if (s >= -0.3) return "Low";
  return "Critical";
}

export function analyzeMood(text: string, rating: number): { label: MoodLabel; score: number } {
  const textScore = scoreText(text);
  const ratingScore = (rating - 5.5) / 4.5; // normalize 1–10 → ≈ -1..+1
  const combined = Math.round((0.6 * ratingScore + 0.4 * textScore) * 1000) / 1000;
  return { label: labelFromScore(combined), score: combined };
}
