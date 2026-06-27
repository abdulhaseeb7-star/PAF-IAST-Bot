import asyncio
from fastapi.responses import StreamingResponse
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

app = FastAPI()

# Allow React frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load knowledge base once on startup
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
retriever = db.as_retriever(search_kwargs={"k": 3})

# Load LLM
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.3
)

# Prompt
prompt = PromptTemplate.from_template("""
You are a helpful assistant for PAF-IAST (Pak-Austria Fachhochschule: Institute of Applied Sciences and Technology) university website.
Use the following information to answer the student's question accurately and politely.
If the answer is not in the provided information, say "I don't have that information right now. Please contact PAF-IAST directly at info@paf-iast.edu.pk or call 0995-111 723 278."
Always respond in a friendly, professional and helpful tone.

IMPORTANT LANGUAGE RULE:
- Detect the language of the student's question automatically
- Always reply in the SAME language the student used
- If the question is in Urdu, reply in Urdu
- If the question is in Chinese, reply in Chinese
- If the question is in Arabic, reply in Arabic
- If the question is in German, reply in German
- If the question is in English, reply in English
- Default language is English if unsure

Context:
{context}

Student Question: {question}

Answer:""")

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

chain = (
    {
        "context": retriever | format_docs,
        "question": RunnablePassthrough()
    }
    | prompt
    | llm
    | StrOutputParser()
)

class Question(BaseModel):
    question: str
    language: str = "en"

@app.post("/chat")
async def chat(q: Question):
    try:
        # Step 1 - Translate question to English for FAISS search
        if q.language != "en":
            translate_prompt = f"""
Translate this question to English. Return ONLY the translated text, nothing else.
Question: {q.question}
English Translation:"""
            translated = llm.invoke(translate_prompt).content.strip()
        else:
            translated = q.question

        # Step 2 - Search FAISS with English question
        docs = retriever.invoke(translated)
        context = "\n\n".join(doc.page_content for doc in docs)

        # Step 3 - Answer in user's original language
        answer_prompt = f"""
You are a helpful assistant for PAF-IAST university website.
Use the following information to answer the student's question accurately and politely.
If the answer is not in the provided information, say you don't have that info and suggest contacting info@paf-iast.edu.pk or calling 0995-111 723 278.
IMPORTANT: Reply in the SAME language as the Student Question below.

Context:
{context}

Student Question: {q.question}

Answer:"""

        answer = llm.invoke(answer_prompt).content.strip()
        return {"answer": answer}

    except Exception as e:
        return {"answer": f"Sorry, something went wrong: {str(e)}"}
    # Admin login check
class AdminLogin(BaseModel):
    password: str

@app.post("/admin/login")
async def admin_login(data: AdminLogin):
    correct = os.getenv("ADMIN_PASSWORD", "paf1234")
    if data.password == correct:
        return {"success": True}
    return {"success": False}

# Update bot endpoint with live logs
@app.post("/admin/update")
async def update_bot(data: AdminLogin):
    correct = os.getenv("ADMIN_PASSWORD", "paf1234")
    if data.password != correct:
        return {"success": False, "message": "Unauthorized"}

    async def run_scripts():
        scripts = [
            ("🕷️ Starting Web Scraper — scraping 20 pages...", "scraper.py"),
            ("📄 Starting PDF Scraper — extracting 13 PDFs...", "pdf_scraper.py"),
            ("🧠 Rebuilding Knowledge Base — this takes 3-5 minutes...", "knowledge_base.py"),
        ]

        for message, script in scripts:
            yield f"data: ⏳ {message}\n\n"
            await asyncio.sleep(0.3)

            try:
                process = await asyncio.create_subprocess_exec(
                    "python", script,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                    cwd="/app"  # Railway working directory
                )

                # Stream output line by line
                while True:
                    line = await process.stdout.readline()
                    if not line:
                        break
                    decoded = line.decode().strip()
                    if decoded:
                        yield f"data: {decoded}\n\n"
                        await asyncio.sleep(0.1)

                # Wait for completion with timeout
                try:
                    await asyncio.wait_for(process.wait(), timeout=300)  # 5 min timeout
                except asyncio.TimeoutError:
                    process.kill()
                    yield f"data: ⚠️ {script} timed out after 5 minutes\n\n"
                    continue

                if process.returncode == 0:
                    yield f"data: ✅ {script} completed successfully!\n\n"
                else:
                    stderr_output = await process.stderr.read()
                    yield f"data: ❌ {script} failed: {stderr_output.decode()[:200]}\n\n"

            except Exception as e:
                yield f"data: ❌ Error running {script}: {str(e)}\n\n"

            await asyncio.sleep(0.5)

        yield "data: 🎉 Bot updated successfully!\n\n"
        yield "data: DONE\n\n"

    return StreamingResponse(
        run_scripts(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no"
        }
    )