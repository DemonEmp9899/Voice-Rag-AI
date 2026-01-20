import React from 'react';
import { Mic, MicOff } from 'lucide-react';

const VoiceRecorder = ({ isRecording, isProcessing, onStart, onStop }) => {
  return (
    <button
      onClick={isRecording ? onStop : onStart}
      disabled={isProcessing}
      className={`flex-shrink-0 p-4 rounded-xl transition-all shadow-lg ${
        isRecording
          ? 'bg-red-600 hover:bg-red-700 animate-pulse shadow-red-500/50'
          : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/50'
      } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
      title={isRecording ? 'Stop Recording' : 'Start Recording'}
    >
      {isRecording ? (
        <MicOff className="w-6 h-6" />
      ) : (
        <Mic className="w-6 h-6" />
      )}
    </button>
  );
};

export default VoiceRecorder;