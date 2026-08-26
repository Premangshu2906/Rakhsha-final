import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Upload, RefreshCw, Volume2, CheckCircle2, AlertCircle } from 'lucide-react';
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
    // Check if Web Speech API is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // English (India) with support for distress terms

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
          setErrorMessage('Microphone access was denied. You can use the text box or upload an audio file.');
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
      setErrorMessage('Browser Speech API not supported on this device. Please type your complaint or upload audio.');
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
      recognitionRef.current.stop();
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

  return (
    <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 border border-slate-800 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Volume2 className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-sm sm:text-base">Voice Complaint Intake & Speech-to-Text</h3>
        </div>
        <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded">
          Web Speech + STT Provider Abstraction
        </span>
      </div>

      {errorMessage && (
        <div className="mt-3 p-2.5 bg-red-950/60 border border-red-800/80 rounded-lg text-xs text-red-200 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Recording Control Button & Visualizer */}
      <div className="my-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={toggleRecording}
            className={`relative p-4 rounded-full transition-all duration-300 ${
              isRecording
                ? 'bg-red-600 text-white pulse-ring'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
            }`}
          >
            {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
          </button>
          <div>
            <div className="text-sm font-semibold">
              {isRecording ? (
                <span className="text-red-400 flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                  <span>Recording Voice Stream... ({audioDuration}s)</span>
                </span>
              ) : (
                <span className="text-slate-300">Click microphone to record voice statement</span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Supports English, Hindi, and Indian regional accents
            </p>
          </div>
        </div>

        {/* Audio File Upload Alternative */}
        <div className="flex items-center space-x-2 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4 w-full sm:w-auto justify-end">
          <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg font-medium border border-slate-700 flex items-center space-x-1.5 transition">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Audio (.wav/.mp3)</span>
            <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Live Transcribed Text Display */}
      {isProcessing ? (
        <div className="py-4 text-center text-xs text-indigo-300 animate-pulse">
          Transcribing voice payload into structured text...
        </div>
      ) : (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-400">Captured Speech Transcript:</span>
            {transcript && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1"
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
            placeholder="Your voice input transcript will automatically appear here. You can also edit or append details manually..."
            className="w-full bg-slate-950 text-slate-100 placeholder-slate-500 text-xs sm:text-sm p-3 rounded-lg border border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}
