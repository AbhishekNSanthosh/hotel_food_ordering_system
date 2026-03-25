"use client";

import { useState, useEffect } from "react";
import { X, Gift, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";

interface CompensationModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: string;
}

export default function CompensationModal({ isOpen, onClose, note }: CompensationModalProps) {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
    } else {
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered && !isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-indigo-950/40 backdrop-blur-md transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className={`relative bg-white dark:bg-gray-950 w-full max-w-md rounded-[3rem] overflow-hidden shadow-[0_32px_128px_rgba(79,70,229,0.4)] transition-all duration-300 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'} border border-white/20`}
      >
        {/* Top Glow/Decoration */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 -z-10 opacity-10" />
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-600/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl" />

        <div className="p-10 text-center">
          {/* Icon */}
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-40 animate-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl shadow-yellow-200">
              <Gift className="w-12 h-12 text-white drop-shadow-md" />
            </div>
            <div className="absolute -top-2 -right-2 bg-indigo-600 rounded-full p-2 shadow-lg animate-bounce">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Text Content */}
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter mb-4">
            A Token of Our Apology! 🎁
          </h2>
          <p className="text-gray-500 font-bold text-lg mb-8 leading-relaxed">
            We're truly sorry for the delay in your order. To make it up to you, we've added a special compensation.
          </p>

          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-3xl border-2 border-dashed border-indigo-200 dark:border-indigo-800 mb-10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/50 dark:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-3 justify-center mb-2">
              <AlertTriangle className="w-4 h-4 text-indigo-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">
                Applied Compensation
              </span>
            </div>
            <p className="text-xl font-black text-indigo-700 dark:text-indigo-400 tracking-tight">
              "{note}"
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 text-white font-black py-5 rounded-[2rem] hover:scale-[1.05] active:scale-[0.95] transition-all shadow-xl shadow-indigo-100 dark:shadow-none hover:shadow-indigo-500/20 flex items-center justify-center gap-3 text-lg"
          >
            <CheckCircle2 className="w-6 h-6" />
            <span>Much Appreciated!</span>
          </button>
        </div>

        {/* Close corner button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
