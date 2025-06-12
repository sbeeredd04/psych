import Link from "next/link";
import { IoFlash, IoHeartOutline, IoShieldCheckmarkOutline, IoDocumentTextOutline, IoSparklesOutline, IoMicOutline, IoCodeSlashOutline } from 'react-icons/io5';
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home - AI-Powered Mental Health Support",
  description: "Welcome to PsychAI - Your compassionate AI mental health companion. Get started with evidence-based therapeutic support, document understanding, and personalized guidance for your mental wellness journey.",
  keywords: ["AI therapy", "mental health support", "psychology AI", "therapeutic guidance", "CBT", "DBT", "mental wellness", "AI counseling"],
  openGraph: {
    title: "PsychAI - Your AI Mental Health Companion",
    description: "Get personalized mental health support through evidence-based psychological techniques with advanced AI capabilities.",
    url: "https://psychai.app",
    type: "website",
  },
  twitter: {
    title: "PsychAI - Your AI Mental Health Companion",
    description: "Get personalized mental health support through evidence-based psychological techniques with advanced AI capabilities.",
  },
  alternates: {
    canonical: "https://psychai.app",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50/80 via-white to-rose-50/60 dark:from-gray-50 dark:via-white dark:to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Sakura petals background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-pink-200 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-rose-300 rounded-full opacity-40 animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-pink-100 rounded-full opacity-50 animate-pulse"></div>
        <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-rose-200 rounded-full opacity-60 animate-pulse"></div>
      </div>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        <div className="mb-12">
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-rose-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-pink-500/25 transform hover:scale-105 transition-transform duration-300 backdrop-blur-sm border border-pink-200/50">
              <IoFlash className="text-white text-4xl" />
            </div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-pink-600 via-rose-700 to-pink-600 bg-clip-text text-transparent mb-6 tracking-tight">
            PsychAI
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Your AI-powered mental health companion. Get personalized support and guidance 
            through evidence-based psychological techniques with advanced document understanding.
          </p>
        </div>
        
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-xl shadow-pink-500/10 border border-pink-200/30 hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pink-500/25">
                <IoFlash className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                Evidence-Based
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Grounded in psychological research and therapeutic practices including CBT, DBT, and humanistic approaches
              </p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-xl shadow-rose-500/10 border border-rose-200/30 hover:shadow-2xl hover:shadow-rose-500/20 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-500/25">
                <IoHeartOutline className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                Supportive
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Compassionate and non-judgmental conversational support with real-time AI thinking transparency
              </p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-xl shadow-pink-500/10 border border-pink-200/30 hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pink-500/25">
                <IoShieldCheckmarkOutline className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                Private & Secure
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Your conversations are confidential and secure with local API key storage and document understanding
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-pink-50/80 to-rose-50/80 backdrop-blur-sm rounded-2xl p-8 border border-pink-200/30 shadow-xl shadow-pink-500/10 mb-12">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
              <IoSparklesOutline className="text-pink-500" />
              Enhanced with Advanced AI Capabilities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
              <div className="flex items-center gap-3">
                <IoDocumentTextOutline className="w-4 h-4 text-pink-500" />
                <span>Document understanding for psychology research</span>
              </div>
              <div className="flex items-center gap-3">
                <IoFlash className="w-4 h-4 text-rose-500" />
                <span>Real-time AI thinking process visualization</span>
              </div>
              <div className="flex items-center gap-3">
                <IoMicOutline className="w-4 h-4 text-pink-500" />
                <span>Text-to-speech with professional therapist voice</span>
              </div>
              <div className="flex items-center gap-3">
                <IoCodeSlashOutline className="w-4 h-4 text-rose-500" />
                <span>Markdown support for rich content rendering</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Link
            href="/chat"
            className="inline-flex items-center justify-center px-12 py-4 text-lg font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 rounded-2xl transition-all duration-300 shadow-2xl shadow-pink-500/25 hover:shadow-pink-500/40 transform hover:scale-105 backdrop-blur-sm"
          >
            Get Started
          </Link>
          
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            * This is an AI assistant and not a replacement for professional mental health care. 
            If you're experiencing mental health crisis, please contact emergency services or a mental health professional immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
