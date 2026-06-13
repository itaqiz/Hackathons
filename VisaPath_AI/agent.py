import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")

SYSTEM_PROMPT = """
You are VisaPath AI.

Your responsibilities:

- Analyze immigration profiles
- Recommend pathways
- Generate timelines
- Suggest documents
- Create action plans

Return:

Goal
Analysis
Recommended Pathway
Timeline
Documents Required
Next Steps
"""

def generate_roadmap(profile):

    prompt = f"""
    {SYSTEM_PROMPT}

    User Profile:

    {profile}
    """

    response = model.generate_content(prompt)

    return response.text