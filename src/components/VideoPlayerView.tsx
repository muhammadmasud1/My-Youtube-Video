import React, { useState } from 'react';
import { VideoJobResult } from '../types.ts';
import { Download, Share2, Play, RotateCcw, Check, Film, ExternalLink } from 'lucide-react';

interface VideoPlayerViewProps {
  videoResult: VideoJobResult;
  onEditAgain: () => void;
}

export const VideoPlayerView: React.FC<VideoPlayerViewProps> = ({
  videoResult,
  onEditAgain,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const fullUrl = window.location.origin + videoResult.videoUrl;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Chinese Learning Video',
          text: 'Check out this immersive Chinese learning video!',
          url: fullUrl,
        });
        return;
      } catch {}
    }
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins}m ${rem}s`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
            <h2 className="text-lg font-bold text-white">Video Rendered Successfully! 🎬</h2>
          </div>
          <p className="text-xs text-slate-400">
            {videoResult.sentenceCount} Scenes • Duration: {formatDuration(videoResult.duration)} • Format: {videoResult.aspectRatio} • Size: {formatFileSize(videoResult.fileSize)}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onEditAgain}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center space-x-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Edit Script / Settings</span>
          </button>
        </div>
      </div>

      {/* Video Player Container */}
      <div className="flex justify-center bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 p-2 shadow-2xl">
        <video
          controls
          autoPlay
          src={videoResult.videoUrl}
          className={`rounded-xl object-contain max-h-[650px] w-full ${
            videoResult.aspectRatio === '9:16'
              ? 'max-w-xs'
              : videoResult.aspectRatio === '16:9'
              ? 'max-w-3xl aspect-video'
              : 'max-w-md aspect-square'
          }`}
        >
          Your browser does not support HTML5 video.
        </video>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <a
          href={videoResult.downloadUrl}
          download
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          <span>Download MP4 Video (HD)</span>
        </a>

        <button
          onClick={handleShare}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center space-x-2 transition-all border border-slate-700"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300">Link Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-sky-400" />
              <span>Share Video Link</span>
            </>
          )}
        </button>

        <a
          href={videoResult.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all border border-slate-800"
        >
          <ExternalLink className="w-4 h-4 text-slate-400" />
          <span>Open in New Tab</span>
        </a>
      </div>
    </div>
  );
};
