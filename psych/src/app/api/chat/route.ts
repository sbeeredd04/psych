import { GoogleGenAI, createPartFromUri } from "@google/genai";
import { NextRequest, NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// System instruction for the psychiatrist AI
const PSYCHIATRIST_SYSTEM_INSTRUCTION = `You are Dr. Sarah Chen, a licensed clinical psychologist with over 15 years of experience in cognitive behavioral therapy, mindfulness-based interventions, and trauma-informed care. 

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle TTS generation request
    if (body.action === 'generate_tts') {
      return handleTTSGeneration(body, request);
    }

    // Handle regular chat request
    return handleChatRequest(body, request);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleTTSGeneration(body: { text: string; voice: string }, request: NextRequest) {
  console.log('🎵 TTS Generation request received');
  console.log('🎵 Text length:', body.text?.length);
  console.log('🎵 Voice:', body.voice);
  
  const apiKey = request.headers.get('X-API-Key') || process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.log('🎵 Error: No API key provided');
    return NextResponse.json({ error: 'API key required' }, { status: 401 });
  }

  if (!body.text || !body.voice) {
    console.log('🎵 Error: Missing text or voice');
    return NextResponse.json({ error: 'Text and voice are required' }, { status: 400 });
  }

  try {
    console.log('🎵 Initializing Gemini AI instance');
    const aiInstance = new GoogleGenAI({ apiKey });
    
    console.log('🎵 Making TTS request to Gemini API');
    const audioResponse = await aiInstance.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ 
        role: "user",
        parts: [{ text: `Say in a warm, empathetic, and professional therapist voice: ${body.text}` }] 
      }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: body.voice },
          },
        },
      },
    });

    console.log('🎵 TTS API response received');
    const audioData = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (audioData) {
      console.log('🎵 Audio data generated successfully, length:', audioData.length);
      return NextResponse.json({ audioData });
    } else {
      console.log('🎵 No audio data in response');
      return NextResponse.json({ error: 'No audio data generated' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('🎵 TTS generation error:', error);
    return NextResponse.json({ error: 'TTS generation failed', details: error?.message || 'Unknown error' }, { status: 500 });
  }
}

async function handleChatRequest(body: any, request: NextRequest) {
  try {
    const { messages, uploadedFiles } = body;
    const apiKey = request.headers.get('X-API-Key') || process.env.GEMINI_API_KEY;

    console.log('💬 Chat request received:');
    console.log('💬 Messages count:', messages?.length || 0);
    console.log('💬 Uploaded files count:', uploadedFiles?.length || 0);
    console.log('💬 Latest message:', messages?.[messages.length - 1]?.content?.substring(0, 100) + '...');

    if (!apiKey) {
      console.log('💬 Error: No API key provided');
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Use the provided API key for this request
    const aiInstance = new GoogleGenAI({ apiKey });

    // Convert messages to Gemini format
    const geminiMessages = messages.map((msg: any, index: number) => {
      console.log(`💬 Processing message ${index + 1}: ${msg.isUser ? 'User' : 'Assistant'} - ${msg.content.substring(0, 50)}...`);
      return {
        role: msg.isUser ? 'user' : 'model',
        parts: [{ text: msg.content }]
      };
    });

    // Create content array with text and uploaded files
    const content: any[] = [];
    
    // Add the latest user message
    const latestMessage = messages[messages.length - 1];
    if (latestMessage?.isUser) {
      content.push({ text: latestMessage.content });
    }

    // Add uploaded files to the content
    if (uploadedFiles && uploadedFiles.length > 0) {
      for (const file of uploadedFiles) {
        if (file.uri && file.mimeType) {
          content.push(createPartFromUri(file.uri, file.mimeType));
        }
      }
    }

    // Prepare contents with conversation history
    const conversationContents = [];
    
    // Add conversation history (excluding the latest message if it has files)
    const hasFilesInLatest = uploadedFiles && uploadedFiles.length > 0;
    const messagesToProcess = hasFilesInLatest ? geminiMessages.slice(0, -1) : geminiMessages;
    
    console.log('💬 Processing conversation history:', messagesToProcess.length, 'messages');
    
    for (const msg of messagesToProcess) {
      conversationContents.push({
        role: msg.role,
        parts: msg.parts
      });
    }
    
    // Add current message with uploaded files if any
    if (hasFilesInLatest) {
      const currentContent = {
        role: 'user',
        parts: content.length > 0 ? content : [{ text: latestMessage?.content || "Hello" }]
      };
      conversationContents.push(currentContent);
      console.log('💬 Added latest message with files, total parts:', currentContent.parts.length);
    }

    console.log('💬 Final conversation contents length:', conversationContents.length);

    // Use Gemini 2.5 Flash with thinking enabled
    const response = await aiInstance.models.generateContentStream({
      model: "gemini-2.5-flash-preview-05-20",
      contents: conversationContents,
      config: {
        systemInstruction: PSYCHIATRIST_SYSTEM_INSTRUCTION,
        thinkingConfig: {
          includeThoughts: true,
        },
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    // After getting the text response, generate audio
    let fullResponse = '';
    let fullThoughts = '';

    // Stream the response
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log('💬 Starting streaming response...');
          
          for await (const chunk of response) {
            for (const part of chunk.candidates?.[0]?.content?.parts || []) {
              if (!part.text) continue;
              
              if (part.thought) {
                fullThoughts += part.text;
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: 'thought', content: part.text })}\n\n`)
                );
              } else {
                fullResponse += part.text;
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: 'message', content: part.text })}\n\n`)
                );
              }
            }
          }
          
          console.log('💬 Streaming complete. Response length:', fullResponse.length);
          console.log('💬 Thoughts length:', fullThoughts.length);
          
          // Generate audio for the complete response
          let audioData = null;
          try {
            console.log('💬 Starting TTS generation for response...');
            const audioResponse = await aiInstance.models.generateContent({
              model: "gemini-2.5-flash-preview-tts",
              contents: [{ 
                role: "user",
                parts: [{ text: `Say in a warm, empathetic, and professional therapist voice: ${fullResponse}` }] 
              }],
              config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                  },
                },
              },
            });

            audioData = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            console.log('💬 TTS generation result:', !!audioData, audioData ? `length: ${audioData.length}` : 'no data');
          } catch (audioError) {
            console.error('💬 Audio generation error:', audioError);
            // Continue without audio if TTS fails
          }
          
          // Send final message with complete thoughts and audio
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'complete', 
              thoughts: fullThoughts,
              message: fullResponse,
              audioData: audioData
            })}\n\n`)
          );
          
          console.log('💬 Sent complete message with audio:', !!audioData);
          controller.close();
        } catch (error) {
          console.error('💬 Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const apiKey = request.headers.get('X-API-Key') || process.env.GEMINI_API_KEY;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are supported' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Use the provided API key for this request
    const aiInstance = new GoogleGenAI({ apiKey });

    // Upload file to Gemini File API
    const fileBlob = new Blob([await file.arrayBuffer()], { type: 'application/pdf' });
    
    const uploadedFile = await aiInstance.files.upload({
      file: fileBlob,
      config: {
        displayName: file.name,
      },
    });

    // Wait for file processing
    let getFile = await aiInstance.files.get({ name: uploadedFile.name! });
    let attempts = 0;
    while (getFile.state === 'PROCESSING' && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      getFile = await aiInstance.files.get({ name: uploadedFile.name! });
      attempts++;
    }

    if (getFile.state === 'FAILED') {
      return NextResponse.json(
        { error: 'File processing failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      uri: uploadedFile.uri,
      mimeType: uploadedFile.mimeType || 'application/pdf',
      displayName: uploadedFile.displayName || file.name,
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}