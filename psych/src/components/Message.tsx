import React, { useState, useEffect } from 'react';
import { MarkdownRenderer, hasMarkdown } from '@/utils/markdown';
import { AudioPlayer } from './AudioPlayer';
import { IoChevronDownOutline, IoChevronUpOutline, IoVolumeHighOutline } from 'react-icons/io5';

interface MessageProps {
  content: string;
  isUser: boolean;
  thoughts?: string;
  audioData?: string;
  isGeneratingAudio?: boolean;
}

const TTS_VOICES = [
  { name: 'Kore', description: 'Firm' },
  { name: 'Zephyr', description: 'Bright' },
  { name: 'Puck', description: 'Upbeat' },
  { name: 'Charon', description: 'Informative' },
  { name: 'Fenrir', description: 'Excitable' },
  { name: 'Leda', description: 'Youthful' },
  { name: 'Orus', description: 'Firm' },
  { name: 'Aoede', description: 'Breezy' },
  { name: 'Callirrhoe', description: 'Easy-going' },
  { name: 'Autonoe', description: 'Bright' },
  { name: 'Enceladus', description: 'Breathy' },
  { name: 'Iapetus', description: 'Clear' },
];

export const Message: React.FC<MessageProps> = ({ content, isUser, thoughts, audioData, isGeneratingAudio = false }) => {
  const [showThoughts, setShowThoughts] = useState(false);
  const [showTTSModal, setShowTTSModal] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [showAudioInModal, setShowAudioInModal] = useState(false);

  // Debug logging
  useEffect(() => {
    if (!isUser) {
      console.log('🎵 Message component - Model response received:');
      console.log('🎵 Content length:', content.length);
      console.log('🎵 Has thoughts:', !!thoughts);
      console.log('🎵 Has audioData:', !!audioData);
      console.log('🎵 Generated audio:', !!generatedAudio);
    }
  }, [content, isUser, thoughts, audioData, generatedAudio]);

  // Debug logging
  useEffect(() => {
    if (!isUser) {
      console.log('🎵 Message component - Model response received:');
      console.log('🎵 Content length:', content.length);
      console.log('🎵 Has thoughts:', !!thoughts);
      console.log('🎵 Has audioData:', !!audioData);
      console.log('🎵 Generated audio:', !!generatedAudio);
    }
  }, [content, isUser, thoughts, audioData, generatedAudio]);

  const handleGenerateTTS = async () => {
    if (!content || isGeneratingTTS) return;
    
    console.log('🎵 Starting TTS generation for content:', content.substring(0, 100) + '...');
    console.log('🎵 Selected voice:', selectedVoice);
    
    // Get API key from cookies or localStorage
    const apiKey = document.cookie
      .split('; ')
      .find(row => row.startsWith('gemini_api_key='))
      ?.split('=')[1] || localStorage.getItem('gemini_api_key');
    
    if (!apiKey) {
      console.error('🎵 No API key found');
      alert('Please configure your API key in settings first.');
      return;
    }
    
    setIsGeneratingTTS(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({
          action: 'generate_tts',
          text: content,
          voice: selectedVoice,
        }),
      });

      console.log('🎵 TTS API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🎵 TTS generation successful, audio data received:', !!data.audioData);
        setGeneratedAudio(data.audioData);
        setShowTTSModal(false); // Close voice selection modal
        setShowAudioInModal(true); // Show audio player modal
      } else {
        const errorData = await response.json();
        console.error('🎵 TTS generation failed:', errorData);
        alert('Failed to generate audio. Please try again.');
      }
    } catch (error) {
      console.error('🎵 TTS generation error:', error);
      alert('Error generating audio. Please check your connection and try again.');
    } finally {
      setIsGeneratingTTS(false);
    }
  };

  const handleCloseModal = () => {
    setShowTTSModal(false);
    setShowAudioInModal(false);
    // Only clear generated audio if we're fully closing, not keeping in message
    setGeneratedAudio(null);
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {/* AI Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 mr-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-md">
            <span className="text-white font-semibold text-xs">DC</span>
          </div>
          <div className="text-xs text-gray-500 mt-1 text-center">Dr. Chen</div>
        </div>
      )}

      <div className={`${
        isUser 
          ? 'max-w-sm bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-md' 
          : 'max-w-3xl w-full bg-white/90 backdrop-blur-sm text-gray-900 border border-pink-200/30 shadow-sm'
      } rounded-2xl p-4 transition-all duration-300 hover:shadow-md ${isUser ? 'hover:shadow-pink-500/30' : 'hover:shadow-pink-500/15'}`}>
        
        {!isUser && thoughts && (
          <div className="mb-3">
            <button
              onClick={() => setShowThoughts(!showThoughts)}
              className="flex items-center gap-2 text-xs text-pink-600 hover:text-pink-800 transition-colors group"
            >
              {showThoughts ? (
                <IoChevronUpOutline className="w-3 h-3 transition-transform group-hover:scale-110" />
              ) : (
                <IoChevronDownOutline className="w-3 h-3 transition-transform group-hover:scale-110" />
              )}
              <span className="font-medium">AI Thoughts</span>
              <span className="text-xs opacity-75">
                ({showThoughts ? 'Hide' : 'Show'} reasoning process)
              </span>
            </button>
            
            {showThoughts && (
              <div className="mt-2 p-3 bg-pink-50/80 backdrop-blur-sm rounded-xl border-l-4 border-pink-400">
                <div className="text-xs text-pink-800 leading-relaxed">
                  <MarkdownRenderer content={thoughts} />
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-start justify-between gap-3">
          <div className={`${isUser ? 'prose-sm prose-invert' : 'prose-sm prose-gray'} max-w-none flex-1`}>
            {hasMarkdown(content) ? (
              <MarkdownRenderer content={content} />
            ) : (
              <div className={`whitespace-pre-wrap leading-relaxed ${isUser ? 'text-sm' : 'text-sm'}`}>{content}</div>
            )}
          </div>

          {!isUser && content && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  console.log('🎵 Speaker icon clicked for content:', content.substring(0, 50) + '...');
                  setShowTTSModal(true);
                }}
                className="p-2 rounded-lg bg-pink-100/80 hover:bg-pink-200/80 text-pink-600 hover:text-pink-800 transition-all duration-200 backdrop-blur-sm border border-pink-200/50 shadow-sm"
                title="Generate Speech"
                disabled={isGeneratingTTS}
              >
                {isGeneratingTTS ? (
                  <div className="w-3 h-3 border-2 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <IoVolumeHighOutline className="w-3 h-3" />
                )}
              </button>
            </div>
          )}
        </div>

        {!isUser && (audioData || generatedAudio) && !showTTSModal && !showAudioInModal && (
          <div className="mt-3">
            <AudioPlayer 
              audioData={audioData || generatedAudio!} 
            />
          </div>
        )}

        {!isUser && isGeneratingAudio && !audioData && !generatedAudio && (
          <div className="mt-3">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-50/50 to-rose-50/50 rounded-xl border border-pink-200/50 backdrop-blur-sm">
              <div className="w-6 h-6 rounded-full bg-pink-200 flex items-center justify-center">
                <div className="w-3 h-3 border-2 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <span className="text-xs text-pink-700 font-medium">Generating audio response...</span>
              <div className="flex-1"></div>
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse"></div>
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0 ml-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center shadow-md">
            <span className="text-white font-semibold text-xs">You</span>
          </div>
          <div className="text-xs text-gray-500 mt-1 text-center">Client</div>
        </div>
      )}

      {/* TTS Voice Selection Modal */}
      {showTTSModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Select Voice</h3>
              <button
                onClick={() => setShowTTSModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <IoChevronUpOutline className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {TTS_VOICES.map((voice) => (
                <div
                  key={voice.name}
                  className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedVoice === voice.name
                      ? 'bg-pink-100 border-2 border-pink-300 text-pink-800'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent text-gray-700'
                  }`}
                  onClick={() => setSelectedVoice(voice.name)}
                >
                  <div className="font-medium">{voice.name}</div>
                  <div className="text-sm opacity-75">{voice.description}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowTTSModal(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateTTS}
                disabled={isGeneratingTTS}
                className="flex-1 px-4 py-2 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 text-white rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGeneratingTTS ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  'Generate Speech'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audio Player Modal */}
      {showAudioInModal && generatedAudio && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Audio Generated</h3>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <IoChevronUpOutline className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="mb-4">
              <AudioPlayer 
                audioData={generatedAudio} 
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Keep the audio in the message and close modal
                  setShowTTSModal(false);
                  setShowAudioInModal(false);
                  // Don't clear generatedAudio so it shows in the message
                }}
                className="flex-1 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl transition-colors"
              >
                Keep in Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
