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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentThoughts, setCurrentThoughts] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [showSettings, setShowSettings] = useState(false);
  const [chatManager, setChatManager] = useState<ChatManager | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      setMessages(session.messages);
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
          setMessages([...updatedSession.messages]);
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
          setMessages([...updatedSession.messages]);
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

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setCurrentThoughts('');
    setCurrentMessage('');

    try {
      // Get uploaded files from current session
      const sessionFiles = chatManager.getCurrentSession()?.uploadedFiles || [];
      
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
        }
      );

      // Update messages with the complete AI response
      setMessages(prev => [...prev, aiMessage]);
      setCurrentThoughts('');
      setCurrentMessage('');

    } catch (error) {
      console.error('💬 Chat error:', error);
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        content: 'Sorry, I encountered an error processing your message. Please check your API key in settings and try again.',
        isUser: false,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
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

      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm shadow-lg shadow-gray-500/10 border-b border-gray-200/30 sticky top-0 z-40 relative">
        <div className="max-w-6xl mx-auto flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg shadow-gray-500/25">
              <IoFlash className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                PsychAI Session
              </h1>
              <p className="text-sm text-gray-600">
                Confidential AI-powered mental health support
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {uploadedFiles.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100/70 backdrop-blur-sm rounded-xl border border-gray-200/30">
                <IoDocumentTextOutline className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700 font-medium">
                  {uploadedFiles.length} document{uploadedFiles.length > 1 ? 's' : ''} loaded
                </span>
              </div>
            )}
            
            <button
              onClick={() => setShowSettings(true)}
              className="p-3 rounded-xl bg-gradient-to-r from-gray-100/70 to-gray-100/70 hover:from-gray-200/70 hover:to-gray-200/70 transition-all duration-200 shadow-lg shadow-gray-500/10 hover:shadow-gray-500/20 backdrop-blur-sm border border-gray-200/30"
            >
              <IoSettingsOutline className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto flex flex-col h-[calc(100vh-100px)]">
        {/* File Upload */}
        <div className="p-6 pb-0">
          <FileUpload onFileUpload={handleFileUpload} isUploading={isUploading} />
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            {messages.map((message) => (
              <Message
                key={message.id}
                content={message.content}
                isUser={message.isUser}
                thoughts={message.thoughts}
                audioData={message.audioData}
              />
            ))}
            
            {/* Show streaming thoughts and message */}
            {(currentThoughts || currentMessage) && (
              <div className="flex justify-start">
                <div className="max-w-4xl w-full bg-white/90 backdrop-blur-sm text-gray-800 border border-gray-200/50 shadow-lg shadow-gray-500/10 rounded-2xl p-6 transition-all duration-300">
                  {currentThoughts && (
                    <div className="mb-4 p-4 bg-gray-50/80 backdrop-blur-sm rounded-xl border-l-4 border-gray-400">
                      <div className="text-sm text-gray-800 font-medium mb-2 flex items-center gap-2">
                        <IoFlash className="w-4 h-4" />
                        AI Thoughts (Live)
                      </div>
                      <div className="text-sm text-gray-700 leading-relaxed">
                        <MarkdownRenderer content={currentThoughts} />
                      </div>
                    </div>
                  )}
                  {currentMessage && (
                    <div className="prose prose-lg max-w-none prose-gray">
                      <div className="whitespace-pre-wrap leading-relaxed">{currentMessage}</div>
                    </div>
                  )}
                  {isLoading && !currentMessage && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="italic">Dr. Chen is carefully considering your message...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
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