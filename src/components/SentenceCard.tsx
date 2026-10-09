import React, { useState, useRef } from 'react';
import {
  Volume2,
  Trash2,
  ChevronUp,
  ChevronDown,
  Copy,
  Plus,
  Loader2,
  MapPin,
} from 'lucide-react';
import { Sentence } from '../types.ts';
import { ENVIRONMENT_PRESETS } from '../utils/environments.ts';

interface SentenceCardProps {
  sentence: Sentence;
  index: number;
  total: number;
  onUpdate: (updated: Sentence) => void;
  onDelete: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDuplicate: (index: number) => void;
  onAddAfter: (index: number) => void;
}

const PINYIN_TONES = ['ā', 'á', 'ǎ', 'à', 'ē', 'é', 'ě', 'è', 'ī', 'í', 'ǐ', 'ì', 'ō', 'ó', 'ǒ', 'ò', 'ū', 'ú', 'ǔ', 'ù', 'ǖ', 'ǘ', 'ǚ', 'ǜ'];

export const SentenceCard: React.FC<SentenceCardProps> = ({
  sentence,
  index,
  total,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onAddAfter,
}) => {
  const [playingZh, setPlayingZh] = useState(false);
  const [showTones, setShowTones] = useState(false);
  const pinyinInputRef = useRef<HTMLInputElement>(null);

  const handlePlayChinese = async () => {
    if (!sentence.hanzi.trim()) return;
    try {
      setPlayingZh(true);
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sentence.hanzi, lang: 'zh-CN' }),
      });

      if (!response.ok) throw new Error('TTS request failed');

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setPlayingZh(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setPlayingZh(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (err) {
      console.error('Audio playback error:', err);
      setPlayingZh(false);
    }
  };

  const insertPinyinChar = (char: string) => {
    const input = pinyinInputRef.current;
    if (!input) {
      onUpdate({ ...sentence, pinyin: sentence.pinyin + char });
      return;
    }

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const newText = sentence.pinyin.substring(0, start) + char + sentence.pinyin.substring(end);
    onUpdate({ ...sentence, pinyin: newText });

    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + char.length, start + char.length);
    }, 10);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg transition-all group">
      {/* Top Bar: Scene Index, Environment Selector & Reorder Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-4">
        <div className="flex items-center space-x-2.5">
          <span className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-xs font-semibold text-slate-300">
            Scene {index + 1} of {total}
          </span>
        </div>

        {/* Environment Selector Dropdown */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={sentence.environment || 'coffee_shop'}
              onChange={(e) => onUpdate({ ...sentence, environment: e.target.value })}
              className="bg-transparent text-xs text-amber-300 font-medium focus:outline-none cursor-pointer"
            >
              {ENVIRONMENT_PRESETS.map((env) => (
                <option key={env.id} value={env.id} className="bg-slate-900 text-white">
                  {env.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onMoveUp(index)}
              disabled={index === 0}
              title="Move Up"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => onMoveDown(index)}
              disabled={index === total - 1}
              title="Move Down"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDuplicate(index)}
              title="Duplicate Sentence"
              className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onAddAfter(index)}
              title="Insert Sentence Below"
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(sentence.id)}
              title="Delete Sentence"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3 Fields: Hanzi, Pinyin, English Translation & Meaning */}
      <div className="space-y-4">
        {/* 1. Chinese Hanzi */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-amber-400 flex items-center space-x-1.5">
              <span>1. Chinese Hanzi (汉字)</span>
              <span className="text-[10px] text-slate-500 font-normal">Prominent display text</span>
            </label>
            <button
              onClick={handlePlayChinese}
              disabled={!sentence.hanzi.trim() || playingZh}
              className="text-xs px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 flex items-center space-x-1 transition-all"
            >
              {playingZh ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                  <span>Speaking...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3 h-3" />
                  <span>Test Voice</span>
                </>
              )}
            </button>
          </div>
          <input
            type="text"
            value={sentence.hanzi}
            onChange={(e) => onUpdate({ ...sentence, hanzi: e.target.value })}
            placeholder="e.g. 我每天早上六点起床。"
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-base sm:text-lg font-bold text-white focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/40 transition-all tracking-wide"
          />
        </div>

        {/* 2. Pinyin */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-sky-400 flex items-center space-x-1.5">
              <span>2. Pinyin (拼音)</span>
              <span className="text-[10px] text-slate-500 font-normal">Pronunciation with tonal marks</span>
            </label>
            <button
              type="button"
              onClick={() => setShowTones(!showTones)}
              className="text-[11px] text-slate-400 hover:text-sky-300 transition-colors"
            >
              {showTones ? 'Hide tone palette' : '+ Tone marks palette'}
            </button>
          </div>

          {showTones && (
            <div className="mb-2 p-2 bg-slate-950/70 border border-slate-800 rounded-lg flex flex-wrap gap-1">
              {PINYIN_TONES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => insertPinyinChar(t)}
                  className="w-6 h-6 flex items-center justify-center text-xs font-medium text-sky-300 hover:bg-sky-500/20 rounded border border-sky-500/20"
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          <input
            ref={pinyinInputRef}
            type="text"
            value={sentence.pinyin}
            onChange={(e) => onUpdate({ ...sentence, pinyin: e.target.value })}
            placeholder="e.g. Wǒ měitiān zǎoshang liù diǎn qǐchuáng."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-sky-300 focus:outline-none focus:border-sky-500/80 focus:ring-1 focus:ring-sky-500/40 transition-all font-sans"
          />
        </div>

        {/* 3. English Translation & Meaning */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-emerald-400 flex items-center space-x-1.5">
              <span>3. English Translation & Meaning (ইংরেজি অর্থ)</span>
              <span className="text-[10px] text-slate-500 font-normal">Clear English meaning</span>
            </label>
          </div>
          <input
            type="text"
            value={sentence.english}
            onChange={(e) => onUpdate({ ...sentence, english: e.target.value })}
            placeholder="e.g. I wake up at six o'clock every morning."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm sm:text-base font-medium text-emerald-300 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/40 transition-all"
          />
        </div>
      </div>
    </div>
  );
};
