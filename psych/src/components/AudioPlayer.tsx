import React, { useState, useRef, useEffect } from 'react';
import { IoPlayOutline, IoPauseOutline, IoVolumeHighOutline, IoDownloadOutline } from 'react-icons/io5';

interface AudioPlayerProps {
  audioData: string; // base64 encoded audio data
  isGenerating?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  audioData, 
  isGenerating = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (audioData && audioRef.current) {
      console.log('🎵 AudioPlayer: Setting up audio with data length:', audioData.length);
      
      try {
        // Clean up previous audio URL
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }

        // Convert base64 to Uint8Array
        const byteCharacters = atob(audioData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        
        // According to Gemini TTS documentation, the output is PCM audio data
        // We need to create a proper WAV file with headers
        const sampleRate = 24000; // Gemini TTS default sample rate
        const numChannels = 1; // Mono audio
        const bitsPerSample = 16;
        
        // Create WAV file header
        const wavHeader = createWavHeader(byteArray.length, sampleRate, numChannels, bitsPerSample);
        
        // Combine header and audio data
        const wavData = new Uint8Array(wavHeader.length + byteArray.length);
        wavData.set(wavHeader, 0);
        wavData.set(byteArray, wavHeader.length);
        
        // Create blob as proper WAV file
        const blob = new Blob([wavData], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        
        console.log('🎵 AudioPlayer: Created WAV audio URL with proper headers');
        
        setAudioUrl(url);
        audioRef.current.src = url;
        audioRef.current.load();
        
      } catch (error) {
        console.error('🎵 AudioPlayer: Error setting up audio:', error);
        setAudioError('Failed to process audio data');
      }
    }

    // Cleanup function
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioData]);

  // Helper function to create WAV file header
  const createWavHeader = (dataLength: number, sampleRate: number, numChannels: number, bitsPerSample: number) => {
    const bytesPerSample = bitsPerSample / 8;
    const byteRate = sampleRate * numChannels * bytesPerSample;
    const blockAlign = numChannels * bytesPerSample;
    const chunkSize = 36 + dataLength;
    
    const header = new ArrayBuffer(44);
    const view = new DataView(header);
    
    // RIFF chunk descriptor
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF'); // ChunkID
    view.setUint32(4, chunkSize, true); // ChunkSize
    writeString(8, 'WAVE'); // Format
    
    // fmt sub-chunk
    writeString(12, 'fmt '); // Subchunk1ID
    view.setUint32(16, 16, true); // Subchunk1Size
    view.setUint16(20, 1, true); // AudioFormat (PCM)
    view.setUint16(22, numChannels, true); // NumChannels
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, byteRate, true); // ByteRate
    view.setUint16(32, blockAlign, true); // BlockAlign
    view.setUint16(34, bitsPerSample, true); // BitsPerSample
    
    // data sub-chunk
    writeString(36, 'data'); // Subchunk2ID
    view.setUint32(40, dataLength, true); // Subchunk2Size
    
    return new Uint8Array(header);
  };

  const togglePlayPause = () => {
    if (audioRef.current && !audioError) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((error) => {
          console.error('🎵 AudioPlayer: Play error:', error);
          setAudioError(`Playback failed: ${error.message}`);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      console.log('🎵 AudioPlayer: Audio loaded successfully, duration:', audioRef.current.duration);
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    console.log('🎵 AudioPlayer: Audio playback ended');
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const error = e.currentTarget.error;
    console.error('🎵 AudioPlayer: Audio error:', error);
    console.error('🎵 AudioPlayer: Error code:', error?.code);
    console.error('🎵 AudioPlayer: Error message:', error?.message);
    
    let errorMessage = 'Audio playback failed';
    if (error?.code === 4) {
      errorMessage = 'Audio format not supported. Try downloading the file.';
    } else if (error?.code === 3) {
      errorMessage = 'Audio decoding failed. The audio data may be corrupted.';
    } else if (error?.code === 2) {
      errorMessage = 'Network error loading audio';
    } else if (error?.code === 1) {
      errorMessage = 'Audio loading was aborted';
    }
    
    setAudioError(errorMessage);
    setIsPlaying(false);
  };

  const handleRetry = () => {
    setAudioError(null);
    if (audioRef.current) {
      audioRef.current.load();
    }
  };

  const handleCanPlay = () => {
    console.log('🎵 AudioPlayer: Audio can play');
    setAudioError(null); // Clear any previous errors
  };

  const handleDownload = () => {
    if (audioData) {
      try {
        const byteCharacters = atob(audioData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        
        // Create proper WAV file with headers (same as in useEffect)
        const sampleRate = 24000;
        const numChannels = 1;
        const bitsPerSample = 16;
        const wavHeader = createWavHeader(byteArray.length, sampleRate, numChannels, bitsPerSample);
        
        // Combine header and audio data
        const wavData = new Uint8Array(wavHeader.length + byteArray.length);
        wavData.set(wavHeader, 0);
        wavData.set(byteArray, wavHeader.length);
        
        const blob = new Blob([wavData], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `psych-ai-audio-${Date.now()}.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('🎵 Download error:', error);
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  if (isGenerating) {
    return (
      <div className="flex items-center gap-3 p-3 bg-pink-50/50 rounded-xl border border-pink-200/50 mt-3">
        <div className="w-8 h-8 rounded-full bg-pink-200 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <span className="text-sm text-pink-700">Generating audio...</span>
      </div>
    );
  }

  if (!audioData) return null;

  if (audioError) {
    return (
      <div className="flex items-center gap-3 p-3 bg-red-50/50 rounded-xl border border-red-200/50 mt-3">
        <div className="w-8 h-8 rounded-full bg-red-200 flex items-center justify-center">
          <IoVolumeHighOutline className="w-4 h-4 text-red-600" />
        </div>
        <div className="flex-1">
          <div className="text-sm text-red-700 font-medium">Audio Error</div>
          <div className="text-xs text-red-600">{audioError}</div>
        </div>
        <button
          onClick={handleRetry}
          className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 transition-all duration-200 text-xs font-medium"
          title="Retry Loading"
        >
          Retry
        </button>
        <button
          onClick={handleDownload}
          className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 transition-all duration-200"
          title="Download Audio"
        >
          <IoDownloadOutline className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const playerContent = (
    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-50/50 to-rose-50/50 rounded-xl border border-pink-200/50 mt-3 backdrop-blur-sm">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={handleError}
        onCanPlay={handleCanPlay}
        preload="metadata"
      />
      
      <button
        onClick={togglePlayPause}
        className="w-10 h-10 rounded-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
      >
        {isPlaying ? (
          <IoPauseOutline className="w-5 h-5" />
        ) : (
          <IoPlayOutline className="w-5 h-5 ml-0.5" />
        )}
      </button>

      <div className="flex-1 flex items-center gap-3">
        <span className="text-xs text-gray-600 min-w-[35px]">
          {formatTime(currentTime)}
        </span>
        
        <div className="flex-1 relative">
          <input
            type="range"
            min="0"
            max="100"
            value={duration ? (currentTime / duration) * 100 : 0}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${duration ? (currentTime / duration) * 100 : 0}%, #e5e7eb ${duration ? (currentTime / duration) * 100 : 0}%, #e5e7eb 100%)`
            }}
          />
        </div>
        
        <span className="text-xs text-gray-600 min-w-[35px]">
          {formatTime(duration)}
        </span>
      </div>

      <IoVolumeHighOutline className="w-5 h-5 text-pink-600" />
      
      <button
        onClick={handleDownload}
        className="p-2 rounded-lg bg-pink-100/80 hover:bg-pink-200/80 text-pink-600 hover:text-pink-800 transition-all duration-200"
        title="Download Audio"
      >
        <IoDownloadOutline className="w-4 h-4" />
      </button>
    </div>
  );

  return playerContent;
};
