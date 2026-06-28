from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import asyncio
from fastapi.responses import StreamingResponse
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

# ─── SYSTEM PROMPT ───────────────────────────────────────
SYSTEM_PROMPT = """
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
2. If student writes in URDU (اردو) — reply ONLY in Urdu script
   NEVER mix Hindi (Devanagari script like सवال) with Urdu
   Urdu uses Arabic script only — never use Devanagari characters
3. If student writes in CHINESE — reply in Simplified Chinese only
4. PAF-IAST charges SAME fee for ALL BS programs (Rs. 159,441/semester national)
5. PAF-IAST charges SAME fee for ALL MS programs
6. If question has multiple parts — answer ALL parts
7. ALWAYS give exact numbers when available in context
8. If info is partially available — give what you know
9. NEVER make up information not in context
10. For missing info — direct to info@paf-iast.edu.pk or 0995-111 723 278
11. Be conversational — not robotic
12. Use bullet points for lists, be organized

CONTACT INFO (always available):
- Email: info@paf-iast.edu.pk
- Phone: 0995-111 723 278
- Address: Khanpur Road, Mang Haripur, KPK
- Website: paf-iast.edu.pk

GREETING RESPONSES:
- If student says hi/hello/salam → greet warmly and ask how you can help
- If student says thanks → respond warmly
- If student asks who you are → explain you are PAFI, PAF-IAST's AI assistant

FEE STRUCTURE (always remember):
BS Programs (National): 
  - Admission Fee: Rs. 30,000 (one time)
  - Security Fee: Rs. 30,000 (one time)  
  - Tuition Fee: Rs. 159,441 per semester
  - ECA Charges: Rs. 4,000 per semester
  - Other Expenses: Rs. 4,500 per semester
  - Per Credit Hour: Rs. 9,664

BS Programs (International):
  - All fees are exactly double the national fees

MS/PhD Programs (National):
  - Admission Fee: Rs. 30,000 (one time)
  - Tuition Fee: Rs. 159,441 per semester
  - Per Credit Hour: Rs. 16,105

Context from PAF-IAST official data:
{context}

Student Question: {question}

PAFI Answer:"""

prompt = PromptTemplate.from_template(SYSTEM_PROMPT)

def format_docs(docs):
    return "\n\n".join([
        f"[Source: {doc.metadata.get('page', 'PAF-IAST')}]\n{doc.page_content}"
        for doc in docs
    ])

chain = (
    {
        "context": retriever | format_docs,
        "question": RunnablePassthrough()
    }
    | prompt
    | llm
    | StrOutputParser()
)


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
        # Translate non-English to English for FAISS search
        if q.language != "en":
            translate_prompt = f"""Translate this to English. 
Return ONLY the English translation, nothing else.
Do not include any explanation or original text.
Text: {q.question}
English translation:"""
            translated = llm.invoke(translate_prompt).content.strip()
        else:
            translated = q.question

        # Search FAISS with English question
        docs = retriever.invoke(translated)
        context = format_docs(docs)

        # Build final prompt with original language question
        final_prompt = SYSTEM_PROMPT.replace(
    "{context}", context
).replace(
    "{question}", q.question
) + f"\n\nIMPORTANT: The student wrote in {q.language} language. Reply ONLY in that language. For Urdu use ONLY Arabic script (اردو). Never mix languages or scripts."

        answer = llm.invoke(final_prompt).content.strip()
        return {"answer": answer}

    except Exception as e:
        return {
            "answer": f"I'm sorry, I encountered an error. Please try again or contact PAF-IAST at info@paf-iast.edu.pk"
        }


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
            ("🕷️ Starting Web Scraper — scraping 20 pages...", "scraper.py"),
            ("📄 Starting PDF Scraper — extracting 13 PDFs...", "pdf_scraper.py"),
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
                    await asyncio.wait_for(process.wait(), timeout=300)
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

        yield "data: 🎉 PAFI updated with latest PAF-IAST data!\n\n"
        yield "data: DONE\n\n"

    return StreamingResponse(
        run_scripts(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no"
        }
    )
from fastapi.responses import FileResponse
import os

@app.get("/widget.js")
async def serve_widget():
    return FileResponse(
        "widget.js",
        media_type="application/javascript"
    )