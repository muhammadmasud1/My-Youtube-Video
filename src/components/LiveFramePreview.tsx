import React from 'react';
import { Sentence, VideoSettings } from '../types.ts';
import { getEnvironmentBg, ENVIRONMENT_PRESETS } from '../utils/environments.ts';
import { MapPin, ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface LiveFramePreviewProps {
  sentences: Sentence[];
  settings: VideoSettings;
  currentIndex: number;
  onSelectIndex: (index: number) => void;
}

export const LiveFramePreview: React.FC<LiveFramePreviewProps> = ({
  sentences,
  settings,
  currentIndex,
  onSelectIndex,
}) => {
  const currentSentence = sentences[currentIndex] || sentences[0] || {
    id: 'sample',
    hanzi: '我每天早上六点起床。',
    pinyin: 'Wǒ měitiān zǎoshang liù diǎn qǐchuáng.',
    english: 'I wake up at six o' + "'s" + ' morning every day.',
    environment: 'coffee_shop',
  };

  const bgImageUrl = getEnvironmentBg(currentSentence.environment);
  const currentEnvObj = ENVIRONMENT_PRESETS.find(e => e.id === currentSentence.environment) || ENVIRONMENT_PRESETS[0];

  const aspectRatioClass =
    settings.aspectRatio === '9:16'
      ? 'aspect-[9/16] max-w-xs mx-auto'
      : settings.aspectRatio === '16:9'
      ? 'aspect-video w-full'
      : 'aspect-square max-w-sm mx-auto';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Live Video Frame Preview</h3>
        </div>
        <div className="text-xs text-slate-400">
          Scene {currentIndex + 1} / {Math.max(1, sentences.length)}
        </div>
      </div>

      {/* Video Frame Canvas Simulation Container with Dynamic Environment Background Image */}
      <div
        className={`relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col justify-between p-4 sm:p-6 transition-all duration-500 ${aspectRatioClass}`}
        style={{
          backgroundImage: `url(${bgImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark Cinematic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/75 to-slate-950/90 pointer-events-none"></div>

        {/* Top Header inside frame */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 bg-blue-600/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md border border-blue-400/30">
            <MapPin className="w-3 h-3 text-amber-300" />
            <span>{currentEnvObj.name}</span>
          </div>

          {settings.showSentenceCounter && (
            <div className="bg-slate-900/80 backdrop-blur-md text-slate-200 px-3 py-1 rounded-full text-xs font-bold border border-slate-700">
              {String(currentIndex + 1).padStart(2, '0')} / {String(sentences.length || 1).padStart(2, '0')}
            </div>
          )}
        </div>

        {/* Center Content Card */}
        <div className="relative z-10 my-auto bg-slate-900/85 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-5 text-center shadow-2xl space-y-3">
          <div className="text-xs font-semibold text-amber-400 tracking-wider">
            {settings.title || 'Chinese Sentence Practice'}
          </div>

          {/* Hanzi */}
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
            {currentSentence.hanzi || '请添加汉字'}
          </div>

          {/* Pinyin */}
          <div className="text-sm sm:text-base font-semibold text-sky-400 font-sans tracking-normal">
            {currentSentence.pinyin ? currentSentence.pinyin.normalize('NFC') : 'Qǐng tiānjiā pīnyīn'}
          </div>

          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-slate-500/50 to-transparent mx-auto my-1"></div>

          {/* English Translation & Meaning */}
          <div className="text-sm sm:text-base font-semibold text-emerald-300">
            {currentSentence.english || 'English translation and meaning...'}
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-center text-[11px] text-slate-400 font-medium">
          Hanzi • Pinyin • English Meaning
        </div>
      </div>

      {/* Navigation Controls for Preview */}
      {sentences.length > 1 && (
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => onSelectIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-30 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 flex items-center space-x-1 transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev Scene</span>
          </button>
          <span className="text-xs text-slate-400">Navigate Scenes</span>
          <button
            onClick={() => onSelectIndex(Math.min(sentences.length - 1, currentIndex + 1))}
            disabled={currentIndex >= sentences.length - 1}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-30 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 flex items-center space-x-1 transition-all"
          >
            <span>Next Scene</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
