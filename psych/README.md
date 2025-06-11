# PsychAI - AI-Powered Mental Health Companion

A Next.js application that provides AI-powered mental health support using Google's Gemini AI with document understanding capabilities.

## Features

- 🧠 **Evidence-Based Support**: Grounded in psychological research and therapeutic practices
- 🤝 **Supportive Conversations**: Compassionate and non-judgmental AI companion
- 📄 **Document Understanding**: Upload psychology documents to enhance sessions
- 🔒 **Private & Secure**: Confidential conversations with AI thinking transparency
- 💭 **AI Thinking Process**: View the AI's reasoning process in real-time

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd psych/psych
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your Gemini API key to `.env.local`:
```
GEMINI_API_KEY=your_actual_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Landing Page**: Visit the home page and click "Get Started"
2. **Upload Documents**: Upload psychology PDFs to enhance the AI's knowledge
3. **Chat Interface**: Have conversations with Dr. Sarah Chen, your AI therapist
4. **View AI Thoughts**: Expand the "AI Thoughts" section to see the reasoning process

## Technical Details

- **Framework**: Next.js 15 with TypeScript
- **AI Model**: Gemini 2.5 Flash with thinking capabilities enabled
- **Styling**: Tailwind CSS
- **Features**: 
  - Server-sent events for real-time streaming
  - File upload with Gemini File API
  - Document understanding for PDFs
  - Responsive design with dark mode support

## Architecture

- `src/app/page.tsx` - Landing page
- `src/app/chat/page.tsx` - Main chat interface
- `src/app/api/chat/route.ts` - API endpoints for chat and file upload
- `src/components/` - Reusable UI components

## Disclaimer

This is an AI assistant and not a replacement for professional mental health care. If you're experiencing mental health issues, please consult with a qualified healthcare professional.

## License

MIT License
