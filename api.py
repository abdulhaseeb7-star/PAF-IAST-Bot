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
You are a helpful assistant for PAF-IAST university website.
Use the following information to answer the student's question accurately and politely.
If the answer is not in the provided information, say "I don't have that information right now. Please contact PAF-IAST directly at info@paf-iast.edu.pk or call 0995-111 723 278."
Always respond in a friendly, professional and helpful tone.

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

@app.get("/")
def root():
    return {"status": "PAF-IAST Bot API is running! 🎓"}

@app.post("/chat")
async def chat(q: Question):
    try:
        answer = chain.invoke(q.question)
        return {"answer": answer}
    except Exception as e:
        return {"answer": f"Sorry, something went wrong: {str(e)}"}