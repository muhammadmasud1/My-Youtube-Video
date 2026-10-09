import React, { useState } from 'react';
import { Sparkles, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { Sentence } from '../types.ts';
import { SAMPLE_LESSONS } from '../utils/sampleLessons.ts';
import { parseInputText } from '../utils/parser.ts';

interface TextInputPanelProps {
  onParsedSentences: (sentences: Sentence[]) => void;
  currentCount: number;
}

export const TextInputPanel: React.FC<TextInputPanelProps> = ({
  onParsedSentences,
  currentCount,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState<string>(SAMPLE_LESSONS[0].id);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLoadSample = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    const lesson = SAMPLE_LESSONS.find((l) => l.id === lessonId);
    if (lesson) {
      setInputText(lesson.text);
      const parsed = parseInputText(lesson.text);
      onParsedSentences(parsed);
    }
  };

  const handleParseAndApply = () => {
    if (!inputText.trim()) return;
    const parsed = parseInputText(inputText);
    onParsedSentences(parsed);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header & Quick Sample Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Long Video Script & Batch Importer</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/30">
              {currentCount} Scenes Ready
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Paste your Chinese sentences (Hanzi, Pinyin, English Meaning) with environment tags like <code className="text-amber-300">[Coffee Shop]</code>.
          </p>
        </div>

        {/* Sample Lessons Dropdown */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedLessonId}
            onChange={(e) => handleLoadSample(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-amber-300 font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {SAMPLE_LESSONS.map((l) => (
              <option key={l.id} value={l.id} className="bg-slate-900 text-white">
                📚 {l.title}
              </option>
            ))}
          </select>
          <button
            onClick={() => handleLoadSample(selectedLessonId)}
            className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-semibold text-xs flex items-center space-x-1.5 transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Load Lesson</span>
          </button>
        </div>
      </div>

      {/* Textarea for Bulk Script Paste */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">Script Text Editor (Hanzi + Pinyin + English + Environment):</span>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] text-amber-400 hover:underline"
          >
            {isExpanded ? 'Collapse editor' : 'Expand editor box'}
          </button>
        </div>
        <textarea
          rows={isExpanded ? 12 : 5}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`[Coffee Shop]\n我每天早上六点起床。\nWǒ měitiān zǎoshang liù diǎn qǐchuáng.\nI wake up at six o'clock every morning.`}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/40 transition-all leading-relaxed resize-y"
        />
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Auto-detects Hanzi, Pinyin, English meaning & environment scene backgrounds</span>
        </div>
        <button
          onClick={handleParseAndApply}
          disabled={!inputText.trim()}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center space-x-1.5 transition-all disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Parse & Update Scenes</span>
        </button>
      </div>
    </div>
  );
};
