import React, { useState, useRef, useEffect } from 'react';
import { Send, Volume2, Mic, Sparkles } from 'lucide-react';
import { apiService } from './services/api';
import ChatMessage from './components/ChatMessage';
import VoiceRecorder from './components/VoiceRecorder';
import DocumentList from './components/DocumentList';
import ErrorAlert from './components/ErrorAlert';

function App() {
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processVoiceInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError('Microphone access denied. Please enable microphone permissions.');
    }
  };

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Process voice input
  const processVoiceInput = async (audioBlob) => {
    setIsProcessing(true);

    try {
      // Speech-to-Text
      const sttData = await apiService.speechToText(audioBlob);
      const transcribedText = sttData.text;

      // Add user message
      setMessages(prev => [...prev, { role: 'user', content: transcribedText }]);

      // RAG Query
      await processQuery(transcribedText);
    } catch (err) {
      setError('Error processing voice input: ' + err.message);
      setIsProcessing(false);
    }
  };

  // Process query with RAG
  const processQuery = async (query) => {
    try {
      const data = await apiService.queryRAG(query);
      
      // Add assistant message
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.answer,
        sources: data.sources 
      }]);

      // Generate TTS audio
      const audioBlob = await apiService.textToSpeech(data.answer);
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

    } catch (err) {
      setError('Error processing query: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Upload documents
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsProcessing(true);
    try {
      const data = await apiService.uploadDocuments(files);
      setDocuments(prev => [...prev, ...data.files]);
      setError(null);
    } catch (err) {
      setError('Error uploading documents: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete document
  const deleteDocument = async (filename) => {
    try {
      await apiService.deleteDocument(filename);
      setDocuments(prev => prev.filter(doc => doc !== filename));
    } catch (err) {
      setError('Error deleting document: ' + err.message);
    }
  };

  // Send text message
  const sendTextMessage = async () => {
    if (!textInput.trim()) return;

    const query = textInput;
    setTextInput('');
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setIsProcessing(true);
    
    await processQuery(query);
  };

  // Play audio response
  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Sparkles className="w-10 h-10 text-purple-400 animate-pulse" />
            <h1 className="text-5xl font-bold text-white">
              Voice RAG Assistant
            </h1>
            <Sparkles className="w-10 h-10 text-purple-400 animate-pulse" />
          </div>
          <p className="text-purple-300 text-lg">
            Speak or type to query your documents with AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Document Upload */}
          <div className="lg:col-span-1">
            <DocumentList
              documents={documents}
              onUpload={handleFileUpload}
              onDelete={deleteDocument}
              isProcessing={isProcessing}
            />
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl flex flex-col h-[600px]">
              {/* Error Display */}
              <ErrorAlert error={error} onClose={() => setError(null)} />

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-20">
                    <Mic className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-pulse-slow" />
                    <p className="text-purple-300 text-lg font-semibold">
                      Start a conversation
                    </p>
                    <p className="text-purple-400 text-sm mt-2">
                      Click the mic button or type a message
                    </p>
                  </div>
                )}

                {messages.map((msg, idx) => (
                  <ChatMessage key={idx} message={msg} />
                ))}

                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Audio Player */}
              {audioUrl && (
                <div className="px-6 py-3 bg-white/5 border-t border-white/10">
                  <button
                    onClick={playAudio}
                    className="flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors group"
                  >
                    <Volume2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Play Response Audio</span>
                  </button>
                </div>
              )}

              {/* Input Area */}
              <div className="p-6 bg-white/5 border-t border-white/10">
                <div className="flex gap-3">
                  <VoiceRecorder
                    isRecording={isRecording}
                    isProcessing={isProcessing}
                    onStart={startRecording}
                    onStop={stopRecording}
                  />

                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
                    placeholder="Type your message..."
                    disabled={isProcessing}
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 transition-all"
                  />

                  <button
                    onClick={sendTextMessage}
                    disabled={isProcessing || !textInput.trim()}
                    className="flex-shrink-0 p-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl transition-all shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;