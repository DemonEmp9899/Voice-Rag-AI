from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import os
import shutil
from typing import List
from io import BytesIO
import logging

from services.stt import STTService
from services.tts import TTSService
from services.embeddings import EmbeddingService
from services.rag import RAGService
from config import settings

app = FastAPI(title="Voice RAG API")
logger = logging.getLogger("voice-rag-api")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
stt_service = STTService()
tts_service = TTSService()
embedding_service = EmbeddingService()
rag_service = RAGService(embedding_service)

# Create directories
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.VECTORSTORE_DIR, exist_ok=True)

class QueryRequest(BaseModel):
    query: str

class TTSRequest(BaseModel):
    text: str

@app.post("/api/stt")
async def speech_to_text(audio: UploadFile = File(...)):
    """Convert speech to text"""
    try:
        # Save temp file
        temp_path = f"temp_{audio.filename}"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
        
        # Transcribe
        text = await stt_service.transcribe(temp_path)
        
        # Cleanup
        os.remove(temp_path)
        
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tts")
async def text_to_speech(request: TTSRequest):
    """Convert text to speech"""
    try:
        audio_data = await tts_service.synthesize(request.text)
        return StreamingResponse(
            BytesIO(audio_data),
            media_type="audio/wav"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload")
async def upload_documents(files: List[UploadFile] = File(...)):
    """Upload and process documents"""
    try:
        file_paths = []
        uploaded_files = []
        
        for file in files:
            file_path = os.path.join(settings.UPLOAD_DIR, file.filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            file_paths.append(file_path)
            uploaded_files.append(file.filename)
        
        # Add to vector store
        await embedding_service.add_documents(file_paths)
        
        return {"files": uploaded_files, "message": "Documents uploaded successfully"}
    except Exception as e:
        logger.exception("Upload failed")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/query")
async def query_rag(request: QueryRequest):
    """Query the RAG system"""
    try:
        logger.info(f"Received query: {request.query}")
        result = await rag_service.query(request.query)
        logger.info(f"Query successful: {result}")
        return result
    except Exception as e:
        logger.exception("Query failed")  # This will print full traceback
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/documents/{filename}")
async def delete_document(filename: str):
    """Delete a document"""
    try:
        file_path = os.path.join(settings.UPLOAD_DIR, filename)
        if os.path.exists(file_path):
            os.remove(file_path)
        return {"message": "Document deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)