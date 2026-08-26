import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Upload, RefreshCw, Volume2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { transcribeVoice } from '../api';

export default function VoiceRecorder({ onTranscriptChange }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // English (India) + Hinglish

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        onTranscriptChange(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied. You can type your statement or upload an audio file below.');
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    setErrorMessage(null);
    if (!recognitionRef.current) {
      setErrorMessage('Browser Speech API not supported on this browser. Please type your statement or upload an audio recording.');
      return;
    }

    try {
      recognitionRef.current.start();
      setIsRecording(true);
      setAudioDuration(0);

      timerRef.current = setInterval(() => {
        setAudioDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error(err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
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
      setTranscript(res.transcribed_text);
      onTranscriptChange(res.transcribed_text);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to process voice file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setTranscript('');
    setAudioDuration(0);
    onTranscriptChange('');
  };

  const formatTimer = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-5 sm:p-6 transition-all">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">Voice Statement &amp; Speech-to-Text</h4>
            <p className="text-[11px] text-slate-500">Speak naturally in Hindi, English, or regional languages</p>
          </div>
        </div>
        <span className="text-[11px] bg-slate-200 text-slate-700 font-medium px-2.5 py-0.5 rounded-full">
          Live Audio Analysis Active
        </span>
      </div>

      {errorMessage && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Interactive Mic Control */}
      <div className="my-5 flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm text-center">
        <button
          type="button"
          onClick={toggleRecording}
          className={`relative p-5 rounded-full transition-all duration-300 transform active:scale-95 shadow-md flex items-center justify-center ${
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
                <span>Listening... ({formatTimer(audioDuration)})</span>
              </div>
              {/* Waveform Bars */}
              <div className="flex items-center justify-center space-x-1 mt-2.5 h-7">
                <span className="w-1 bg-red-500 rounded-full wave-bar-1"></span>
                <span className="w-1 bg-red-500 rounded-full wave-bar-2"></span>
                <span className="w-1 bg-red-500 rounded-full wave-bar-3"></span>
                <span className="w-1 bg-red-500 rounded-full wave-bar-4"></span>
                <span className="w-1 bg-red-500 rounded-full wave-bar-5"></span>
                <span className="w-1 bg-red-500 rounded-full wave-bar-2"></span>
                <span className="w-1 bg-red-500 rounded-full wave-bar-4"></span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Click the red microphone button when you have finished speaking.</p>
            </div>
          ) : (
            <div>
              <span className="text-sm font-bold text-slate-800 block">🎙️ Speak your concern</span>
              <span className="text-xs text-slate-500">Tap to start recording your confidential voice report</span>
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
            <span className="text-xs font-bold text-slate-700">Generated Voice Transcript:</span>
            {transcript && (
              <button
                type="button"
                onClick={handleClear}
                className="text-[11px] text-slate-500 hover:text-red-600 flex items-center space-x-1 transition font-medium"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Clear Transcript</span>
              </button>
            )}
          </div>
          <textarea
            rows={3}
            value={transcript}
            onChange={(e) => {
              setTranscript(e.target.value);
              onTranscriptChange(e.target.value);
            }}
            placeholder="Your voice input transcript will automatically populate here. You may also edit or add further details manually..."
            className="w-full bg-white text-slate-900 placeholder-slate-400 text-xs sm:text-sm p-3.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition shadow-sm"
          />
        </div>
      )}
    </div>
  );
}
