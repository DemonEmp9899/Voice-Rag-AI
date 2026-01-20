import whisper
import os
from pathlib import Path

class STTService:
    def __init__(self):
        self.model = whisper.load_model("base")
    
    async def transcribe(self, audio_file_path: str) -> str:
        """Transcribe audio file to text"""
        try:
            result = self.model.transcribe(audio_file_path)
            return result["text"]
        except Exception as e:
            raise Exception(f"STT Error: {str(e)}")