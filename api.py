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