# 🌐 iTaqiZ AgentVerse

> A multi-agent AI platform that guides students and professionals through every step of their academic and career journey — from goal-setting to university selection, scholarships, profile evaluation, and personalized roadmaps.

---

## 🧩 Problem Statement

Students and early-career professionals face a fragmented, overwhelming journey when planning their academic futures. They must simultaneously research universities, hunt for scholarships, evaluate their own profiles, prepare for standardized tests, and map out long-term goals — all using disconnected tools and generic advice.

**AgentVerse solves this by providing five specialized AI agents in one platform**, each focused on a distinct phase of the journey, working together to give personalized, actionable guidance in real time.

---

## ✨ Features

### 🎯 Goal Analysis Agent
Helps users clarify and sharpen their career and academic objectives. Asks probing questions to identify ambitions, remove ambiguity, and turn vague aspirations into focused, achievable goals.

### 🎓 University Match Agent
Recommends universities tailored to the user's profile, interests, and target programs. Covers admission requirements, rankings, campus culture, and program-specific insights across global institutions.

### 🏆 Scholarship Scout Agent
Searches and suggests scholarships, grants, and funding opportunities that match the user's academic background, nationality, field of study, and extracurricular profile — so no funding opportunity is missed.

### 🔍 Profile Analysis Agent
Evaluates the user's academic record, skills, work experience, and extracurricular activities. Identifies competitive strengths to highlight in applications and gaps to address before applying.

### 🗺️ Roadmap Generator Agent
Builds a structured, chronological action plan tailored to the user's goals and timeline. Covers test preparation (GRE, SAT, IELTS, TOEFL), application deadlines, skill-building milestones, and submission strategies.

---

## 🏗️ Architecture

```
User Input
    ↓
Agent Router  (selects the correct specialized agent based on context)
    ↓
Specialized Agent  (Goal Analysis / University Match / Scholarship Scout / Profile Analysis / Roadmap)
    ↓
System Prompt + Conversation History  (sent to LLM with agent-specific instructions)
    ↓
Groq LLM  (llama-3.3-70b-versatile)
    ↓
Markdown Response  (rendered in the chat UI)
```

Each agent maintains its **own independent conversation history**, so switching agents never loses context and each specialist stays focused on its domain.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Build Tool | Vite 6 |
| Backend | Express (Node.js) |
| AI / LLM | Groq API — `llama-3.3-70b-versatile` |
| Runtime | tsx (TypeScript execution) |
| Icons | Lucide React |
| Markdown | react-markdown |

---

## 🚀 Installation

### Prerequisites
- Node.js 18+
- npm
- A free [Groq API key](https://console.groq.com)

### Steps

**1. Clone the repository**
```bash
git clone https://github.com/itaqiz/Hackathons.git 
cd Hackathons/AgentVerse
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment variables**

Create a `.env` file in the project root:
```
GROQ_API_KEY=your_groq_api_key_here
APP_URL=http://localhost:3000
```

> Get a free Groq API key at [console.groq.com](https://console.groq.com) — no credit card required.

**4. Start the development server**
```bash
npm run dev
```

**5. Open in browser**
```
http://localhost:3000
```

---

## 📖 Usage

1. **Pick an agent** from the sidebar based on what you need help with
2. **Type your question** or click one of the starter prompts to begin
3. **Have a conversation** — each agent remembers your chat history within the session
4. **Switch agents** at any time — your conversation with each agent is saved independently

**Example flow:**
- Start with **Goal Analysis** to clarify what you want
- Move to **Profile Analysis** to understand where you stand
- Use **University Match** to find the right programs
- Run **Scholarship Scout** to find funding
- Finish with **Roadmap Generator** to get your step-by-step plan

---

## 🔮 Future Work

- **Agent Collaboration** — Allow agents to share context with each other (e.g. Roadmap Agent reads output from Goal Analysis automatically)
- **Document Upload** — Let users upload transcripts, CVs, and SOPs for the Profile Analysis Agent to review directly
- **Saved Sessions** — Persist conversations across browser sessions with user accounts
- **Email Alerts** — Scholarship Scout notifies users of upcoming deadlines via email
- **Multi-language Support** — Support for Urdu, Arabic, and other languages for broader accessibility
- **University Database Integration** — Connect to live university APIs for real-time admission stats and deadlines
- **Progress Tracker** — A dashboard showing completed milestones from the Roadmap Agent

---

## 👨‍💻 Author

Muhammad Taqui

Built with ❤️ by **iTaqiZ | PK**

---

## 📄 License

MIT License — free to use, modify, and distribute.
