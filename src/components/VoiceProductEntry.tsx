import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Languages,
  RotateCcw,
  Edit3,
  HelpCircle,
  ArrowRight,
  Info,
  Layers,
  Tag,
  Clock,
  MapPin,
  Flame,
  Check,
  ChevronDown
} from 'lucide-react';
import { Language } from '../types';
import {
  ExtractedProductDetails,
  extractProductDetailsWithAI,
  extractProductDetailsLocally
} from '../utils/transcriptExtractor';

// Web Speech API interface declarations
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceProductEntryProps {
  language: Language;
  onDetailsExtracted: (details: ExtractedProductDetails) => void;
  onCostFieldsExtracted?: (costs: {
    rawMaterialCost?: number;
    labourHours?: number;
    labourRate?: number;
    packagingCost?: number;
    transportCost?: number;
    otherCosts?: number;
    targetPrice?: number;
  }) => void;
  className?: string;
  initialTranscript?: string;
}

export function VoiceProductEntry({
  language,
  onDetailsExtracted,
  onCostFieldsExtracted,
  className = '',
  initialTranscript = '',
}: VoiceProductEntryProps) {
  const [selectedLang, setSelectedLang] = useState<'en' | 'hi'>(language === 'hi' ? 'hi' : 'en');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState(initialTranscript);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAiPowered, setIsAiPowered] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSupported, setIsSupported] = useState(true);
  const [lastExtracted, setLastExtracted] = useState<ExtractedProductDetails | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualText, setManualText] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);

  const recognitionRef = useRef<any>(null);
  const audioIntervalRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);

  // Check Web Speech API support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setShowManualInput(true);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  // Animated mic wave effect
  useEffect(() => {
    if (isListening) {
      audioIntervalRef.current = setInterval(() => {
        setAudioLevel(Math.floor(Math.random() * 60) + 40);
      }, 150);
    } else {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      setAudioLevel(0);
    }
  }, [isListening]);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setShowManualInput(true);
      return;
    }

    setErrorMessage('');
    setLastExtracted(null);
    setInterimTranscript('');

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLang === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage('');
      };

      recognition.onresult = (event: any) => {
        let finalStr = '';
        let interimStr = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalStr += trans + ' ';
          } else {
            interimStr += trans;
          }
        }

        if (finalStr) {
          setTranscript((prev) => (prev ? prev.trim() + ' ' + finalStr.trim() : finalStr.trim()));
        }
        setInterimTranscript(interimStr);

        // Reset silence auto-stop timer
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (isListening) {
            stopListening();
          }
        }, 5000); // 5 seconds of silence
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setErrorMessage('Microphone access was denied. Please allow microphone permissions in your browser, or type in the box below.');
          setIsListening(false);
          setShowManualInput(true);
        } else if (event.error === 'no-speech') {
          // just no speech detected yet
        } else {
          setErrorMessage(`Speech detection notice: ${event.error}. You can continue speaking or type directly.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setErrorMessage('Could not initialize microphone. You can type your product description below.');
      setIsListening(false);
      setShowManualInput(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Process current transcript with AI + local fallback
  const handleProcessTranscript = async (textToProcess?: string) => {
    const text = (textToProcess !== undefined ? textToProcess : transcript).trim();
    if (!text) {
      setErrorMessage('Please speak or type something about your product first.');
      return;
    }

    if (isListening) {
      stopListening();
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const { details, isAiPowered: aiFlag } = await extractProductDetailsWithAI(text, selectedLang);
      setIsAiPowered(aiFlag);
      setLastExtracted(details);

      // Notify parent form
      onDetailsExtracted(details);

      // Pass cost fields to smart pricing assistant
      if (onCostFieldsExtracted) {
        onCostFieldsExtracted({
          rawMaterialCost: details.rawMaterialCost ?? undefined,
          labourHours: details.labourHours ?? undefined,
          labourRate: details.labourRate ?? undefined,
          packagingCost: details.packagingCost ?? undefined,
          transportCost: details.transportCost ?? undefined,
          otherCosts: details.otherCosts ?? undefined,
          targetPrice: details.price ?? undefined,
        });
      }
    } catch (err: any) {
      console.error('Extraction error:', err);
      // Even if network fails, local extraction guarantees success
      const local = extractProductDetailsLocally(text, selectedLang);
      setLastExtracted(local);
      setIsAiPowered(false);
      onDetailsExtracted(local);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`bg-gradient-to-br from-[#FFFBF5] to-[#FAF3E7] rounded-3xl border border-amber-900/15 p-4 sm:p-6 shadow-md relative overflow-hidden ${className}`}>
      {/* Decorative craft watermark accent */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/5 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#963E20] text-white flex items-center justify-center shadow-sm">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-stone-900 text-base sm:text-lg tracking-tight">
                Describe Product by Voice
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-[#963E20] text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI Voice Studio
              </span>
            </div>
            <p className="text-xs text-stone-600">
              Speak naturally about your craft, materials, making time, and costs.
            </p>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-1 bg-white/90 p-1 rounded-2xl border border-amber-900/10 shadow-xs">
          <button
            type="button"
            onClick={() => setSelectedLang('en')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedLang === 'en'
                ? 'bg-[#963E20] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setSelectedLang('hi')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedLang === 'hi'
                ? 'bg-[#963E20] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            हिन्दी (Hindi)
          </button>
        </div>
      </div>

      {/* Main Voice Interactive Section */}
      <div className="space-y-4 relative z-10">
        {/* Big Animated Mic & Controls */}
        <div className="bg-white rounded-3xl p-5 border border-amber-900/10 shadow-xs text-center space-y-4">
          <div className="flex flex-col items-center justify-center">
            {/* Pulsing Mic Circle */}
            <div className="relative flex items-center justify-center my-2">
              {isListening && (
                <>
                  <div
                    className="absolute w-24 h-24 rounded-full bg-red-500/20 animate-ping"
                    style={{ animationDuration: '1.4s' }}
                  />
                  <div
                    className="absolute w-28 h-28 rounded-full bg-amber-500/15 animate-pulse"
                    style={{ animationDuration: '2s' }}
                  />
                </>
              )}

              <button
                type="button"
                onClick={toggleListening}
                disabled={isProcessing}
                className={`relative z-10 w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-lg transition-all transform active:scale-95 cursor-pointer ${
                  isListening
                    ? 'bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-300 scale-105'
                    : isProcessing
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-[#963E20] hover:bg-[#80341A] text-white hover:scale-105'
                }`}
              >
                {isProcessing ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : isListening ? (
                  <>
                    <MicOff className="w-7 h-7" />
                    <span className="text-[10px] font-extrabold uppercase mt-0.5">Stop</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-7 h-7" />
                    <span className="text-[10px] font-extrabold uppercase mt-0.5">Tap to Speak</span>
                  </>
                )}
              </button>
            </div>

            {/* Status Text & Audio Wave Indicator */}
            <div className="mt-2 space-y-1">
              <div className="text-sm font-bold text-stone-900 flex items-center justify-center gap-2">
                {isListening ? (
                  <span className="text-red-600 flex items-center gap-1.5 animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
                    Listening... Speak about your product
                  </span>
                ) : isProcessing ? (
                  <span className="text-[#963E20] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 animate-spin text-[#963E20]" />
                    Analyzing speech & extracting details...
                  </span>
                ) : transcript ? (
                  <span className="text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Speech recorded. Click Extract to apply
                  </span>
                ) : (
                  <span className="text-stone-700">
                    Click the mic button to start recording
                  </span>
                )}
              </div>

              {isListening && (
                <div className="flex items-center justify-center gap-1 py-1">
                  {[24, 38, 55, 75, 45, 60, 30, 70, 40, 20].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-[#963E20] rounded-full transition-all duration-150"
                      style={{
                        height: `${Math.max(6, (h * (audioLevel || 30)) / 70)}px`,
                        opacity: isListening ? 0.85 : 0.2,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Live Transcript Display Box */}
          <div className="text-left bg-[#FAF7F2] rounded-2xl p-3.5 border border-amber-900/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-stone-700">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-[#963E20]" />
                Live Speech Transcript
              </span>
              {transcript && (
                <button
                  type="button"
                  onClick={() => {
                    setTranscript('');
                    setInterimTranscript('');
                    setManualText('');
                    setLastExtracted(null);
                  }}
                  className="text-[11px] text-stone-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>

            <div className="min-h-[64px] max-h-36 overflow-y-auto text-xs sm:text-sm text-stone-800 leading-relaxed font-medium bg-white rounded-xl p-3 border border-stone-200 shadow-inner">
              {transcript || interimTranscript ? (
                <>
                  <span>{transcript}</span>
                  {interimTranscript && (
                    <span className="text-stone-400 italic"> {interimTranscript}</span>
                  )}
                </>
              ) : (
                <span className="text-stone-400 italic">
                  "{selectedLang === 'hi'
                    ? 'उदाहरण: यह एक हाथ से बना सागवान लकड़ी का हाथी है। मुझे इसे बनाने में 8 घंटे लगे। सामग्री का खर्च 500 रुपये और मजदूरी 100 रुपये घंटा है।'
                    : 'Example: This is a handmade wooden elephant made of teak wood. It took me 8 hours to make. The wood cost 500 rupees and my labour rate is 100 rupees per hour.'}"
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              type="button"
              disabled={(!transcript && !interimTranscript) || isProcessing}
              onClick={() => handleProcessTranscript()}
              className={`py-3 px-6 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                transcript || interimTranscript
                  ? 'bg-[#963E20] hover:bg-[#80341A] text-white'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting Details...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Extract & Auto-Fill Form</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowManualInput(!showManualInput)}
              className="py-3 px-4 rounded-2xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-stone-500" />
              <span>{showManualInput ? 'Hide Text Box' : 'Type / Edit Text'}</span>
            </button>
          </div>
        </div>

        {/* Error / Permission Banner */}
        {errorMessage && (
          <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-900 font-semibold flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Manual Text Fallback Area (When Speech API is unsupported or user prefers typing) */}
        {showManualInput && (
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-[#963E20]" />
                Type or Paste Product Story & Costs
              </label>
              <span className="text-[10px] text-stone-500">Supports Hindi, English, Hinglish</span>
            </div>

            {!isSupported && (
              <div className="p-2.5 bg-stone-100 rounded-xl text-[11px] text-stone-600 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span>Voice input is not supported in this browser. You can type your product details below.</span>
              </div>
            )}

            <textarea
              rows={3}
              value={manualText || transcript}
              placeholder="Describe your craft piece, materials used, labour hours, material cost in rupees, and making technique..."
              onChange={(e) => {
                setManualText(e.target.value);
                setTranscript(e.target.value);
              }}
              className="w-full p-3 bg-[#FAF7F2] border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-800 focus:outline-none focus:border-[#963E20] leading-relaxed resize-none"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => handleProcessTranscript(manualText || transcript)}
                disabled={!(manualText || transcript).trim() || isProcessing}
                className="py-2.5 px-4 rounded-xl bg-[#963E20] hover:bg-[#80341A] text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:bg-stone-300 disabled:text-stone-500 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Process Typed Text</span>
              </button>
            </div>
          </div>
        )}

        {/* Success / Extraction Review Notification */}
        {lastExtracted && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 space-y-3 shadow-xs animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-emerald-900">
                  ✨ AI extracted these details. Please review and edit before publishing.
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-800 text-[10px] font-bold">
                {isAiPowered ? 'Gemini AI Verified' : 'Smart Local NLP Engine'}
              </span>
            </div>

            {/* Extracted Facts Pills Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              {lastExtracted.productName && (
                <div className="bg-white p-2 rounded-xl border border-emerald-200/70">
                  <span className="text-stone-500 block text-[10px]">Product Name:</span>
                  <span className="font-bold text-stone-900 truncate block">{lastExtracted.productName}</span>
                </div>
              )}
              {lastExtracted.category && (
                <div className="bg-white p-2 rounded-xl border border-emerald-200/70">
                  <span className="text-stone-500 block text-[10px]">Category:</span>
                  <span className="font-bold text-stone-900 truncate block">{lastExtracted.category}</span>
                </div>
              )}
              {lastExtracted.material && (
                <div className="bg-white p-2 rounded-xl border border-emerald-200/70">
                  <span className="text-stone-500 block text-[10px]">Material:</span>
                  <span className="font-bold text-stone-900 truncate block">{lastExtracted.material}</span>
                </div>
              )}
              {lastExtracted.rawMaterialCost !== null && (
                <div className="bg-white p-2 rounded-xl border border-emerald-200/70">
                  <span className="text-stone-500 block text-[10px]">Material Cost:</span>
                  <span className="font-bold text-[#963E20]">₹{lastExtracted.rawMaterialCost}</span>
                </div>
              )}
              {lastExtracted.labourHours !== null && (
                <div className="bg-white p-2 rounded-xl border border-emerald-200/70">
                  <span className="text-stone-500 block text-[10px]">Labour Time:</span>
                  <span className="font-bold text-stone-900">{lastExtracted.labourHours} hrs</span>
                </div>
              )}
              {lastExtracted.labourRate !== null && (
                <div className="bg-white p-2 rounded-xl border border-emerald-200/70">
                  <span className="text-stone-500 block text-[10px]">Labour Rate:</span>
                  <span className="font-bold text-stone-900">₹{lastExtracted.labourRate}/hr</span>
                </div>
              )}
              {lastExtracted.packagingCost !== null && (
                <div className="bg-white p-2 rounded-xl border border-emerald-200/70">
                  <span className="text-stone-500 block text-[10px]">Packaging Cost:</span>
                  <span className="font-bold text-stone-900">₹{lastExtracted.packagingCost}</span>
                </div>
              )}
              {lastExtracted.craftTechnique && (
                <div className="bg-white p-2 rounded-xl border border-emerald-200/70 col-span-2">
                  <span className="text-stone-500 block text-[10px]">Craft Technique:</span>
                  <span className="font-bold text-stone-900 truncate block">{lastExtracted.craftTechnique}</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-emerald-800 leading-snug">
              ✓ Product title, category, description, and production cost fields have been filled in the form below. You can freely edit any value at any time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
