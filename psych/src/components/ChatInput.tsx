import React, { useState } from 'react';
import { IoSendOutline } from 'react-icons/io5';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isGeneratingAudio?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, isGeneratingAudio = false }) => {
  const [message, setMessage] = useState('');

  const isDisabled = isLoading || isGeneratingAudio;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isDisabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-4 shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your thoughts with Dr. Sarah Chen..."
              className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400/50 bg-white/90 backdrop-blur-sm text-gray-900 placeholder-gray-500 resize-none transition-all duration-200 text-sm"
              disabled={isDisabled}
              rows={message.split('\n').length}
              style={{ minHeight: '48px', maxHeight: '120px' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>
          <button
            type="submit"
            disabled={isDisabled || !message.trim()}
            className="px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 disabled:hover:scale-100 disabled:shadow-none flex items-center gap-2 min-w-[100px] justify-center"
          >
            {isLoading ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-medium">Thinking...</span>
              </>
            ) : isGeneratingAudio ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-medium">Audio...</span>
              </>
            ) : (
              <>
                <IoSendOutline className="w-4 h-4" />
                <span className="text-xs font-medium">Send</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
