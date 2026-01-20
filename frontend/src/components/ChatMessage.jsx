import React from 'react';

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl p-4 shadow-lg ${
          isUser
            ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
            : 'bg-white/20 backdrop-blur-sm text-white border border-white/10'
        }`}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <p className="text-xs text-purple-200 font-semibold mb-1">📚 Sources:</p>
            <div className="space-y-1">
              {message.sources.map((src, i) => (
                <p key={i} className="text-xs text-purple-300 pl-2">
                  • {src.split('/').pop()}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;