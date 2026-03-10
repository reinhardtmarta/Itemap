'use client';

import React, { useState, useRef } from 'react';
import { Search, Camera, Mic, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { processLensImage, transcribeAudio } from '@/lib/gemini';

interface SearchInputProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export function SearchInput({ onSearch, isLoading }: SearchInputProps) {
  const [query, setQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleTextSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query);
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Error accessing camera:", err);
      setShowCamera(false);
    }
  };

  const captureImage = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 640, 480);
        const base64Image = canvasRef.current.toDataURL('image/jpeg').split(',')[1];
        
        // Stop camera
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        setShowCamera(false);

        // Process with Gemini
        const product = await processLensImage(base64Image);
        if (product.name) {
          setQuery(product.name);
          onSearch(product.name);
        }
      }
    }
  };

  const startVoiceSearch = async () => {
    setIsRecording(true);
    // In a real app, we'd use MediaRecorder and send to transcribeAudio
    // For this prototype, we'll simulate a voice capture or use Web Speech API
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      onSearch(transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.start();
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <form onSubmit={handleTextSearch} className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="O que você está procurando?"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-24 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xl"
        />
        <div className="absolute inset-y-0 right-2 flex items-center gap-2">
          <button
            type="button"
            onClick={startCamera}
            className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-emerald-500 transition-colors"
            title="Lens"
          >
            <Camera className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={startVoiceSearch}
            className={`p-2 hover:bg-zinc-800 rounded-xl transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-zinc-400 hover:text-emerald-500'}`}
            title="Voz"
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>
      </form>

      <AnimatePresence>
        {showCamera && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          >
            <div className="relative w-full max-w-md bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800">
              <video ref={videoRef} autoPlay playsInline className="w-full aspect-square object-cover" />
              <canvas ref={canvasRef} width="640" height="480" className="hidden" />
              <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
                <button
                  onClick={() => setShowCamera(false)}
                  className="p-4 bg-zinc-800 text-white rounded-full hover:bg-zinc-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <button
                  onClick={captureImage}
                  className="p-4 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                >
                  <Camera className="w-6 h-6" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
