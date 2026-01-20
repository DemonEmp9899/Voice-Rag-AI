import os
import pyttsx3
from io import BytesIO

class TTSService:
    def __init__(self):
        self.engine = pyttsx3.init()
        self.engine.setProperty('rate', 150)
        self.engine.setProperty('volume', 0.9)
    
    async def synthesize(self, text: str) -> bytes:
        """Convert text to speech audio"""
        try:
            # Save to temporary file
            temp_file = "temp_audio.wav"
            self.engine.save_to_file(text, temp_file)
            self.engine.runAndWait()
            
            # Read file content
            with open(temp_file, 'rb') as f:
                audio_data = f.read()
            
            # Clean up
            os.remove(temp_file)
            
            return audio_data
        except Exception as e:
            raise Exception(f"TTS Error: {str(e)}")