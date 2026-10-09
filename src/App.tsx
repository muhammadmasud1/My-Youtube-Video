import React, { useState, useEffect } from 'react';
import {
  Film,
  Sparkles,
  Video,
  Settings as SettingsIcon,
} from 'lucide-react';
import { Sentence, VideoSettings, VideoJobResult, RenderProgressUpdate } from './types.ts';
import { Header } from './components/Header.tsx';
import { TextInputPanel } from './components/TextInputPanel.tsx';
import { SentenceList } from './components/SentenceList.tsx';
import { SettingsPanel } from './components/SettingsPanel.tsx';
import { LiveFramePreview } from './components/LiveFramePreview.tsx';
import { GenerationModal } from './components/GenerationModal.tsx';
import { VideoPlayerView } from './components/VideoPlayerView.tsx';
import { VideoHistory } from './components/VideoHistory.tsx';
import { SAMPLE_LESSONS } from './utils/sampleLessons.ts';
import { parseInputText } from './utils/parser.ts';

const DEFAULT_SETTINGS: VideoSettings = {
  aspectRatio: '9:16',
  voiceSequenceMode: 'chinese_english',
  repeatChinese: false,
  listeningMode: false,
  slowSpeech: false,
  textAnimation: 'fade',
  backgroundTheme: 'dark_slate',
  hanziFontSize: 'large',
  pinyinFontSize: 'normal',
  englishFontSize: 'normal',
  textAlign: 'center',
  pauseDuration: 0.8,
  chineseSpeed: 1.0,
  englishSpeed: 1.0,
  title: 'Chinese Immersive Long Video Course',
  showSentenceCounter: true,
};

export default function App() {
  const [sentences, setSentences] = useState<Sentence[]>(() => {
    return parseInputText(SAMPLE_LESSONS[0].text);
  });

  const [settings, setSettings] = useState<VideoSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<'create' | 'settings' | 'preview' | 'history'>('create');
  const [previewIndex, setPreviewIndex] = useState<number>(0);

  // Video generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<RenderProgressUpdate>({
    stage: 'idle',
    percent: 0,
    message: '',
  });
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<VideoJobResult | null>(null);
  const [videoHistory, setVideoHistory] = useState<VideoJobResult[]>(() => {
    try {
      const saved = localStorage.getItem('chinese_video_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('chinese_video_history', JSON.stringify(videoHistory));
    } catch (e) {
      console.warn('Failed to save video history to localStorage:', e);
    }
  }, [videoHistory]);

  const handleUpdateSentence = (updated: Sentence) => {
    setSentences((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleDeleteSentence = (id: string) => {
    setSentences((prev) => prev.filter((s) => s.id !== id));
    if (previewIndex >= sentences.length - 1) {
      setPreviewIndex(Math.max(0, sentences.length - 2));
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setSentences((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
    setPreviewIndex(index - 1);
  };

  const handleMoveDown = (index: number) => {
    if (index === sentences.length - 1) return;
    setSentences((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
    setPreviewIndex(index + 1);
  };

  const handleDuplicate = (index: number) => {
    const target = sentences[index];
    if (!target) return;
    const duplicated: Sentence = {
      ...target,
      id: `s_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setSentences((prev) => {
      const copy = [...prev];
      copy.splice(index + 1, 0, duplicated);
      return copy;
    });
    setPreviewIndex(index + 1);
  };

  const handleAddSentence = () => {
    const newSentence: Sentence = {
      id: `s_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      hanzi: '',
      pinyin: '',
      english: '',
      environment: 'coffee_shop',
    };
    setSentences((prev) => [...prev, newSentence]);
    setPreviewIndex(sentences.length);
  };

  const handleAddAfter = (index: number) => {
    const newSentence: Sentence = {
      id: `s_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      hanzi: '',
      pinyin: '',
      english: '',
      environment: sentences[index]?.environment || 'coffee_shop',
    };
    setSentences((prev) => {
      const copy = [...prev];
      copy.splice(index + 1, 0, newSentence);
      return copy;
    });
    setPreviewIndex(index + 1);
  };

  const handleResetToSample = () => {
    const sample = parseInputText(SAMPLE_LESSONS[0].text);
    setSentences(sample);
    setPreviewIndex(0);
  };

  const handleClearAll = () => {
    setSentences([]);
    setPreviewIndex(0);
  };

  const handleGenerateVideo = async () => {
    if (sentences.length === 0) {
      setGenerationError('Please add at least one sentence before generating video.');
      return;
    }

    const invalid = sentences.some((s) => !s.hanzi.trim() || !s.english.trim());
    if (invalid) {
      setGenerationError('Please ensure every sentence card has Chinese Hanzi and English meaning filled in.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setProgress({
      stage: 'preparing',
      percent: 5,
      message: 'Submitting long video request to server...',
    });

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentences, settings }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const { jobId } = await response.json();

      let completedOrFailed = false;
      let pollInterval: any = null;
      let eventSource: EventSource | null = null;

      const finishSuccess = (result: VideoJobResult) => {
        if (completedOrFailed) return;
        completedOrFailed = true;
        if (pollInterval) clearInterval(pollInterval);
        if (eventSource) {
          try {
            eventSource.close();
          } catch {}
        }
        onJobSuccess(result);
      };

      const finishError = (errorMsg: string) => {
        if (completedOrFailed) return;
        completedOrFailed = true;
        if (pollInterval) clearInterval(pollInterval);
        if (eventSource) {
          try {
            eventSource.close();
          } catch {}
        }
        setIsGenerating(false);
        setGenerationError(errorMsg || 'Video rendering failed');
      };

      const handleUpdateData = (data: any) => {
        if (!data || completedOrFailed) return;
        if (data.progress) {
          setProgress(data.progress);
        }
        if ((data.type === 'completed' || data.status === 'completed') && data.result) {
          finishSuccess(data.result);
        } else if (data.type === 'failed' || data.status === 'failed') {
          finishError(data.error || 'Video rendering failed');
        }
      };

      try {
        eventSource = new EventSource(`/api/job/${jobId}/stream`);
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handleUpdateData(data);
          } catch (e) {
            console.error('Error parsing SSE data:', e);
          }
        };
        eventSource.onerror = () => {
          try {
            eventSource?.close();
          } catch {}
        };
      } catch (sseErr) {
        console.warn('SSE initialization notice:', sseErr);
      }

      pollInterval = setInterval(async () => {
        if (completedOrFailed) {
          clearInterval(pollInterval);
          return;
        }
        try {
          const res = await fetch(`/api/job/${jobId}`);
          if (!res.ok) return;
          const data = await res.json();
          handleUpdateData(data);
        } catch (pollErr) {
          console.warn('Job poll notice:', pollErr);
        }
      }, 1000);
    } catch (err: any) {
      console.error('Video generation initiation error:', err);
      setIsGenerating(false);
      setGenerationError(err.message || 'Failed to start video generation');
    }
  };

  const onJobSuccess = (result: VideoJobResult) => {
    setGeneratedVideo(result);
    setVideoHistory((prev) => [result, ...prev.filter((v) => v.jobId !== result.jobId)]);
    setIsGenerating(false);
    setActiveTab('preview');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sentenceCount={sentences.length}
        hasGeneratedVideo={!!generatedVideo}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner for Quick Status & Audio Flow */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/20 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-amber-400 font-bold text-sm">Long Video Mode:</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30">
                Hanzi • Pinyin • English Meaning + Environment Backgrounds
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                {sentences.length} Scenes Loaded
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Background images automatically switch based on the environment tag specified in each scene (e.g. Coffee Shop, Airport, Office).
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleGenerateVideo}
              disabled={isGenerating || sentences.length === 0}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Film className="w-4 h-4 fill-current" />
              <span>Generate Long Video 🎬</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Create Video & Sentence Editor */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            <TextInputPanel
              onParsedSentences={(newSentences) => {
                setSentences(newSentences);
                setPreviewIndex(0);
              }}
              currentCount={sentences.length}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Editable Sentence Cards (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <SentenceList
                  sentences={sentences}
                  onUpdateSentence={handleUpdateSentence}
                  onDeleteSentence={handleDeleteSentence}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onDuplicate={handleDuplicate}
                  onAddSentence={handleAddSentence}
                  onAddAfter={handleAddAfter}
                  onClearAll={handleClearAll}
                  onResetToSample={handleResetToSample}
                />
              </div>

              {/* Right Column: Live Frame Preview & Settings Quick Access (5 cols) */}
              <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
                <LiveFramePreview
                  sentences={sentences}
                  settings={settings}
                  currentIndex={previewIndex}
                  onSelectIndex={setPreviewIndex}
                />

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span>Quick Video Format:</span>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className="text-amber-400 hover:underline flex items-center space-x-1"
                    >
                      <SettingsIcon className="w-3.5 h-3.5" />
                      <span>All Settings</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['9:16', '16:9', '1:1'] as const).map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setSettings({ ...settings, aspectRatio: ratio })}
                        className={`py-2 text-xs rounded-xl border font-bold transition-all ${
                          settings.aspectRatio === ratio
                            ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {ratio === '9:16' ? '9:16 Reels' : ratio === '16:9' ? '16:9 YouTube' : '1:1 Square'}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleGenerateVideo}
                    disabled={isGenerating || sentences.length === 0}
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all mt-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Render {sentences.length} Scenes to MP4</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Visual & Audio Settings */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7">
              <SettingsPanel settings={settings} onChangeSettings={setSettings} />
            </div>
            <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-4">
              <LiveFramePreview
                sentences={sentences}
                settings={settings}
                currentIndex={previewIndex}
                onSelectIndex={setPreviewIndex}
              />
              <button
                onClick={handleGenerateVideo}
                disabled={isGenerating || sentences.length === 0}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all"
              >
                <Film className="w-4 h-4 fill-current" />
                <span>Generate Video with These Settings</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Video Preview & Download */}
        {activeTab === 'preview' && (
          <div>
            {generatedVideo ? (
              <VideoPlayerView
                videoResult={generatedVideo}
                onEditAgain={() => setActiveTab('create')}
              />
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-4 shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                  <Video className="w-7 h-7" />
                </div>
                <div className="max-w-md mx-auto">
                  <h3 className="text-lg font-bold text-white mb-1">No Video Rendered Yet</h3>
                  <p className="text-sm text-slate-400 mb-6">
                    Click "Generate Video" to render your current long video script into an MP4 file with dynamic environment backgrounds and native pronunciation.
                  </p>
                  <button
                    onClick={handleGenerateVideo}
                    className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center space-x-2 mx-auto transition-all"
                  >
                    <Film className="w-4 h-4 fill-current" />
                    <span>Generate Video Now</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: My Videos History */}
        {activeTab === 'history' && (
          <VideoHistory
            history={videoHistory}
            onSelectVideo={(video) => {
              setGeneratedVideo(video);
              setActiveTab('preview');
            }}
            onClearHistory={() => setVideoHistory([])}
          />
        )}
      </main>

      {/* Generation Progress Modal */}
      <GenerationModal
        isOpen={isGenerating || !!generationError}
        progress={progress}
        error={generationError}
        onClose={() => {
          setIsGenerating(false);
          setGenerationError(null);
        }}
        onRetry={handleGenerateVideo}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 mt-12">
        <p>Chinese Long Video Course Generator • Hanzi • Pinyin • English Meaning & Environment Backgrounds • H.264 MP4 Export</p>
      </footer>
    </div>
  );
};
