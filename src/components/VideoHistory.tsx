import React from 'react';
import { Film, Download, Play, Trash2, Calendar, HardDrive } from 'lucide-react';
import { GeneratedVideo } from '../types.ts';

interface VideoHistoryProps {
  history: GeneratedVideo[];
  onSelectVideo: (video: GeneratedVideo) => void;
  onDeleteVideo: (id: string) => void;
  onClearHistory: () => void;
}

export const VideoHistory: React.FC<VideoHistoryProps> = ({
  history,
  onSelectVideo,
  onDeleteVideo,
  onClearHistory,
}) => {
  const formatFileSize = (bytes: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (history.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4 max-w-xl mx-auto">
        <Film className="w-12 h-12 text-slate-600 mx-auto" />
        <h3 className="text-base font-bold text-white">এখনও কোনো ভিডিও তৈরি করা হয়নি</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          আপনার পছন্দমতো চাইনিজ ও বাংলা বাক্য সাজিয়ে "ভিডিও তৈরি করুন" বাটনে চাপলে এখানে ভিডিও সংরক্ষিত হবে।
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
            <Film className="w-5 h-5 text-amber-400" />
            <span>তৈরিকৃত ভিডিও গ্যালারি (Rendered Videos)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            পূর্বে রেন্ডার করা ভিডিওগুলো দেখুন বা পুনরায় ডাউনলোড করুন
          </p>
        </div>

        <button
          type="button"
          onClick={onClearHistory}
          className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all flex items-center space-x-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>হিস্ট্রি ক্লিয়ার</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.map((video, index) => {
          const videoKey = video?.id ? `${video.id}_${index}` : `video_${video?.createdAt || Date.now()}_${index}`;
          const videoId = video?.id || videoKey;
          return (
            <div
              key={videoKey}
              className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 space-y-3 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                {/* Thumbnail or Aspect badge */}
                <div
                  onClick={() => onSelectVideo(video)}
                  className="w-full h-36 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center cursor-pointer group-hover:border-amber-500/40 relative overflow-hidden"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-mono text-amber-300 border border-white/10">
                    {video.aspectRatio}
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] text-slate-300">
                    {video.sentenceCount} বাক্যাংশ
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                    {video.title}
                  </h4>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-1">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{formatDate(video.createdAt)}</span>
                    </span>
                    <span>•</span>
                    <span>{formatFileSize(video.fileSize)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => onSelectVideo(video)}
                  className="flex-1 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold flex items-center justify-center space-x-1 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>প্লে করুন</span>
                </button>

                <a
                  href={video.videoUrl}
                  download={`${video.title}_${video.aspectRatio}.mp4`}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Download MP4"
                >
                  <Download className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={() => onDeleteVideo(videoId)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
