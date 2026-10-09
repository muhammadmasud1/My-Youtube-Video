import React from 'react';
import { Plus, Trash2, RotateCcw, AlertTriangle, Layers, Sparkles } from 'lucide-react';
import { Sentence } from '../types.ts';
import { SentenceCard } from './SentenceCard.tsx';
import { SAMPLE_LESSONS } from '../utils/sampleLessons.ts';
import { parseInputText } from '../utils/parser.ts';

interface SentenceListProps {
  sentences: Sentence[];
  onUpdateSentence: (updated: Sentence) => void;
  onDeleteSentence: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDuplicate: (index: number) => void;
  onAddSentence: () => void;
  onAddAfter: (index: number) => void;
  onClearAll: () => void;
  onResetToSample: () => void;
}

export const SentenceList: React.FC<SentenceListProps> = ({
  sentences,
  onUpdateSentence,
  onDeleteSentence,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onAddSentence,
  onAddAfter,
  onClearAll,
  onResetToSample,
}) => {
  const hasIncomplete = sentences.some((s) => !s.hanzi.trim() || !s.english.trim());

  if (sentences.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <Layers className="w-7 h-7" />
        </div>
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-bold text-white mb-1">No Sentences in Lesson Yet</h3>
          <p className="text-sm text-slate-400 mb-6">
            Paste your Chinese content above or start with our pre-built long video lesson sample.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onResetToSample}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Load Default Sample Lesson</span>
            </button>
            <button
              onClick={onAddSentence}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm border border-slate-700 transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Empty Sentence</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* List Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs">
            {sentences.length} {sentences.length === 1 ? 'Sentence' : 'Sentences'}
          </div>
          <span className="text-xs text-slate-400">
            Each sentence corresponds to 1 educational video scene with environment background
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onAddSentence}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Sentence</span>
          </button>

          <button
            onClick={onResetToSample}
            title="Reset to default sample"
            className="px-3 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 text-xs flex items-center space-x-1.5 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>

          <button
            onClick={onClearAll}
            title="Clear all sentences"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {hasIncomplete && (
        <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3 text-xs text-amber-300 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>Some cards are missing Hanzi or English meaning. Please fill them out before generating.</span>
        </div>
      )}

      {/* Cards list */}
      <div className="space-y-4">
        {sentences.map((sentence, idx) => (
          <SentenceCard
            key={sentence.id}
            sentence={sentence}
            index={idx}
            total={sentences.length}
            onUpdate={onUpdateSentence}
            onDelete={onDeleteSentence}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onDuplicate={onDuplicate}
            onAddAfter={onAddAfter}
          />
        ))}
      </div>

      {/* Bottom Add button */}
      <button
        onClick={onAddSentence}
        className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-800 hover:border-amber-500/50 hover:bg-slate-900/50 text-slate-400 hover:text-amber-400 text-sm font-semibold flex items-center justify-center space-x-2 transition-all group"
      >
        <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
        <span>Add Another Sentence</span>
      </button>
    </div>
  );
};
