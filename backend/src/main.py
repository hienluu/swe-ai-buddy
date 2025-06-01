from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import openai  # Assumes OpenAI for now; extendable to Gemini/Claude
from openai import OpenAI
import json

load_dotenv()  # loads variables from .env file


app = FastAPI()

# Allow CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SYSTEM_PROMPT_FOR_PLAN = """
You are an AI assistant that acts as a dual-role expert: 
- A seasoned software architect with over 10 years of hands-on experience in designing and scaling complex distributed systems, optimizing performance in production environments, and modernizing legacy code in large-scale enterprise applications.
- A stellar director of engineering with deep expertise in cross-team collaboration, mentoring, organizational leadership, and building high-performing teams from the ground up—across both startups and mid-sized companies.

Your job is to help software engineers of all experience levels (from junior to senior) overcome a specific challenge. The user will provide a selected challenge along with specific contextual details.

Your response must include:
1. Analysis of the Challenge
2. Comprehensive Action Plan to Overcome This Challenge
3. Concluding Remarks

Tone: a blend of coaching, mentoring, and collaborative problem-solving—approachable yet insightful, clear yet empowering.
Avoid generic advice. Tailor insights to the user's described context.
"""

SYSTEM_PROMPT_FOR_PROMPT = """
You are an AI assistant with expertise in meta-prompting and a deep understanding of the software engineering domain. Your task is to assist software engineers—from beginners to advanced—in formulating effective and exploratory user prompts based on their specific challenges.

When provided with a high-level context and a challenge (technical or non-technical), generate **2 prompts** in markdown format. Each prompt should be structured into the following sections:

- **Problem Statement:** Clearly restate the challenge in general terms.
- **Guiding Questions:** Pose questions that encourage the user to analyze and dissect the challenge without directly providing the solution.
- **Exploratory Strategies and Discussion Points:** Offer insights, strategies, and examples (e.g., code snippets, architecture diagrams) relevant to areas such as system design, programming, debugging, team collaboration, performance optimization, security, and project management.

**Important Guidelines:**
- **Tailor your responses** to the expertise level of the user (beginner, intermediate, or advanced) when such context is provided.
- **Emphasize the process over direct answers,** promoting a step-by-step approach to problem-solving.
- **Include relevant details or examples** wherever applicable to help illuminate the path to the solution.
- **Adjust the depth and focus** of your guidance based on whether the challenge is primarily technical or non-technical.

Your goal is to guide software engineers toward a deeper understanding of their challenges by fostering critical thinking and self-guided discovery.
"""



class ChallengeRequest(BaseModel):
    challenge: str
    context: str
    mode: str
    model: str

def get_gemini_client():
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    gemini_compatible_openai_endpoint = os.getenv("GEMINI_COMPATIBLE_OPENAI_ENDPOINT")
    print(f"gemini_compatible_openai_endpoint: {gemini_compatible_openai_endpoint}")
    client = OpenAI(
        api_key=gemini_api_key,
        base_url=gemini_compatible_openai_endpoint,
    )
    
    return client, "gemini-2.0-flash" #"gemini-2.5-flash-preview-05-20"

def get_grok_client():
    groq_api_key = os.getenv("GROQ_API_KEY")
    groq_compatible_openai_endpoint = os.getenv("GROQ_COMPATIBLE_OPENAI_ENDPOINT")
    print(f"groq_compatible_openai_endpoint: {groq_compatible_openai_endpoint}")
    client = OpenAI(
        base_url=groq_compatible_openai_endpoint,
        api_key=groq_api_key,
    )
    
    return client, "meta-llama/llama-4-maverick-17b-128e-instruct"

def get_openai_client():
    openai.api_key = os.getenv("OPENAI_API_KEY")
    client = OpenAI(
    )
    
    return client, "o4-mini" # "gpt-4o"

def get_system_prompt(mode):
    if mode == "plan":
        return SYSTEM_PROMPT_FOR_PLAN
    elif mode == "prompt":
        return SYSTEM_PROMPT_FOR_PROMPT
    else:
        raise ValueError(f"Invalid mode: {mode}")

def get_model_client(requested_model):
    if requested_model == "gemini_flash":
        return get_gemini_client()
    elif requested_model == "groq_llama_4":
        return get_grok_client()
    elif requested_model == "openai":
        return get_openai_client()

@app.post("/api/solve")
async def solve_challenge(req: ChallengeRequest):
    requested_mode = req.mode
    requested_model = req.model
    print("requested_mode: ", requested_mode)
    system_prompt = get_system_prompt(requested_mode)
    
    print(f"requested_model: {requested_model}")
    client, model = get_model_client(requested_model)
    print(f"mode: {requested_mode}, model: {model}")

    try:
        completion = client.chat.completions.create(
            model=model,
             messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Challenge: {req.challenge}\nContext: {req.context}"},
            ],
            #response_format={"type": "json_object"}
        )
        
        content = completion.choices[0].message.content

        # Very basic content sectioning
        def extract(section):
            import re
            match = re.search(rf"{section}.*?:\s*(.+?)(?=\n\s*[A-Z][^\n]*:|$)", content, re.S)
            return match.group(1).strip() if match else "(Section not found)"

        return {
            "challenge": req.challenge,
            "analysis": content,
            "plan": "NONE",
            "remarks": "NONE"
        }
    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":    
     req = ChallengeRequest(challenge="Dealing with a legacy codebase", context="Refactoring a legacy component")
     """   
    client, model = get_gemini_client()
    completion = client.chat.completions.create(
            model=model,
             messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Challenge: {req.challenge}\nContext: {req.context}"},
            ],
            
        )
    content = completion.choices[0].message.content
    print(content)
    """

     response = solve_challenge(req)
     print(response.analysis)