import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { message, history, agentId } = req.body;
  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(500).json({ error: 'GROQ_API_KEY not set' });

  let systemInstruction = 'You are a helpful AI assistant.';
  switch (agentId) {
    case 'goal-analysis':
      systemInstruction = "You are the Goal Analysis Agent for iTaqiZ AgentVerse. Analyze the user's career and academic goals. Ask probing questions, refine ambitions, give strategic advice. Be concise and actionable. Use markdown.";
      break;
    case 'university':
      systemInstruction = "You are the University Match Agent for iTaqiZ AgentVerse. Recommend universities based on the user's profile. Provide details about programs, admission requirements, rankings. Be specific and practical. Use markdown.";
      break;
    case 'scholarship':
      systemInstruction = "You are the Scholarship Scout Agent for iTaqiZ AgentVerse. Find scholarships, grants, and funding matching the user's profile. Be thorough and specific. Use markdown.";
      break;
    case 'profile-analysis':
      systemInstruction = "You are the Profile Analysis Agent for iTaqiZ AgentVerse. Review skills, grades, extracurriculars. Identify strengths and weaknesses. Be honest, constructive, motivating. Use markdown.";
      break;
    case 'roadmap':
      systemInstruction = "You are the Roadmap Agent for iTaqiZ AgentVerse. Create step-by-step timelines and action plans. Break down application process, test prep, skill-building into chronological roadmaps. Use markdown with headers and bullets.";
      break;
  }

  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Brand: iTaqiZ AgentVerse. Style: Modern, concise, direct, warm. Use markdown. ' + systemInstruction,
        },
        ...(history || []).map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.text,
        })),
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  const data = await groqRes.json();
  if (data.error) return res.status(500).json({ error: data.error.message });

  const text = data.choices?.[0]?.message?.content;
  if (!text) return res.status(500).json({ error: 'No response from Groq' });

  res.json({ text });
}