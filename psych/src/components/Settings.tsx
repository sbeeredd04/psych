import React, { useState, useEffect } from 'react';
import { IoSettingsOutline, IoClose, IoKeyOutline, IoOpenOutline, IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import Cookies from 'js-cookie';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeyChange: (apiKey: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, onApiKeyChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Load API key from cookies on mount
    const savedApiKey = Cookies.get('gemini_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      onApiKeyChange(savedApiKey);
    }
  }, [onApiKeyChange]);

  const handleSave = () => {
    if (apiKey.trim()) {
      // Save to cookies for 30 days
      Cookies.set('gemini_api_key', apiKey.trim(), { expires: 30 });
      onApiKeyChange(apiKey.trim());
      onClose();
    }
  };

  const handleClear = () => {
    setApiKey('');
    Cookies.remove('gemini_api_key');
    onApiKeyChange('');
  };

  const openGoogleAIStudio = () => {
    window.open('https://aistudio.google.com/apikey', '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <IoSettingsOutline className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <IoClose className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <IoKeyOutline className="inline w-4 h-4 mr-2" />
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type={isVisible ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white/90 backdrop-blur-sm text-gray-900 placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setIsVisible(!isVisible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {isVisible ? <IoEyeOffOutline className="w-5 h-5" /> : <IoEyeOutline className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Your API key is stored locally in cookies and never sent to our servers.
            </p>
          </div>

          <div className="flex items-center gap-2 p-3 bg-gray-50/50 rounded-xl border border-gray-200/50">
            <IoOpenOutline className="w-4 h-4 text-gray-600 flex-shrink-0" />
            <span className="text-sm text-gray-700 flex-1">
              Need an API key?
            </span>
            <button
              onClick={openGoogleAIStudio}
              className="text-sm font-medium text-gray-600 hover:text-gray-700 underline"
            >
              Get one free
            </button>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleClear}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded-xl transition-colors disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
