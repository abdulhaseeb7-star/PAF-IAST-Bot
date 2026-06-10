import os
import json
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document

def load_scraped_data():
    print("📂 Loading scraped data...")
    
    with open("scraped_data/all_data.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    
    documents = []
    for page in data:
        doc = Document(
            page_content=page["content"],
            metadata={
                "page": page["page"],
                "url": page["url"]
            }
        )
        documents.append(doc)
    
    print(f"  ✅ Loaded {len(documents)} pages")
    return documents


def split_into_chunks(documents):
    print("✂️  Splitting into chunks...")
    
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,       # each chunk = 500 characters
        chunk_overlap=50,     # overlap so context isn't lost
        separators=["\n\n", "\n", ".", " "]
    )
    
    chunks = splitter.split_documents(documents)
    print(f"  ✅ Created {len(chunks)} chunks from {len(documents)} pages")
    return chunks


def create_knowledge_base(chunks):
    print("🧠 Creating embeddings and building FAISS knowledge base...")
    print("  ⏳ This may take 2-3 minutes on first run...")
    
    # Load the embedding model (downloads once, ~90MB)
    embeddings = HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2",
        model_kwargs={"device": "cpu"}
    )
    
    # Create FAISS vector store
    db = FAISS.from_documents(chunks, embeddings)
    
    # Save to disk
    db.save_local("knowledge_base")
    print("  ✅ Knowledge base saved to: knowledge_base/")
    return db


def test_knowledge_base(db):
    print("\n🔍 Testing knowledge base with sample questions...")
    
    test_questions = [
        "What are the admission requirements?",
        "What is the fee structure?",
        "What bachelor programs are offered?",
        "How can I apply for scholarship?",
        "What is the contact number of PAF-IAST?"
    ]
    
    embeddings = HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2",
        model_kwargs={"device": "cpu"}
    )
    
    db = FAISS.load_local(
        "knowledge_base", 
        embeddings,
        allow_dangerous_deserialization=True
    )
    
    for question in test_questions:
        print(f"\n❓ Question: {question}")
        results = db.similarity_search(question, k=1)
        if results:
            # Show first 300 characters of the answer
            preview = results[0].page_content[:300]
            source = results[0].metadata["page"]
            print(f"📄 Source: {source}")
            print(f"💬 Preview: {preview}...")


def main():
    print("=" * 50)
    print("  PAF-IAST Knowledge Base Builder")
    print("=" * 50)
    
    # Step 1 - Load scraped data
    documents = load_scraped_data()
    
    # Step 2 - Split into chunks
    chunks = split_into_chunks(documents)
    
    # Step 3 - Create knowledge base
    db = create_knowledge_base(chunks)
    
    # Step 4 - Test it
    test_knowledge_base(db)
    
    print("\n🎉 Knowledge base is ready!")
    print("📁 Saved in: knowledge_base/")


if __name__ == "__main__":
    main()