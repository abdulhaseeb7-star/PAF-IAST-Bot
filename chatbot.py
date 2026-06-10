import os
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

# Load API key from .env file
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def load_knowledge_base():
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
    
    print("  ✅ Knowledge base loaded!")
    return db


def create_chatbot(db):
    print("🤖 Setting up AI brain...")
    
    # Load Groq LLM
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        api_key=GROQ_API_KEY,
        temperature=0.3
    )
    
    # Retriever
    retriever = db.as_retriever(search_kwargs={"k": 3})
    
    # Custom prompt
    prompt_template = PromptTemplate.from_template("""
You are a helpful assistant for PAF-IAST (Pak-Austria Fachhochschule: Institute of Applied Sciences and Technology) university website.
Use the following information to answer the student's question accurately and politely.
If the answer is not in the provided information, say "I don't have that information right now. Please contact PAF-IAST directly at info@paf-iast.edu.pk or call 0995-111 723 278."
Always respond in a friendly, professional and helpful tone.

Context:
{context}

Student Question: {question}

Answer:""")

    # Format retrieved documents
    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    # Build modern chain
    chain = (
        {
            "context": retriever | format_docs,
            "question": RunnablePassthrough()
        }
        | prompt_template
        | llm
        | StrOutputParser()
    )
    
    print("  ✅ AI brain ready!")
    return chain, retriever


def chat(chain, retriever):
    print("\n" + "=" * 50)
    print("  🎓 PAF-IAST AI Assistant")
    print("  Type 'quit' to exit")
    print("=" * 50 + "\n")
    
    while True:
        question = input("You: ").strip()
        
        if question.lower() in ["quit", "exit", "bye"]:
            print("Bot: Goodbye! Feel free to ask anytime. 😊")
            break
        
        if not question:
            continue
        
        try:
            # Get answer
            answer = chain.invoke(question)
            print(f"\nBot: {answer}")
            
            # Show source
            docs = retriever.invoke(question)
            if docs:
                print(f"📄 Source: {docs[0].metadata['page']}")
            
            print()
            
        except Exception as e:
            print(f"Bot: Sorry, something went wrong. Error: {e}\n")


def main():
    db = load_knowledge_base()
    chain, retriever = create_chatbot(db)
    chat(chain, retriever)


if __name__ == "__main__":
    main()