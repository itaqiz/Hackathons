import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history, agentId } = req.body;
      const key = process.env.GROQ_API_KEY;
      if (!key) {
        return res.status(500).json({ error: 'GROQ_API_KEY is not set in your .env file.' });
      }

      let systemInstruction = 'You are a helpful AI assistant.';
      switch (agentId) {
        case 'goal-analysis':
          systemInstruction = "You are the Goal Analysis Agent for iTaqiZ AgentVerse. Analyze the user's career and academic goals. Ask probing questions to clarify objectives, refine ambitions, and offer strategic advice on goal-setting. Be concise, insightful, and actionable. Use markdown.";
          break;
        case 'university':
          systemInstruction = "You are the University Match Agent for iTaqiZ AgentVerse. Recommend universities based on the user's profile and goals. Provide details about campus life, programs, admission requirements, and rankings. Be specific and practical. Use markdown.";
          break;
        case 'scholarship':
          systemInstruction = "You are the Scholarship Scout Agent for iTaqiZ AgentVerse. Find and suggest scholarships, grants, and funding opportunities matching the user's demographic and academic profile. Be thorough and specific. Use markdown.";
          break;
        case 'profile-analysis':
          systemInstruction = "You are the Profile Analysis Agent for iTaqiZ AgentVerse. Review the user's skills, grades, and extracurriculars. Identify strengths to highlight and weaknesses to improve. Be honest, constructive, and motivating. Use markdown.";
          break;
        case 'roadmap':
          systemInstruction = "You are the Roadmap Agent for iTaqiZ AgentVerse. Create step-by-step timelines and action plans. Break down the application process, test prep (GRE/SAT/IELTS), and skill-building into structured chronological roadmaps. Use markdown with headers and bullet points.";
          break;
      }

      const SYSTEM_PREFIX = 'Brand: iTaqiZ AgentVerse — a multi-agent platform for education and career guidance. Style: Modern, concise, direct, warm. Use markdown. ';

      const groqRes = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
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
                content: SYSTEM_PREFIX + systemInstruction,
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
        }
      );

      const data = await groqRes.json();

      if (data.error) {
        throw new Error(data.error.message || 'Groq API error');
      }

      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error('No response from Groq');

      res.json({ text });
    } catch (error: any) {
      console.error('AgentVerse API Error:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AgentVerse running on http://localhost:${PORT}`);
  });
}

startServer();
