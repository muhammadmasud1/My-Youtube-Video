import React from 'react';
import { VideoSettings, BackgroundTheme, TextAlign, TextAnimationType, VoiceSequenceMode } from '../types.ts';
import { Settings as SettingsIcon, Sliders, Volume2, Sparkles, Layout } from 'lucide-react';

interface SettingsPanelProps {
  settings: VideoSettings;
  onChangeSettings: (newSettings: VideoSettings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onChangeSettings,
}) => {
  const updateField = <K extends keyof VideoSettings>(key: K, value: VideoSettings[K]) => {
    onChangeSettings({ ...settings, [key]: value });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-4">
        <SettingsIcon className="w-5 h-5 text-amber-400" />
        <h2 className="text-base font-bold text-white">Video Studio & Audio Settings</h2>
      </div>

      <div className="space-y-6">
        {/* 1. Video Title */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
            <span>Video Header Title (ভিডিওর শিরোনাম)</span>
          </label>
          <input
            type="text"
            value={settings.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="e.g. Chinese Sentence Practice"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* 2. Aspect Ratio */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
            <Layout className="w-4 h-4 text-amber-400" />
            <span>Video Aspect Ratio (ভিডিও ফরম্যাট)</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['9:16', '16:9', '1:1'] as const).map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => updateField('aspectRatio', ratio)}
                className={`py-2.5 px-3 rounded-xl border font-bold text-xs transition-all ${
                  settings.aspectRatio === ratio
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {ratio === '9:16' ? '9:16 Reels / Shorts' : ratio === '16:9' ? '16:9 YouTube' : '1:1 Square'}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Voice Sequence Mode */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>Voice Audio Sequence (অডিও ক্রমানুসার)</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {[
              { id: 'chinese_english', label: 'Chinese → English (একবার করে)' },
              { id: 'chinese_english_chinese', label: 'Chinese → English → Chinese (রিপিট)' },
              { id: 'chinese_only', label: 'Only Chinese (শুধু চাইনিজ)' },
              { id: 'english_only', label: 'Only English (শুধু ইংরেজি)' },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => updateField('voiceSequenceMode', mode.id as VoiceSequenceMode)}
                className={`p-3 rounded-xl border font-medium text-left transition-all ${
                  settings.voiceSequenceMode === mode.id
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-semibold shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                ✓ {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Pause Duration & Speeds */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Pause Between Sentences: <span className="text-amber-400 font-bold">{settings.pauseDuration}s</span>
            </label>
            <input
              type="range"
              min="0.3"
              max="2.5"
              step="0.1"
              value={settings.pauseDuration}
              onChange={(e) => updateField('pauseDuration', parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Speech Speed: <span className="text-amber-400 font-bold">{settings.chineseSpeed}x</span>
            </label>
            <input
              type="range"
              min="0.75"
              max="1.25"
              step="0.05"
              value={settings.chineseSpeed}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                updateField('chineseSpeed', val);
                updateField('englishSpeed', val);
              }}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>

        {/* 5. Background Theme Palette */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">Background Card Theme (থিম)</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'dark_slate', name: 'Dark Slate' },
              { id: 'imperial_crimson', name: 'Imperial Crimson' },
              { id: 'emerald_jade', name: 'Emerald Jade' },
              { id: 'deep_obsidian', name: 'Deep Obsidian' },
              { id: 'minimal_paper', name: 'Minimal Paper' },
            ].map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => updateField('backgroundTheme', theme.id as BackgroundTheme)}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all truncate ${
                  settings.backgroundTheme === theme.id
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {theme.name}
              </button>
            ))}
          </div>
        </div>

        {/* 6. Text Entrance Animation */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">Scene Entrance Animation (অ্যানিমেশন)</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'fade', name: 'Smooth Fade' },
              { id: 'zoom_in', name: 'Cinematic Zoom' },
              { id: 'none', name: 'Static Direct' },
            ].map((anim) => (
              <button
                key={anim.id}
                type="button"
                onClick={() => updateField('textAnimation', anim.id as TextAnimationType)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  settings.textAnimation === anim.id
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {anim.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
