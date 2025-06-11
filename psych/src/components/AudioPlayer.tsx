import React, { useState, useRef, useEffect } from 'react';
import { IoPlayOutline, IoPauseOutline, IoVolumeHighOutline, IoCloseOutline, IoDownloadOutline } from 'react-icons/io5';

interface AudioPlayerProps {
  audioData: string; // base64 encoded audio data
  isGenerating?: boolean;
  showModal?: boolean;
  onCloseModal?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  audioData, 
  isGenerating = false, 
  showModal = false, 
  onCloseModal 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioData && audioRef.current) {
      console.log('🎵 AudioPlayer: Setting up audio with data length:', audioData.length);
      
      try {
        // Convert base64 to blob URL with proper MIME type
        const byteCharacters = atob(audioData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        
        // Detect audio format from the first few bytes
        let mimeType = 'audio/wav'; // default
        
        // Check for MP3 header (ID3 or MPEG)
        if (byteArray[0] === 0xFF && (byteArray[1] & 0xE0) === 0xE0) {
          mimeType = 'audio/mpeg';
          console.log('🎵 AudioPlayer: Detected MP3 format');
        }
        // Check for WAV header
        else if (byteArray[0] === 0x52 && byteArray[1] === 0x49 && byteArray[2] === 0x46 && byteArray[3] === 0x46) {
          mimeType = 'audio/wav';
          console.log('🎵 AudioPlayer: Detected WAV format');
        }
        // Check for OGG header
        else if (byteArray[0] === 0x4F && byteArray[1] === 0x67 && byteArray[2] === 0x67 && byteArray[3] === 0x53) {
          mimeType = 'audio/ogg';
          console.log('🎵 AudioPlayer: Detected OGG format');
        }
        // Check for WebM header
        else if (byteArray[0] === 0x1A && byteArray[1] === 0x45 && byteArray[2] === 0xDF && byteArray[3] === 0xA3) {
          mimeType = 'audio/webm';
          console.log('🎵 AudioPlayer: Detected WebM format');
        }
        // For Gemini TTS, it's likely AAC in MP4 container
        else {
          mimeType = 'audio/mp4';
          console.log('🎵 AudioPlayer: Using MP4/AAC format as fallback');
        }
        
        const blob = new Blob([byteArray], { type: mimeType });
        const audioUrl = URL.createObjectURL(blob);
        
        console.log(`🎵 AudioPlayer: Created blob with MIME type ${mimeType}, blob size:`, blob.size);
        
        audioRef.current.src = audioUrl;
        audioRef.current.load();
        
        return () => {
          URL.revokeObjectURL(audioUrl);
        };
      } catch (error) {
        console.error('🎵 AudioPlayer: Error setting up audio:', error);
      }
    }
  }, [audioData]);

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
      errorMessage = 'Audio format not supported by browser';
    } else if (error?.code === 3) {
      errorMessage = 'Audio decoding failed';
    } else if (error?.code === 2) {
      errorMessage = 'Network error loading audio';
    }
    
    setAudioError(errorMessage);
    setIsPlaying(false);
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
        const blob = new Blob([byteArray], { type: 'audio/mp4' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `psych-ai-audio-${Date.now()}.mp4`;
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

  if (showModal) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Audio Generated</h3>
            <button
              onClick={onCloseModal}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <IoCloseOutline className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          {playerContent}
        </div>
      </div>
    );
  }

  return playerContent;
};
