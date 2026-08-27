import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Upload, RefreshCw, Volume2, AlertCircle, Globe, Check } from 'lucide-react';
import { transcribeVoice } from '../api';

export default function VoiceRecorder({ onTranscriptChange }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechLang, setSpeechLang] = useState('hi-IN'); // Default 'hi-IN' for Hindi/Hinglish speech
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);

  // References for cumulative non-loss recording
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const isRecordingRef = useRef(false);
  const accumulatedTranscriptRef = useRef('');
  const currentSessionFinalRef = useRef('');

  // Keep isRecordingRef in sync with state
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Re-initialize Web Speech API when speechLang changes
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLang;

      recognition.onresult = (event) => {
        let sessionFinal = '';
        let interim = '';

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            sessionFinal += result[0].transcript + ' ';
          } else {
            interim += result[0].transcript;
          }
        }

        currentSessionFinalRef.current = sessionFinal;

        // Combine cumulative previous text + current session final text + current interim text
        const totalText = (
          (accumulatedTranscriptRef.current ? accumulatedTranscriptRef.current.trim() + ' ' : '') +
          (sessionFinal ? sessionFinal.trim() + ' ' : '') +
          interim.trim()
        ).trim();

        setTranscript(totalText);
        onTranscriptChange(totalText);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied. You can type your statement or upload an audio file below.');
          stopRecording();
        } else if (event.error === 'network') {
          // If network error, attempt continuous recovery
          if (isRecordingRef.current) {
            setTimeout(() => {
              if (isRecordingRef.current) startRecognitionSession();
            }, 300);
          }
        }
      };

      recognition.onend = () => {
        // Commit current session final text into persistent accumulator
        if (currentSessionFinalRef.current) {
          accumulatedTranscriptRef.current = (
            (accumulatedTranscriptRef.current ? accumulatedTranscriptRef.current.trim() + ' ' : '') +
            currentSessionFinalRef.current.trim()
          ).trim();
          currentSessionFinalRef.current = '';
        }

        // Auto-restart if user is still in recording mode (prevents dropping previous text on pauses)
        if (isRecordingRef.current) {
          try {
            recognition.start();
          } catch (e) {
            // Ignore if already started
          }
        } else {
          setIsRecording(false);
        }
      };

      recognitionRef.current = recognition;
    }
  }, [speechLang]);

  const startRecognitionSession = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
    } catch (e) {
      // Ignore if already running
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    setErrorMessage(null);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMessage('Browser Speech API not supported on this browser. Please type your statement or upload an audio recording.');
      return;
    }

    // Preserve existing transcript if user resumes recording
    if (transcript.trim()) {
      accumulatedTranscriptRef.current = transcript.trim();
    } else {
      accumulatedTranscriptRef.current = '';
    }
    currentSessionFinalRef.current = '';

    setIsRecording(true);
    isRecordingRef.current = true;
    setAudioDuration(0);

    startRecognitionSession();

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setAudioDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    isRecordingRef.current = false;

    if (timerRef.current) clearInterval(timerRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await transcribeVoice(formData);
      const newText = (transcript ? transcript.trim() + ' ' : '') + res.transcribed_text;
      setTranscript(newText);
      accumulatedTranscriptRef.current = newText;
      onTranscriptChange(newText);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to process voice file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setTranscript('');
    accumulatedTranscriptRef.current = '';
    currentSessionFinalRef.current = '';
    setAudioDuration(0);
    onTranscriptChange('');
  };

  const formatTimer = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-5 sm:p-6 transition-all space-y-4">
      {/* Top Header & Spoken Language Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">Voice Statement &amp; Speech-to-Text</h4>
            <p className="text-[11px] text-slate-500">Speak naturally in Hinglish, Hindi, or English</p>
          </div>
        </div>

        {/* Spoken Dialect / Language Mode Switcher */}
        <div className="flex items-center space-x-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-soft-sm text-xs font-bold">
          <button
            type="button"
            onClick={() => setSpeechLang('hi-IN')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1 cursor-pointer ${
              speechLang === 'hi-IN'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Speech Recognition tuned for Hinglish and Hindi"
          >
            <span>🎙️ Hinglish / Hindi</span>
            {speechLang === 'hi-IN' && <Check className="w-3 h-3 ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={() => setSpeechLang('en-IN')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1 cursor-pointer ${
              speechLang === 'en-IN'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Speech Recognition tuned for English (India)"
          >
            <span>🎙️ English</span>
            {speechLang === 'en-IN' && <Check className="w-3 h-3 ml-0.5" />}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Interactive Mic Control */}
      <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm text-center">
        <button
          type="button"
          onClick={toggleRecording}
          className={`relative p-5 rounded-full transition-all duration-300 transform active:scale-95 shadow-md flex items-center justify-center cursor-pointer ${
            isRecording
              ? 'bg-red-600 text-white pulse-recording ring-4 ring-red-100'
              : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
          }`}
        >
          {isRecording ? <MicOff className="w-8 h-8 animate-pulse" /> : <Mic className="w-8 h-8" />}
        </button>

        <div className="mt-3.5 space-y-1">
          {isRecording ? (
            <div>
              <div className="inline-flex items-center space-x-2 text-sm font-bold text-red-600">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                <span>Listening continuously ({formatTimer(audioDuration)})</span>
              </div>
              {/* Waveform Animation */}
              <div className="flex items-center justify-center space-x-1 mt-2.5 h-7">
                <span className="w-1 bg-red-500 rounded-full wave-bar-1"></span>
                <span className="w-1 bg-red-500 rounded-full wave-bar-2"></span>
                <span className="w-1 bg-red-500 rounded-full wave-bar-3"></span>
                <span className="w-1 bg-red-500 rounded-full wave-bar-4"></span>
                <span className="w-1 bg-red-500 rounded-full wave-bar-5"></span>
                <span className="w-1 bg-red-500 rounded-full wave-bar-2"></span>
                <span className="w-1 bg-red-500 rounded-full wave-bar-4"></span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Speak long statements freely. All sentences are continuously saved without losing previous lines. Tap mic when finished.
              </p>
            </div>
          ) : (
            <div>
              <span className="text-sm font-bold text-slate-800 block">🎙️ Tap microphone to speak</span>
              <span className="text-xs text-slate-500">
                Active Mode: <strong className="text-blue-700">{speechLang === 'hi-IN' ? 'Hinglish & Hindi' : 'English'}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Alternative Audio Upload */}
        <div className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-center">
          <label className="cursor-pointer text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center space-x-1.5 transition">
            <Upload className="w-3.5 h-3.5" />
            <span>Or upload an audio recording (.mp3 / .wav)</span>
            <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Speech Transcript Output Box */}
      {isProcessing ? (
        <div className="p-4 text-center text-xs text-blue-600 font-semibold bg-blue-50/60 rounded-xl border border-blue-200 animate-pulse">
          Transcribing voice payload into structured text...
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-700">Accumulated Full Transcript:</span>
            {transcript && (
              <button
                type="button"
                onClick={handleClear}
                className="text-[11px] text-slate-500 hover:text-red-600 flex items-center space-x-1 transition font-medium cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Clear Transcript</span>
              </button>
            )}
          </div>
          <textarea
            rows={4}
            value={transcript}
            onChange={(e) => {
              setTranscript(e.target.value);
              accumulatedTranscriptRef.current = e.target.value;
              onTranscriptChange(e.target.value);
            }}
            placeholder="Your spoken statement will automatically accumulate here sentence-by-sentence without losing any previous lines. You may also edit or add details manually..."
            className="w-full bg-white text-slate-900 placeholder-slate-400 text-xs sm:text-sm p-3.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition shadow-sm"
          />
        </div>
      )}
    </div>
  );
}
