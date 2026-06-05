// lib/recommender.ts — Wellness recommendations (iTaqiZ · SDG 3)
import type { MoodLabel } from "./analyzer";

const TIPS: Record<MoodLabel, string[]> = {
  Excellent: [
    "You're thriving! Channel this energy — reach out to a friend or tackle a goal you've been postponing.",
    "Great mental state. Document what's working in your life; it's powerful data for your future self.",
    "Feeling excellent? Share your positivity. Kindness compounds — pass it on to someone who needs it today.",
    "Use this momentum to build a habit you've been meaning to start. Energy like this is precious.",
  ],
  Good: [
    "You're doing well. A short walk will keep positive energy flowing and clear your head.",
    "Good day? Journal for 5 minutes — it reinforces positive patterns and builds self-awareness over time.",
    "Stay consistent. Small healthy habits compound. Drink some water, breathe deep, and keep going.",
    "Solid baseline. Consider connecting with someone you haven't spoken to in a while.",
  ],
  Neutral: [
    "Neutral isn't bad — it's stable. Try a 5-minute breathing exercise to gently lift your baseline.",
    "Light movement (stretching, a short walk) can shift a neutral mood positively in under 10 minutes.",
    "Consider talking to someone you trust. Connection is one of the strongest mood boosters available.",
    "Neutral days are perfect for low-effort self-care: hydrate, eat something nourishing, rest if needed.",
  ],
  Low: [
    "It's okay to feel low. Rest is not laziness — give yourself permission to recover without guilt.",
    "Try the 5-4-3-2-1 grounding technique: name 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.",
    "Reach out to a friend, family member, or counselor. You don't have to carry this alone.",
    "Limit screen time for 30 minutes and step outside, even briefly. Natural light and fresh air genuinely help.",
  ],
  Critical: [
    "You matter. Please consider reaching out to a mental health professional or a trusted person in your life.",
    "Crisis helpline Pakistan — Umang: 0317-4288665. Trained counselors are available and ready to listen.",
    "Take one small step right now: text someone you trust. You do not have to face this alone.",
    "Your feelings are valid. Professional support exists for exactly these moments — please use it.",
  ],
};

export function getRecommendation(label: MoodLabel): string {
  const tips = TIPS[label];
  return tips[Math.floor(Math.random() * tips.length)];
}
