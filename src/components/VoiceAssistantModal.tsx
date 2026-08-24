import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  X,
  ArrowRight,
  TrendingUp,
  Tag,
  Store,
  CheckCircle2
} from 'lucide-react';
import { Language } from '../types';

interface VoiceAssistantModalProps {
  language: Language;
  onClose: () => void;
  onNavigateToAddProduct: () => void;
  onNavigateToOrders: () => void;
}

export function VoiceAssistantModal({
  language,
  onClose,
  onNavigateToAddProduct,
  onNavigateToOrders,
}: VoiceAssistantModalProps) {
  const [isListening, setIsListening] = useState(true);
  const [transcript, setTranscript] = useState('“मेरे नए हाथ से बने सिल्क कुर्ते की लिस्टिंग बनाओ...”');
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsListening(false);
      setTranscript('“Add my new Handcrafted Block Printed Cotton Dupatta at ₹1,499”');
      setAiResponse(
        language === 'hi'
          ? 'नमस्ते! मैंने आपके ब्लॉक प्रिंटेड कॉटन दुपट्टे की फोटो, विवरण व ₹1,499 का मूल्य तैयार कर दिया है। क्या आप फोटो स्टूडियो में लिस्टिंग खोलना चाहते हैं?'
          : 'Namaste! I have prepared your Handcrafted Cotton Dupatta listing with AI photo enhancements and suggested price ₹1,499. Ready to review and publish?'
      );
    }, 2200);

    return () => clearTimeout(timer);
  }, [language]);

  const quickPrompts = [
    'Add new handloom product',
    'What is market price for wooden bowl?',
    'Check new orders status',
    'How do direct payouts work?',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-center items-center p-4">
      <div className="bg-[#FAF7F2] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-amber-900/10 space-y-5 animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#963E20] text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Ask KarigarSetu</h3>
              <p className="text-[11px] text-stone-500">AI Voice Artisan Companion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pulse Mic Center */}
        <div className="text-center py-4 space-y-3">
          <div className="relative inline-flex items-center justify-center">
            {isListening && (
              <>
                <div className="absolute w-24 h-24 rounded-full bg-[#963E20]/20 animate-ping" />
                <div className="absolute w-20 h-20 rounded-full bg-[#963E20]/40 animate-pulse" />
              </>
            )}
            <button
              type="button"
              onClick={() => setIsListening(!isListening)}
              className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${
                isListening ? 'bg-[#963E20]' : 'bg-stone-700'
              }`}
            >
              {isListening ? <Mic className="w-7 h-7 animate-bounce" /> : <MicOff className="w-7 h-7" />}
            </button>
          </div>

          <p className="text-xs font-semibold text-stone-600">
            {isListening ? 'Listening in Hindi & English...' : 'Tap to speak again'}
          </p>
        </div>

        {/* Spoken Query Box */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-2">
          <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">You Said:</div>
          <p className="text-sm font-semibold text-stone-800 italic">
            "{transcript}"
          </p>
        </div>

        {/* AI Answer */}
        {aiResponse && (
          <div className="bg-[#FAF3E7] rounded-2xl p-4 border border-amber-900/10 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#963E20]">
              <Sparkles className="w-4 h-4" />
              <span>Karigar AI Assistant</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
              {aiResponse}
            </p>

            <div className="pt-1 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToAddProduct();
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#963E20] hover:bg-[#80341A] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Open Listing Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Quick Suggestions */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-stone-500">Suggested commands:</span>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  setTranscript(`“${q}”`);
                  setIsListening(false);
                  setAiResponse(`Opening ${q} assistant flow...`);
                }}
                className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-medium"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
