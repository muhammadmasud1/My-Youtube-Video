import React from 'react';
import { Film, Sparkles, BookOpen, Layers, History, Sliders, PlayCircle } from 'lucide-react';

interface HeaderProps {
  activeTab: 'create' | 'settings' | 'preview' | 'history';
  onChangeTab: (tab: 'create' | 'settings' | 'preview' | 'history') => void;
  sentenceCount: number;
  historyCount: number;
  onGenerateClick: () => void;
  isGenerating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onChangeTab,
  sentenceCount,
  historyCount,
  onGenerateClick,
  isGenerating,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3.5 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20 text-white font-bold text-xl">
            中
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>Chinese Learning Video Generator</span>
              </h1>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                PRO MP4
              </span>
            </div>
            <p className="text-xs text-slate-400">
              চাইনিজ বাক্য, পিনয়িন ও ১০০% নির্ভুল বাংলা অনুবাদ থেকে শিক্ষণীয় ভিডিও তৈরি করুন
            </p>
          </div>
        </div>

        {/* Navigation Tabs & Primary Action */}
        <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto pb-1 md:pb-0">
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center space-x-1">
            <button
              onClick={() => onChangeTab('create')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
                activeTab === 'create'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>বাক্য ও পাঠ ({sentenceCount})</span>
            </button>

            <button
              onClick={() => onChangeTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
                activeTab === 'preview'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>লাইভ প্রিভিউ</span>
            </button>

            <button
              onClick={() => onChangeTab('settings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
                activeTab === 'settings'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>সেটিংস ও ভয়েস</span>
            </button>

            <button
              onClick={() => onChangeTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
                activeTab === 'history'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>ভিডিও গ্যালারি {historyCount > 0 && `(${historyCount})`}</span>
            </button>
          </div>

          <button
            onClick={onGenerateClick}
            disabled={isGenerating || sentenceCount === 0}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white shadow-lg shadow-rose-600/30 flex items-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <Film className="w-4 h-4" />
            <span>ভিডিও তৈরি করুন (Render MP4)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
