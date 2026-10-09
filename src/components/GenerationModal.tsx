import React from 'react';
import { Loader2, Film, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';
import { RenderProgressUpdate } from '../types.ts';

interface GenerationModalProps {
  isOpen: boolean;
  progress: RenderProgressUpdate;
  onCancel: () => void;
  error?: string | null;
}

export const GenerationModal: React.FC<GenerationModalProps> = ({
  isOpen,
  progress,
  onCancel,
  error,
}) => {
  if (!isOpen) return null;

  const isDone = progress.stage === 'done';
  const isError = progress.stage === 'error' || !!error;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow behind */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              {isDone ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              ) : isError ? (
                <AlertCircle className="w-6 h-6 text-rose-400" />
              ) : (
                <Film className="w-5 h-5 animate-pulse text-amber-400" />
              )}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {isDone
                  ? 'ভিডিও তৈরি সম্পন্ন!'
                  : isError
                  ? 'ভিডিও রেন্ডারে সমস্যা হয়েছে'
                  : 'ভিডিও তৈরি হচ্ছে (Rendering MP4)'}
              </h3>
              <p className="text-xs text-slate-400">
                {isDone
                  ? 'আপনার MP4 ফাইল প্রস্তুত'
                  : isError
                  ? 'দয়া করে পুনরায় চেষ্টা করুন'
                  : 'ভয়েস সিন্থেসিস ও ফ্রেম প্রসেসিং চলছে'}
              </p>
            </div>
          </div>

          {(isDone || isError) && (
            <button
              onClick={onCancel}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Progress Bar & Status */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-300 capitalize flex items-center space-x-1.5">
              {!isDone && !isError && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />}
              <span>{progress.message || 'অপেক্ষা করুন...'}</span>
            </span>
            <span className="font-mono text-amber-400 text-sm font-bold">
              {Math.round(progress.percent || 0)}%
            </span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isDone
                  ? 'bg-emerald-500'
                  : isError
                  ? 'bg-rose-500'
                  : 'bg-gradient-to-r from-amber-500 via-rose-500 to-amber-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(2, progress.percent || 0))}%` }}
            />
          </div>

          {progress.currentSentence && progress.totalSentences && (
            <div className="text-[11px] text-slate-400 text-right">
              বাক্য {progress.currentSentence} / {progress.totalSentences}
            </div>
          )}
        </div>

        {/* Step stages indicator */}
        <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
          <div
            className={`p-2 rounded-xl border transition-all ${
              progress.percent >= 30
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            ১. অডিও সিন্থেসিস
          </div>
          <div
            className={`p-2 rounded-xl border transition-all ${
              progress.percent >= 70
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            ২. ফ্রেম রেন্ডারিং
          </div>
          <div
            className={`p-2 rounded-xl border transition-all ${
              progress.percent >= 98
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            ৩. MP4 এনকোডিং
          </div>
        </div>

        {/* Error message display if any */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Actions */}
        {!isDone && !isError && (
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              বাতিল করুন (Cancel)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
