import React, { useState } from 'react';
import { IoSendOutline } from 'react-icons/io5';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="border-t border-gray-200/50 bg-white/80 backdrop-blur-sm p-6">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex gap-4 items-end">
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your thoughts with Dr. Sarah Chen..."
              className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white/90 backdrop-blur-sm text-gray-900 placeholder-gray-500 resize-none transition-all duration-200 shadow-lg shadow-gray-500/10 hover:shadow-gray-500/20 focus:shadow-gray-500/30"
              disabled={isLoading}
              rows={message.split('\n').length}
              style={{ minHeight: '60px', maxHeight: '200px' }}
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
            disabled={isLoading || !message.trim()}
            className="px-6 py-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-2xl disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-105 disabled:hover:scale-100 disabled:shadow-none flex items-center gap-2 min-w-[120px] justify-center"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium">Thinking...</span>
              </>
            ) : (
              <>
                <IoSendOutline className="w-5 h-5" />
                <span className="text-sm font-medium">Send</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
