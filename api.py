from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import asyncio
import base64
import httpx
import json
from fastapi.responses import StreamingResponse, FileResponse
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

print("📂 Loading knowledge base...")
embeddings = HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2",
    model_kwargs={"device": "cpu"}
)
db = FAISS.load_local(
    "knowledge_base",
    embeddings,
    allow_dangerous_deserialization=True
)
retriever = db.as_retriever(search_kwargs={"k": 5})

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.3
)

print("✅ Bot ready!")


# ─── CONFIG LOADER ───────────────────────────────────────
def load_config():
    try:
        with open("config.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return {}


def build_system_prompt():
    config = load_config()
    fee = config.get("fee_structure", {})
    contact = config.get("contact", {})
    bs = fee.get("bs_national", {})
    ms = fee.get("ms_phd_national", {})
    last_updated = config.get("last_updated", "unknown")

    return f"""
You are PAFI — the official AI Assistant for PAF-IAST
(Pak-Austria Fachhochschule: Institute of Applied Sciences
and Technology), located in Haripur, Khyber Pakhtunkhwa, Pakistan.

YOUR IDENTITY:
- Your name is PAFI (PAF-IAST Intelligence)
- You are friendly, professional, and helpful
- You represent PAF-IAST officially
- You care about every student's success

YOUR KNOWLEDGE:
- You know everything about PAF-IAST from official sources
- Admissions, programs, fees, scholarships, campus life
- Faculty, research centers, international collaborations
- Academic schedules, eligibility criteria

STRICT RULES:
1. ALWAYS reply in the SAME language the student used
2. If student writes in URDU reply ONLY in Urdu Arabic script
   NEVER mix Hindi Devanagari script with Urdu
3. If student writes in CHINESE reply in Simplified Chinese only
4. PAF-IAST charges SAME fee for ALL BS programs
5. PAF-IAST charges SAME fee for ALL MS programs
6. If question has multiple parts answer ALL parts
7. ALWAYS give exact numbers when available in context
8. If info is partially available give what you know
9. NEVER make up information not in context
10. For missing info direct to {contact.get('email', 'info@paf-iast.edu.pk')} or {contact.get('phone', '0995-111 723 278')}
11. CRITICAL: Keep answers under 4 lines maximum
    Lead with the direct answer immediately
    No introductions like "I'd be happy to help"
    No conclusions like "I hope this helps"
    No "feel free to ask" endings
    Just answer directly and concisely
12. Never over-explain — give direct answer first
13. Use bullet points for lists — maximum 5 bullets
14. Think like a text message not an essay
15. Be conversational — not robotic
16. For PEC or HEC accreditation questions NEVER confirm or deny
    Say: "Please verify at pec.org.pk or contact our QEC office"
17. ALWAYS end answer with relevant official link for verification
18. Use these links based on topic:
    Admissions: https://paf-iast.edu.pk/admissions/
    Fee Structure: https://paf-iast.edu.pk/fee-structure/
    Eligibility: https://paf-iast.edu.pk/eligibilitycriteria/
    Merit Scheme: https://paf-iast.edu.pk/admissionsmeritscheme/
    Entry Test: https://paf-iast.edu.pk/bachelor-admission-entry-test/
    BS Programs: https://paf-iast.edu.pk/bachelor-programs/
    MS Programs: https://paf-iast.edu.pk/master-programs/
    PhD Programs: https://paf-iast.edu.pk/phd-programs/
    Scholarships: https://paf-iast.edu.pk/scholarships/
    Merit Scholarship: https://paf-iast.edu.pk/paf-iast-merit-scholarship/
    Need Scholarship: https://paf-iast.edu.pk/paf-iast-need-based-scholarships/
    Academic Schedule: https://paf-iast.edu.pk/academic_schedules/
    Contact: https://paf-iast.edu.pk/contact/
    Research: https://paf-iast.edu.pk/paf-research/
    International: https://paf-iast.edu.pk/international/
    Campus Life: https://paf-iast.edu.pk/campus-life/
    Hostel: https://paf-iast.edu.pk/hostel/
    FAQs: https://paf-iast.edu.pk/faqs/
    PEC: https://pec.org.pk
    HEC: https://hec.gov.pk
19. Format link at end of answer like this:
    🔗 paf-iast.edu.pk/relevant-page/

CONTACT INFO:
- Email: {contact.get('email', 'info@paf-iast.edu.pk')}
- Phone: {contact.get('phone', '0995-111 723 278')}
- Address: {contact.get('address', 'Khanpur Road, Mang Haripur, KPK')}
- Website: {contact.get('website', 'paf-iast.edu.pk')}

GREETING RESPONSES:
- If student says hi/hello/salam greet warmly and ask how you can help
- If student says thanks respond warmly
- If student asks who you are explain you are PAFI PAF-IAST's AI assistant

FEE STRUCTURE — ALWAYS USE THESE EXACT NUMBERS (last updated: {last_updated}):
IMPORTANT: When ANY student asks about fee, cost, tuition, charges — 
use ONLY these numbers, do not say you don't have information:
BS Programs (National):
  - Admission Fee: {bs.get('admission_fee', 'Rs. 30,000 (one time)')}
  - Security Fee: {bs.get('security_fee', 'Rs. 30,000 (one time)')}
  - Tuition Fee: {bs.get('tuition_fee', 'Rs. 159,441 per semester')}
  - ECA Charges: {bs.get('eca_charges', 'Rs. 4,000 per semester')}
  - Other Expenses: {bs.get('other_expenses', 'Rs. 4,500 per semester')}
  - Per Credit Hour: {bs.get('per_credit_hour', 'Rs. 9,664')}

BS Programs (International):
  - All fees are exactly double the national fees

MS/PhD Programs (National):
  - Admission Fee: {ms.get('admission_fee', 'Rs. 30,000 (one time)')}
  - Tuition Fee: {ms.get('tuition_fee', 'Rs. 159,441 per semester')}
  - Per Credit Hour: {ms.get('per_credit_hour', 'Rs. 16,105')}

Context from PAF-IAST official data:
{{context}}

Student Question: {{question}}

PAFI Answer:"""


# ─── CHAT ENDPOINT ───────────────────────────────────────
class Question(BaseModel):
    question: str
    language: str = "en"


@app.get("/")
def root():
    return {
        "status": "PAFI — PAF-IAST AI Assistant is running! 🎓",
        "version": "2.0"
    }


@app.post("/chat")
async def chat(q: Question):
    try:
        if q.language != "en":
            translate_prompt = f"""Translate this to English.
Return ONLY the English translation, nothing else.
Do not include any explanation or original text.
Text: {q.question}
English translation:"""
            translated = llm.invoke(translate_prompt).content.strip()
        else:
            translated = q.question

        docs = retriever.invoke(translated)
        context = "\n\n".join([
            f"[Source: {doc.metadata.get('page', 'PAF-IAST')}]\n{doc.page_content}"
            for doc in docs
        ])

        current_prompt = build_system_prompt()
        final_prompt = current_prompt.replace(
            "{context}", context
        ).replace(
            "{question}", q.question
        ) + f"\n\nIMPORTANT: Student wrote in {q.language}. Reply ONLY in that language. For Urdu use ONLY Arabic script. Never mix languages."

        answer = llm.invoke(final_prompt).content.strip()
        return {"answer": answer}

    except Exception as e:
        return {
            "answer": "I'm sorry, I encountered an error. Please try again or contact PAF-IAST at info@paf-iast.edu.pk"
        }


# ─── GITHUB PUSH HELPER ──────────────────────────────────
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_REPO = os.getenv("GITHUB_REPO")
GITHUB_BRANCH = os.getenv("GITHUB_BRANCH", "main")
FOLDERS_TO_PUSH = ["knowledge_base", "scraped_data"]
FILES_TO_PUSH = ["config.json"]


async def push_file_to_github(client, local_path, repo_path):
    with open(local_path, "rb") as f:
        content_b64 = base64.b64encode(f.read()).decode("utf-8")

    url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{repo_path}"
    headers = {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json",
    }

    get_res = await client.get(url, headers=headers,
                               params={"ref": GITHUB_BRANCH})
    sha = get_res.json().get("sha") if get_res.status_code == 200 else None

    payload = {
        "message": f"update: auto-sync {repo_path} via admin panel",
        "content": content_b64,
        "branch": GITHUB_BRANCH,
    }
    if sha:
        payload["sha"] = sha

    put_res = await client.put(url, headers=headers, json=payload)
    return put_res.status_code in (200, 201), put_res.text


async def push_knowledge_to_github():
    if not GITHUB_TOKEN or not GITHUB_REPO:
        yield "⚠️ GITHUB_TOKEN or GITHUB_REPO not set — skipping GitHub sync"
        return

    async with httpx.AsyncClient(timeout=60) as client:
        pushed = 0
        failed = 0

        for folder in FOLDERS_TO_PUSH:
            if not os.path.isdir(folder):
                continue
            for root, _, files in os.walk(folder):
                for fname in files:
                    local_path = os.path.join(root, fname)
                    repo_path = local_path.replace("\\", "/")
                    ok, msg = await push_file_to_github(
                        client, local_path, repo_path)
                    if ok:
                        pushed += 1
                        yield f"  ↳ ✅ pushed {repo_path}"
                    else:
                        failed += 1
                        yield f"  ↳ ❌ failed {repo_path}: {msg[:120]}"

        for fname in FILES_TO_PUSH:
            if os.path.isfile(fname):
                ok, msg = await push_file_to_github(
                    client, fname, fname)
                if ok:
                    pushed += 1
                    yield f"  ↳ ✅ pushed {fname}"
                else:
                    failed += 1
                    yield f"  ↳ ❌ failed {fname}: {msg[:120]}"

        yield f"📦 GitHub sync complete — {pushed} pushed, {failed} failed"


# ─── ADMIN ENDPOINTS ─────────────────────────────────────
class AdminLogin(BaseModel):
    password: str


@app.post("/admin/login")
async def admin_login(data: AdminLogin):
    correct = os.getenv("ADMIN_PASSWORD", "paf1234")
    if data.password == correct:
        return {"success": True}
    return {"success": False}


@app.post("/admin/update")
async def update_bot(data: AdminLogin):
    correct = os.getenv("ADMIN_PASSWORD", "paf1234")
    if data.password != correct:
        return {"success": False, "message": "Unauthorized"}

    async def run_scripts():
        scripts = [
            ("🕷️ Starting Web Scraper — scraping all pages...", "scraper.py"),
            ("📄 Starting PDF Scraper — extracting PDFs...", "pdf_scraper.py"),
            ("🧠 Rebuilding Knowledge Base — takes 3-5 mins...", "knowledge_base.py"),
        ]

        for message, script in scripts:
            yield f"data: ⏳ {message}\n\n"
            await asyncio.sleep(0.3)

            try:
                process = await asyncio.create_subprocess_exec(
                    "python", script,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                    cwd="/app"
                )

                while True:
                    line = await process.stdout.readline()
                    if not line:
                        break
                    decoded = line.decode().strip()
                    if decoded:
                        yield f"data: {decoded}\n\n"
                        await asyncio.sleep(0.1)

                try:
                    await asyncio.wait_for(
                        process.wait(), timeout=300)
                except asyncio.TimeoutError:
                    process.kill()
                    yield f"data: ⚠️ {script} timed out\n\n"
                    continue

                if process.returncode == 0:
                    yield f"data: ✅ {script} completed!\n\n"
                else:
                    err = await process.stderr.read()
                    yield f"data: ❌ Error: {err.decode()[:200]}\n\n"

            except Exception as e:
                yield f"data: ❌ {str(e)}\n\n"

            await asyncio.sleep(0.5)

        yield "data: 🔗 Pushing updated files to GitHub...\n\n"
        await asyncio.sleep(0.2)
        try:
            async for line in push_knowledge_to_github():
                yield f"data: {line}\n\n"
                await asyncio.sleep(0.05)
        except Exception as e:
            yield f"data: ❌ GitHub push failed: {str(e)}\n\n"

        yield "data: 🎉 PAFI updated and saved to GitHub!\n\n"
        yield "data: DONE\n\n"

    return StreamingResponse(
        run_scripts(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no"
        }
    )


@app.get("/widget.js")
async def serve_widget():
    return FileResponse(
        "widget.js",
        media_type="application/javascript"
    )