import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # API Keys
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    
    # LLM Config
    LLM_PROVIDER = os.getenv("LLM_PROVIDER", "groq")
    LLM_MODEL = os.getenv("LLM_MODEL", "llama3-8b-8192")
    
    # Paths
    UPLOAD_DIR = "uploads"
    VECTORSTORE_DIR = "vectorstore"
    
    # RAG Settings
    CHUNK_SIZE = 1000
    CHUNK_OVERLAP = 200
    TOP_K = 3
    
    # Audio
    TTS_ENGINE = os.getenv("TTS_ENGINE", "pyttsx3")  # pyttsx3, elevenlabs

settings = Settings()
