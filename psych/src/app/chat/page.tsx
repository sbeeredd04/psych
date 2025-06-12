'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Message } from '@/components/Message';
import { ChatInput } from '@/components/ChatInput';
import { FileUpload } from '@/components/FileUpload';
import { Settings } from '@/components/Settings';
import { ChatManager, ChatMessage } from '@/utils/chatManager';
import { MarkdownRenderer } from '@/utils/markdown';
import { IoSettingsOutline, IoDocumentTextOutline, IoFlash } from 'react-icons/io5';

interface UploadedFile {
  uri: string;
  mimeType: string;
  displayName: string;
}


export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentThoughts, setCurrentThoughts] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [showSettings, setShowSettings] = useState(false);
  const [chatManager, setChatManager] = useState<ChatManager | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper function to validate messages
  const isValidMessage = (message: any): message is ChatMessage => {
    return message && 
           typeof message === 'object' && 
           typeof message.id === 'string' && 
           typeof message.content === 'string' && 
           typeof message.isUser === 'boolean' &&
           typeof message.timestamp === 'number';
  };

  // Helper function to safely add messages
  const addMessage = (message: ChatMessage) => {
    if (isValidMessage(message)) {
      setMessages(prev => [...prev, message]);
    } else {
      console.error('💬 Attempted to add invalid message:', message);
    }
  };

  // Helper function to safely update messages
  const updateMessages = (updateFn: (prev: ChatMessage[]) => ChatMessage[]) => {
    setMessages(prev => {
      const updated = updateFn(prev);
      return updated.filter(isValidMessage);
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat manager when API key is available
  useEffect(() => {
    if (apiKey && !chatManager) {
      console.log('🔄 Initializing chat manager with API key');
      const manager = new ChatManager(apiKey);
      const session = manager.createNewSession(selectedVoice);
      setChatManager(manager);
      setMessages(session.messages.filter(isValidMessage));
    }
  }, [apiKey, chatManager, selectedVoice]);

  // Update voice in chat manager
  useEffect(() => {
    if (chatManager) {
      chatManager.updateVoice(selectedVoice);
    }
  }, [selectedVoice, chatManager]);

  const handleFileUpload = async (file: File) => {
    if (!apiKey) {
      setShowSettings(true);
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/chat', {
        method: 'PUT',
        headers: {
          'X-API-Key': apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const uploadedFile = await response.json();
      setUploadedFiles(prev => [...prev, uploadedFile]);
      
      // Add file to ChatManager session
      if (chatManager) {
        chatManager.addUploadedFile(uploadedFile);
        
        const confirmationMessage: ChatMessage = {
          id: `upload_${Date.now()}`,
          content: `Document "${uploadedFile.displayName}" has been uploaded successfully and will inform our conversation with the latest research and clinical insights.`,
          isUser: false,
          timestamp: Date.now()
        };
        
        // Update the current session with confirmation message
        const updatedSession = chatManager.getCurrentSession();
        if (updatedSession) {
          updatedSession.messages.push(confirmationMessage);
          setMessages([...updatedSession.messages.filter(isValidMessage)]);
        }
      }
    } catch (error) {
      console.error('File upload error:', error);
      
      // Add error message using ChatManager for consistency
      if (chatManager) {
        const errorMessage: ChatMessage = {
          id: `error_${Date.now()}`,
          content: 'Sorry, there was an error uploading your document. Please check your API key in settings and try again.',
          isUser: false,
          timestamp: Date.now()
        };
        
        // Update the current session with error message
        const updatedSession = chatManager.getCurrentSession();
        if (updatedSession) {
          updatedSession.messages.push(errorMessage);
          setMessages([...updatedSession.messages.filter(isValidMessage)]);
        }
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!apiKey) {
      setShowSettings(true);
      return;
    }

    if (!chatManager) {
      console.error('💬 No chat manager available');
      return;
    }

    console.log('💬 Sending message via new chat system:', content);
    
    // Add user message immediately to UI
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      content,
      isUser: true,
      timestamp: Date.now()
    };

    addMessage(userMessage);
    setIsLoading(true);
    setCurrentThoughts('');
    setCurrentMessage('');

    try {
      // Get uploaded files from current session
      const sessionFiles = chatManager.getCurrentSession()?.uploadedFiles || [];
      
      // Variable to track if audio generation was triggered
      let audioGenerationTriggered = false;
      
      // Send message through chat manager with streaming callbacks
      const aiMessage = await chatManager.sendMessage(
        content,
        sessionFiles,
        // onThought callback
        (thought: string) => {
          setCurrentThoughts(prev => prev + thought);
        },
        // onMessage callback  
        (messageChunk: string) => {
          setCurrentMessage(prev => prev + messageChunk);
        },
        // onAudioGenerationStart callback
        (aiMessage: ChatMessage) => {
          console.log('💬 Audio generation started');
          audioGenerationTriggered = true;
          setIsGeneratingAudio(true);
          setIsLoading(false); // Stop general loading, start audio loading
          setCurrentThoughts('');
          setCurrentMessage('');
          // Add the message to UI when audio generation starts
          addMessage(aiMessage);
        },
        // onAudioGenerationComplete callback
        (aiMessage: ChatMessage, audioData: string | null) => {
          console.log('💬 Audio generation complete:', !!audioData);
          setIsGeneratingAudio(false);
          // Force re-render to show the audio player
          updateMessages(prev => prev.map(msg => {
            if (!isValidMessage(msg)) {
              console.warn('💬 Found invalid message during audio update:', msg);
              return msg; // Keep as-is if invalid
            }
            return msg.id === aiMessage.id ? { ...msg, audioData: audioData || undefined } : msg;
          }));
        }
      );

      // If audio generation callbacks weren't called (no TTS), update messages normally
      if (!audioGenerationTriggered) {
        addMessage(aiMessage);
        setCurrentThoughts('');
        setCurrentMessage('');
      }

    } catch (error) {
      console.error('💬 Chat error:', error);
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        content: 'Sorry, I encountered an error processing your message. Please check your API key in settings and try again.',
        isUser: false,
        timestamp: Date.now()
      };
      addMessage(errorMessage);
      setIsGeneratingAudio(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-gray-50/30 relative overflow-hidden">
      {/* Sakura petals background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-gray-200 rounded-full opacity-40 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-gray-300 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-gray-100 rounded-full opacity-35 animate-pulse"></div>
        <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-gray-200 rounded-full opacity-40 animate-pulse"></div>
      </div>

      {/* Floating Header */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/80 backdrop-blur-md shadow-lg border border-gray-200/50 rounded-full px-4 py-2 flex items-center gap-4">
          <button
            onClick={() => window.location.href = '/'}
            className="p-2 hover:bg-gray-100/50 rounded-full transition-colors"
            title="Go Home"
          >
            <IoFlash className="w-4 h-4 text-gray-700" />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-800">Psych</span>
            {uploadedFiles.length > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-100/70 rounded-full">
                <IoDocumentTextOutline className="w-3 h-3 text-gray-600" />
                <span className="text-xs text-gray-700">{uploadedFiles.length}</span>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-gray-100/50 rounded-full transition-colors"
            title="Settings"
          >
            <IoSettingsOutline className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto flex flex-col h-screen pt-20 pb-4">
        {/* Compact File Upload */}
        <div className="px-6 pb-3">
          <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl p-3">
            {uploadedFiles.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <IoDocumentTextOutline className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-700 font-medium">
                      {uploadedFiles.length} Document{uploadedFiles.length > 1 ? 's' : ''} Loaded as Knowledge Source
                    </span>
                  </div>
                  <FileUpload onFileUpload={handleFileUpload} isUploading={isUploading} />
                </div>
                
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-2 p-2 bg-green-50/80 rounded-lg border border-green-200/50"
                    >
                      <IoDocumentTextOutline className="w-3 h-3 text-green-600 flex-shrink-0" />
                      <span className="text-xs text-green-800 font-medium truncate flex-1">
                        {file.displayName}
                      </span>
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" title="Active Source"></div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-2 text-xs text-green-600/80">
                  These documents are enhancing Dr. Chen's responses with specialized knowledge
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IoDocumentTextOutline className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-600">Upload psychology documents to enhance responses</span>
                </div>
                <FileUpload onFileUpload={handleFileUpload} isUploading={isUploading} />
              </div>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 px-6 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <Message
                key={message.id}
                content={message.content}
                isUser={message.isUser}
                thoughts={message.thoughts}
                audioData={message.audioData}
                isGeneratingAudio={isGeneratingAudio && !message.isUser && index === messages.length - 1}
              />
            ))}
            
            {/* Show streaming thoughts and message */}
            {(currentThoughts || currentMessage) && (
              <div className="flex justify-start">
                <div className="max-w-3xl w-full bg-white/90 backdrop-blur-sm text-gray-800 border border-gray-200/50 shadow-sm rounded-2xl p-4 transition-all duration-300">
                  {currentThoughts && (
                    <div className="mb-3 p-3 bg-gray-50/80 backdrop-blur-sm rounded-xl border-l-4 border-gray-400">
                      <div className="text-xs text-gray-800 font-medium mb-2 flex items-center gap-2">
                        <IoFlash className="w-3 h-3" />
                        AI Thoughts (Live)
                      </div>
                      <div className="text-xs text-gray-700 leading-relaxed">
                        <MarkdownRenderer content={currentThoughts} />
                      </div>
                    </div>
                  )}
                  {currentMessage && (
                    <div className="prose prose-sm max-w-none prose-gray">
                      <div className="whitespace-pre-wrap leading-relaxed text-sm">{currentMessage}</div>
                    </div>
                  )}
                  {isLoading && !currentMessage && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="italic text-sm">Dr. Chen is carefully considering your message...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="px-6 pt-3">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} isGeneratingAudio={isGeneratingAudio} />
        </div>
      </div>

      {/* Settings Modal */}
      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onApiKeyChange={setApiKey}
        selectedVoice={selectedVoice}
        onVoiceChange={setSelectedVoice}
      />
    </div>
  );
}