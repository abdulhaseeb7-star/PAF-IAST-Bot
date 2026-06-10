# 🎓 PAF-IAST AI Chatbot

An intelligent AI-powered chatbot for **Pak-Austria Fachhochschule: Institute of Applied Sciences and Technology (PAF-IAST)** university website. Built as an internship project to help students instantly find information about admissions, programs, fees, scholarships, and more.

---

## 🌟 Features

- 🤖 **AI-Powered Answers** — Uses Groq LLM (Llama 3) for intelligent responses
- 🔍 **Semantic Search** — FAISS vector database for accurate information retrieval
- 🌍 **Multilingual Support** — English, Urdu (اردو), and Chinese (中文)
- 📄 **PDF Knowledge** — Extracts data from official PAF-IAST PDFs
- 💬 **Chat Bubble UI** — Professional floating widget built with React
- ⚡ **FastAPI Backend** — Python backend with CORS support
- 🔄 **Admin Panel** — Password protected panel to update bot with latest data
- 🔒 **Secure** — API keys protected via .env file

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| AI Brain | Groq API (Llama 3.3 70B) |
| Vector Database | FAISS |
| Embeddings | HuggingFace all-MiniLM-L6-v2 |
| Framework | LangChain |
| Backend | FastAPI + Uvicorn |
| Frontend | React + Vite |
| Web Scraping | BeautifulSoup + Requests |
| PDF Extraction | PyMuPDF |

---

## 📁 Project Structure
PAF-IAST Bot/
│
├── 📄 scraper.py              # Scrapes 20+ PAF-IAST web pages
├── 📄 pdf_scraper.py          # Extracts text from PAF-IAST PDFs
├── 📄 knowledge_base.py       # Builds FAISS vector knowledge base
├── 📄 chatbot.py              # Terminal-based chatbot (testing)
├── 📄 api.py                  # FastAPI backend server
│
├── 📁 scraped_data/           # Scraped web pages (.txt files)
│   └── 📁 pdfs/               # Extracted PDF content
│
├── 📁 knowledge_base/         # FAISS vector database files
│
└── 📁 frontend/               # React chat bubble UI
└── 📁 src/
├── 📄 App.jsx         # Main chat widget component
├── 📄 Admin.jsx       # Admin panel component
└── 📄 main.jsx        # App entry point with routing
---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js v22+
- Groq API Key (free at [console.groq.com](https://console.groq.com))

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/PAF-IAST-Bot.git
cd PAF-IAST-Bot
```

### 2️⃣ Set Up Python Environment
```bash
python -m venv venv
venv\Scripts\activate
pip install requests beautifulsoup4 pymupdf langchain langchain-community
pip install langchain-core langchain-huggingface langchain-groq langchain-text-splitters
pip install faiss-cpu sentence-transformers fastapi uvicorn python-dotenv
```

### 3️⃣ Set Up Environment Variables
Create a `.env` file in the root folder:
GROQ_API_KEY=your_groq_api_key_here
ADMIN_PASSWORD=your_admin_password_here
### 4️⃣ Scrape PAF-IAST Data
```bash
python scraper.py
python pdf_scraper.py
```

### 5️⃣ Build Knowledge Base
```bash
python knowledge_base.py
```

### 6️⃣ Start Backend
```bash
uvicorn api:app --reload --port 8000
```

### 7️⃣ Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 8️⃣ Open in Browser
- **Chatbot:** http://localhost:5173
- **Admin Panel:** http://localhost:5173/admin

---

## 🌍 Supported Languages

| Language | Code | Users |
|---|---|---|
| 🇬🇧 English | `en` | International students |
| 🇵🇰 Urdu | `ur` | Pakistani students |
| 🇨🇳 Chinese | `zh` | Sino-Pak Center students |

---

## 🔒 Admin Panel

Access the admin panel at `/admin` to:
- View knowledge base stats
- Update bot with latest PAF-IAST data
- Monitor live update progress logs

Default password is set in your `.env` file under `ADMIN_PASSWORD`.

---

## 🔄 Updating the Bot

**Option A — Via Admin Panel (Recommended):**
1. Go to http://localhost:5173/admin
2. Enter admin password
3. Click **Update Bot**
4. Watch live progress logs

**Option B — Via Terminal:**
```bash
python scraper.py
python pdf_scraper.py
python knowledge_base.py
```

---

## 📊 Knowledge Base Stats

| Metric | Value |
|---|---|
| Web Pages Scraped | 20 pages |
| PDFs Extracted | 13 PDFs |
| Total Chunks | 776 vectors |
| Embedding Model | all-MiniLM-L6-v2 |

---

## 🔮 Future Improvements

- [ ] Auto weekly re-scraping scheduler
- [ ] Voice input support
- [ ] Chat history and analytics dashboard
- [ ] More language support
- [ ] Integration with PAF-IAST student portal (ERP/LMS)

---

## 👨‍💻 Built By

**AbdulHaseeb** — Internship Project @ infirix  
Built with ❤️ using Python, LangChain, FAISS, and React

