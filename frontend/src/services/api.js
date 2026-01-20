import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Speech to Text
  async speechToText(audioBlob) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    
    const response = await api.post('/api/stt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Text to Speech
  async textToSpeech(text) {
    const response = await api.post('/api/tts', 
      { text },
      { responseType: 'blob' }
    );
    return response.data;
  },

  // Upload Documents
  async uploadDocuments(files) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    const response = await api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Query RAG
  async queryRAG(query) {
    const response = await api.post('/api/query', { query });
    return response.data;
  },

  // Delete Document
  async deleteDocument(filename) {
    const response = await api.delete(`/api/documents/${filename}`);
    return response.data;
  },

  // Health Check
  async healthCheck() {
    const response = await api.get('/api/health');
    return response.data;
  },
};

export default api;