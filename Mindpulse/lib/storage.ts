// lib/storage.ts — Client-side persistence for mood entries

import type { MoodLabel } from "./analyzer";

export interface MoodEntry {
  id: string;
  timestamp: string;       // ISO string
  userInput: string;
  rating: number;
  moodLabel: MoodLabel;
  score: number;
  tip: string;
}

const KEY = "mindpulse_entries";

export function saveEntry(entry: Omit<MoodEntry, "id" | "timestamp">): MoodEntry {
  const full: MoodEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  const existing = getEntries();
  localStorage.setItem(KEY, JSON.stringify([full, ...existing]));
  return full;
}

export function getEntries(limit = 50): MoodEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as MoodEntry[]).slice(0, limit);
  } catch {
    return [];
  }
}

export function clearEntries(): void {
  localStorage.removeItem(KEY);
}
