import React, { useState, useEffect } from 'react';
import { MarkdownRenderer, hasMarkdown } from '@/utils/markdown';
import { AudioPlayer } from './AudioPlayer';
import { IoChevronDownOutline, IoChevronUpOutline, IoVolumeHighOutline } from 'react-icons/io5';

interface MessageProps {
  content: string;
  isUser: boolean;
  thoughts?: string;
  audioData?: string;
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

export const Message: React.FC<MessageProps> = ({ content, isUser, thoughts, audioData }) => {
  const [showThoughts, setShowThoughts] = useState(false);
  const [showTTSModal, setShowTTSModal] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [showAudioModal, setShowAudioModal] = useState(false);

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
        setShowAudioModal(true);
      } else {
        const errorData = await response.json();
        console.error('🎵 TTS generation failed:', errorData);
      }
    } catch (error) {
      console.error('🎵 TTS generation error:', error);
    } finally {
      setIsGeneratingTTS(false);
      setShowTTSModal(false);
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`max-w-4xl w-full ${
        isUser 
          ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/25' 
          : 'bg-white/90 backdrop-blur-sm text-gray-900 border border-pink-200/30 shadow-lg shadow-pink-500/10'
      } rounded-2xl p-6 transition-all duration-300 hover:shadow-xl ${isUser ? 'hover:shadow-pink-500/30' : 'hover:shadow-pink-500/15'}`}>
        
        {!isUser && thoughts && (
          <div className="mb-4">
            <button
              onClick={() => setShowThoughts(!showThoughts)}
              className="flex items-center gap-2 text-sm text-pink-600 hover:text-pink-800 transition-colors group"
            >
              {showThoughts ? (
                <IoChevronUpOutline className="w-4 h-4 transition-transform group-hover:scale-110" />
              ) : (
                <IoChevronDownOutline className="w-4 h-4 transition-transform group-hover:scale-110" />
              )}
              <span className="font-medium">AI Thoughts</span>
              <span className="text-xs opacity-75">
                ({showThoughts ? 'Hide' : 'Show'} reasoning process)
              </span>
            </button>
            
            {showThoughts && (
              <div className="mt-3 p-4 bg-pink-50/80 backdrop-blur-sm rounded-xl border-l-4 border-pink-400">
                <div className="text-sm text-pink-800 leading-relaxed">
                  {hasMarkdown(thoughts) ? (
                    <MarkdownRenderer content={thoughts} />
                  ) : (
                    <pre className="whitespace-pre-wrap font-mono text-xs">{thoughts}</pre>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-start justify-between gap-3">
          <div className={`prose prose-lg max-w-none flex-1 ${isUser ? 'prose-invert' : 'prose-gray'}`}>
            {hasMarkdown(content) ? (
              <MarkdownRenderer content={content} />
            ) : (
              <div className="whitespace-pre-wrap leading-relaxed">{content}</div>
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
                  <div className="w-4 h-4 border-2 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <IoVolumeHighOutline className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </div>

        {!isUser && (audioData || generatedAudio) && (
          <AudioPlayer 
            audioData={audioData || generatedAudio!} 
            showModal={showAudioModal && !audioData}
            onCloseModal={() => setShowAudioModal(false)}
          />
        )}
      </div>

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
    </div>
  );
};
