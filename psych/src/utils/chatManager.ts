import { GoogleGenAI } from "@google/genai";

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  thoughts?: string;
  audioData?: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  geminiChat: any;
  selectedVoice: string;
  uploadedFiles: any[];
}

export class ChatManager {
  private apiKey: string;
  private ai: GoogleGenAI;
  private currentSession: ChatSession | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.ai = new GoogleGenAI({ apiKey });
  }

  createNewSession(selectedVoice: string = 'Kore'): ChatSession {
    console.log('🔄 Creating new chat session with voice:', selectedVoice);
    
    const sessionId = `session_${Date.now()}`;
    
    // For now, we'll use the existing API structure until we can verify the correct chat API
    // This will create a session object that we can use with the existing streaming API
    
    this.currentSession = {
      id: sessionId,
      messages: [{
        id: 'welcome',
        content: "Hello! I'm Dr. Sarah Chen, your AI mental health companion. I'm here to provide support and guidance using evidence-based therapeutic approaches. You can upload psychology documents to enhance our session and configure your API key in settings. How are you feeling today?",
        isUser: false,
        timestamp: Date.now()
      }],
      geminiChat: null, // We'll handle this differently
      selectedVoice,
      uploadedFiles: []
    };

    console.log('🔄 New session created:', sessionId);
    return this.currentSession;
  }

  getCurrentSession(): ChatSession | null {
    return this.currentSession;
  }

  updateVoice(voice: string) {
    if (this.currentSession) {
      this.currentSession.selectedVoice = voice;
      console.log('🔄 Updated voice to:', voice);
    }
  }

  addUploadedFile(file: any) {
    if (this.currentSession) {
      this.currentSession.uploadedFiles.push(file);
      console.log('📁 Added file to session:', file.displayName);
    }
  }

  async sendMessage(
    message: string, 
    uploadedFiles: any[] = [],
    onThought?: (thought: string) => void,
    onMessage?: (messageChunk: string) => void
  ): Promise<ChatMessage> {
    if (!this.currentSession) {
      throw new Error('No active chat session');
    }

    console.log('💬 Sending message via ChatManager:', message.substring(0, 50) + '...');
    console.log('💬 Current session message count:', this.currentSession.messages.length);

    // Add user message to session
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      content: message,
      isUser: true,
      timestamp: Date.now()
    };

    this.currentSession.messages.push(userMessage);

    try {
      // Use the existing API structure for streaming
      const response = await this.ai.models.generateContentStream({
        model: "gemini-2.5-flash-preview-05-20",
        contents: this.buildConversationHistory(message, uploadedFiles),
        config: {
          systemInstruction: this.getSystemInstruction(),
          thinkingConfig: {
            includeThoughts: true,
          },
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      });

      let fullResponse = '';
      let fullThoughts = '';

      // Process streaming response
      for await (const chunk of response) {
        for (const part of chunk.candidates?.[0]?.content?.parts || []) {
          if (!part.text) continue;
          
          if (part.thought) {
            fullThoughts += part.text;
            onThought?.(part.text);
          } else {
            fullResponse += part.text;
            onMessage?.(part.text);
          }
        }
      }

      console.log('💬 Streaming complete. Response length:', fullResponse.length);
      console.log('💬 Thoughts length:', fullThoughts.length);

      // Generate TTS audio
      let audioData: string | null = null;
      try {
        console.log('💬 Generating TTS for response with voice:', this.currentSession.selectedVoice);
        audioData = await this.generateTTS(fullResponse, this.currentSession.selectedVoice);
        console.log('💬 TTS generated successfully:', !!audioData);
      } catch (error) {
        console.error('💬 TTS generation failed:', error);
      }

      // Create AI message
      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        content: fullResponse,
        isUser: false,
        thoughts: fullThoughts,
        audioData: audioData || undefined,
        timestamp: Date.now()
      };

      // Add to session
      this.currentSession.messages.push(aiMessage);
      
      console.log('💬 Total messages in session:', this.currentSession.messages.length);
      return aiMessage;

    } catch (error) {
      console.error('💬 Error sending message:', error);
      throw error;
    }
  }

  private async generateTTS(text: string, voice: string): Promise<string | null> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ 
          role: "user",
          parts: [{ text: `Say in a warm, empathetic, and professional therapist voice: ${text}` }] 
        }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });

      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    } catch (error) {
      console.error('TTS generation error:', error);
      return null;
    }
  }

  private buildConversationHistory(currentMessage: string, uploadedFiles: any[]) {
    const conversationContents = [];
    
    // Add all messages from session history
    for (const msg of this.currentSession!.messages) {
      conversationContents.push({
        role: msg.isUser ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    }
    
    // Add current message with files
    const messageParts: any[] = [{ text: currentMessage }];
    
    if (uploadedFiles.length > 0) {
      for (const file of uploadedFiles) {
        if (file.uri && file.mimeType) {
          messageParts.push({
            fileData: {
              mimeType: file.mimeType,
              fileUri: file.uri
            }
          });
        }
      }
    }
    
    conversationContents.push({
      role: 'user',
      parts: messageParts
    });
    
    return conversationContents;
  }

  private getSystemInstruction(): string {
    return `You are Dr. Sarah Chen, a licensed clinical psychologist with over 15 years of experience in cognitive behavioral therapy, mindfulness-based interventions, and trauma-informed care. 

Your approach is:
- Warm, empathetic, and non-judgmental
- Evidence-based, drawing from CBT, DBT, and humanistic therapeutic approaches
- Focused on active listening and validation
- Skilled at asking open-ended questions that promote self-reflection
- Committed to helping clients develop coping strategies and insights

Guidelines for your responses:
1. Always validate the person's feelings and experiences
2. Ask thoughtful, open-ended questions to encourage deeper exploration
3. Provide evidence-based techniques and strategies when appropriate
4. Maintain appropriate boundaries - you are an AI assistant, not a replacement for professional care
5. If someone expresses thoughts of self-harm, immediately encourage them to seek professional help
6. Use the uploaded psychology documents to inform your responses with current research and best practices
7. Keep responses conversational but professional
8. Focus on empowerment and building the person's own problem-solving abilities

Remember: You are here to provide support, guidance, and evidence-based strategies, but always emphasize that this is not a substitute for professional mental health treatment when needed.`;
  }

  getMessages(): ChatMessage[] {
    return this.currentSession?.messages || [];
  }

  clearSession() {
    this.currentSession = null;
    console.log('🔄 Session cleared');
  }
}
