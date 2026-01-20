# 🎙️ Voice RAG AI (Speech-Enabled Retrieval-Augmented Generation)

This project implements a **voice-enabled Retrieval-Augmented Generation (RAG) system** that allows users to:

- Upload documents (PDF / TXT)
- Ask questions using **text or voice**
- Retrieve relevant context using **vector similarity search**
- Generate accurate answers using **Large Language Models (Groq)**
- Convert **speech → text** and **text → speech**

The system is designed to support **document-grounded question answering**, scale with more documents, and work without fine-tuning any language model.

---

## 🧠 How This Project Works

The system follows a **two-stage RAG architecture**:

1. **Offline / Ingestion Pipeline**
2. **Online / Query Pipeline**

Instead of sending entire documents to the LLM, the system retrieves only the **most relevant chunks**, improving accuracy, efficiency, and cost.

---

## 🔹 1. Document Ingestion Pipeline (Offline / On Upload)

When documents are uploaded, the system processes them once and stores their representations.

For each document, the pipeline performs:

- **Document Loading**  
  Supports `.pdf` and `.txt` files

- **Text Chunking**  
  Documents are split into overlapping chunks using a recursive text splitter

- **Embedding Generation**  
  Each chunk is converted into a dense vector using **HuggingFace sentence embeddings**

- **Vector Indexing (FAISS)**  
  All embeddings are stored in a FAISS vector store for fast similarity search

The vector store is persisted locally (or via a persistent disk in production).

📁 Implemented in: `backend/services/embeddings.py`

---

## 🔹 2. Query Pipeline (Online)

At query time, the system retrieves relevant context and generates an answer.

**Example Query:**  
> *“Explain the concept of transformers from the uploaded document”*

The system performs the following steps:

1. **Query Embedding**  
   The user query is converted into an embedding

2. **Similarity Search**  
   FAISS retrieves the top-K most relevant document chunks

3. **Context Construction**  
   Retrieved chunks are combined into a context block

4. **LLM Answer Generation**  
   The context + question is sent to a **Groq-hosted LLM**

5. **Source Attribution**  
   Document sources are returned along with the answer

📁 Implemented in: `backend/services/rag.py`

---

## 🔹 Voice Interaction Layer

The system also supports **voice-based interaction**:

### 🎤 Speech-to-Text (STT)
- Converts spoken audio into text
- Implemented using **OpenAI Whisper**

📁 `backend/services/stt.py`

### 🔊 Text-to-Speech (TTS)
- Converts generated answers into audio
- Allows spoken responses

📁 `backend/services/tts.py`

---

## 🔹 Why This RAG Design Works Well

- Prevents hallucinations by grounding answers in documents
- Scales to large document collections
- Efficient and cost-effective
- Model-agnostic (LLM can be swapped easily)
- Works without supervised training or fine-tuning

---

## 🔹 Zero-Shot & Scalability Properties

- No labeled data required
- Handles unseen documents and questions
- Modular architecture (STT, RAG, TTS independent)
- Vector search scales to thousands of documents
- Persistent storage support for production deployments

---

# 📦 Complete Setup Guide – Voice RAG AI

This guide walks through setting up and running the **Voice RAG AI system** end-to-end.

---

## 📋 Prerequisites

- Python **3.10+**
- Node.js **18+**
- Git
- Groq API key (free tier available)
- Microphone (for voice queries)

---

## 🚀 Step-by-Step Setup

---

### Step 1: Get Groq API Key

1. Visit https://console.groq.com
2. Sign up / log in
3. Create an API key
4. Copy the key

---

### Step 2: Clone the Repository

```bash
git clone https://github.com/your-username/voice-rag-ai.git
cd voice-rag-ai
```

📁 Project Structure
```bash
voice-rag-ai/
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── requirements.txt
│   ├── services/
│   │   ├── embeddings.py
│   │   ├── rag.py
│   │   ├── stt.py
│   │   └── tts.py
│   ├── uploads/            # runtime (ignored by git)
│   └── vectorstore/        # runtime (ignored by git)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── .gitignore
```
⚙️ Backend Setup
Create Virtual Environment
```
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
```
Install Dependencies
```
pip install -r requirements.txt
```
Create .env File
```
GROQ_API_KEY=your_groq_api_key
LLM_MODEL=llama-3.1-8b-instant
```
Run Backend
```
uvicorn main:app --reload
```
🌐 Frontend Setup
```
cd frontend
npm install
npm run dev
```

👨‍🎓 Author

Rudra Pratap Tomer
AI / ML & Full-Stack Developer
Built as a learning-focused, production-ready RAG system 🚀
