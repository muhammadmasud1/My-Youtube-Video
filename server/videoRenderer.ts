import { createCanvas, GlobalFonts, loadImage, type SKRSContext2D as CanvasRenderingContext2D } from '@napi-rs/canvas';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { Sentence, VideoSettings, RenderProgressUpdate, VideoJobResult } from './types.ts';
import { ttsService } from './tts.ts';
import { processBatchesAndJoin, RenderSceneContext, BatchRenderSceneResult } from './batchProcessor.ts';

const execAsync = promisify(exec);

// Register fonts once
let fontsRegistered = false;
export function registerSystemFonts() {
  if (fontsRegistered) return;
  try {
    const wqyPath = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc';
    if (fs.existsSync(wqyPath)) {
      GlobalFonts.registerFromPath(wqyPath, 'WenQuanYi');
    }

    const scPath = path.resolve('./fonts/NotoSansSC-Bold.otf');
    if (fs.existsSync(scPath)) {
      GlobalFonts.registerFromPath(scPath, 'NotoSansSCBold');
    }

    const bnBoldPath = path.resolve('./fonts/NotoSansBengali-Bold.ttf');
    if (fs.existsSync(bnBoldPath)) {
      GlobalFonts.registerFromPath(bnBoldPath, 'NotoSansBengaliBold');
    }

    const bnRegPath = path.resolve('./fonts/NotoSansBengali-Regular.ttf');
    if (fs.existsSync(bnRegPath)) {
      GlobalFonts.registerFromPath(bnRegPath, 'NotoSansBengali');
    }

    fontsRegistered = true;
    console.log('Registered canvas fonts successfully.');
  } catch (err) {
    console.warn('Warning during font registration:', err);
  }
}

registerSystemFonts();

// Environment background URL mapping
export function getEnvironmentBgUrl(envId?: string): string {
  if (!envId) return 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1920&q=80';
  const map: Record<string, string> = {
    coffee_shop: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1920&q=80',
    airport: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1920&q=80',
    office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80',
    restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80',
    street: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1920&q=80',
    library: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1920&q=80',
    park: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1920&q=80',
    hospital: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1920&q=80',
    supermarket: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1920&q=80',
    home: 'https://images.unsplash.com/photo-1502005229762-cf1b4da7c5d6?auto=format&fit=crop&w=1920&q=80',
    gym: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80',
    hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80',
    meeting: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1920&q=80',
    classroom: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1920&q=80',
  };
  return map[envId] || map['coffee_shop'];
}

export function getEnvironmentDisplayName(envId?: string): string {
  const map: Record<string, string> = {
    coffee_shop: '☕ Coffee Shop',
    airport: '✈️ Airport',
    office: '💼 Office',
    restaurant: '🍜 Restaurant',
    street: '🏙️ City Street',
    library: '📚 Library',
    park: '🌳 Park & Nature',
    hospital: '🏥 Hospital',
    supermarket: '🛒 Supermarket',
    home: '🏠 Home',
    gym: '🏋️ Gym',
    hotel: '🏨 Hotel',
    meeting: '📊 Meeting Room',
    classroom: '🏫 Classroom',
  };
  return map[envId || 'coffee_shop'] || '☕ Coffee Shop';
}

// Helper to wrap Chinese characters
function wrapChineseText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const normalized = (text || '').normalize('NFC').trim();
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    if (char === '\n') {
      if (currentLine) lines.push(currentLine);
      currentLine = '';
      continue;
    }
    const testLine = currentLine + char;
    const width = ctx.measureText(testLine).width;

    if (width > maxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

// Helper to wrap English words
function wrapWordsText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const normalized = (text || '').normalize('NFC').replace(/\r?\n/g, ' ').trim();
  const words = normalized.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = ctx.measureText(testLine).width;

    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

export async function getAudioDuration(filePath: string): Promise<number> {
  const { stdout } = await execAsync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`
  );
  const dur = parseFloat(stdout.trim());
  return isNaN(dur) || dur <= 0 ? 1.0 : dur;
}

export function getDimensions(aspectRatio: VideoSettings['aspectRatio']): { width: number; height: number } {
  switch (aspectRatio) {
    case '9:16':
      return { width: 1080, height: 1920 };
    case '16:9':
      return { width: 1920, height: 1080 };
    case '1:1':
    default:
      return { width: 1080, height: 1080 };
  }
}

export function getThemePalette(theme: VideoSettings['backgroundTheme']) {
  switch (theme) {
    case 'imperial_crimson':
      return {
        cardBg: 'rgba(30, 4, 6, 0.82)',
        cardBorder: 'rgba(245, 158, 11, 0.45)',
        badgeBg: '#b45309',
        badgeText: '#fef3c7',
        titleColor: '#fef08a',
        hanziColor: '#ffffff',
        pinyinColor: '#fde047',
        englishColor: '#fef08a',
        dividerColor: 'rgba(251, 191, 36, 0.35)',
      };
    case 'emerald_jade':
      return {
        cardBg: 'rgba(4, 30, 24, 0.82)',
        cardBorder: 'rgba(52, 211, 153, 0.4)',
        badgeBg: '#059669',
        badgeText: '#d1fae5',
        titleColor: '#a7f3d0',
        hanziColor: '#ffffff',
        pinyinColor: '#34d399',
        englishColor: '#a7f3d0',
        dividerColor: 'rgba(52, 211, 153, 0.3)',
      };
    case 'deep_obsidian':
      return {
        cardBg: 'rgba(11, 18, 34, 0.88)',
        cardBorder: 'rgba(56, 189, 248, 0.4)',
        badgeBg: '#0284c7',
        badgeText: '#e0f2fe',
        titleColor: '#7dd3fc',
        hanziColor: '#ffffff',
        pinyinColor: '#38bdf8',
        englishColor: '#facc15',
        dividerColor: 'rgba(56, 189, 248, 0.3)',
      };
    case 'minimal_paper':
      return {
        cardBg: 'rgba(255, 255, 255, 0.95)',
        cardBorder: 'rgba(203, 213, 225, 0.9)',
        badgeBg: '#475569',
        badgeText: '#f8fafc',
        titleColor: '#334155',
        hanziColor: '#0f172a',
        pinyinColor: '#2563eb',
        englishColor: '#16a34a',
        dividerColor: 'rgba(148, 163, 184, 0.4)',
      };
    case 'dark_slate':
    default:
      return {
        cardBg: 'rgba(15, 23, 42, 0.85)',
        cardBorder: 'rgba(148, 163, 184, 0.25)',
        badgeBg: '#2563eb',
        badgeText: '#eff6ff',
        titleColor: '#cbd5e1',
        hanziColor: '#f8fafc',
        pinyinColor: '#38bdf8',
        englishColor: '#34d399',
        dividerColor: 'rgba(148, 163, 184, 0.25)',
      };
  }
}

// Render a single scene image frame with environment background image
export async function renderSceneFrame(
  sentence: Sentence,
  settings: VideoSettings,
  sentenceIndex: number,
  totalSentences: number,
  options: { hideEnglish?: boolean } = {}
): Promise<Buffer> {
  const { width, height } = getDimensions(settings.aspectRatio);
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const palette = getThemePalette(settings.backgroundTheme);

  // 1. Draw Environment Background Image
  const bgUrl = getEnvironmentBgUrl(sentence.environment);
  try {
    const imgBuf = await fetch(bgUrl).then((r) => r.arrayBuffer());
    const image = await loadImage(Buffer.from(imgBuf));
    ctx.drawImage(image, 0, 0, width, height);
  } catch (err) {
    // Fallback dark gradient if image fetch fails
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
  }

  // Dark Cinematic Overlay for crystal clear readability
  ctx.save();
  ctx.fillStyle = 'rgba(2, 6, 23, 0.78)';
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // Card geometry
  const isLandscape = settings.aspectRatio === '16:9';
  const cardMarginX = isLandscape ? 140 : 60;
  const cardWidth = width - cardMarginX * 2;
  const cardHeight = isLandscape ? height - 160 : height * 0.72;
  const cardX = cardMarginX;
  const cardY = isLandscape ? 80 : (height - cardHeight) / 2 + 30;

  // Draw main card
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 15;

  ctx.fillStyle = palette.cardBg;
  ctx.beginPath();
  if ((ctx as any).roundRect) {
    (ctx as any).roundRect(cardX, cardY, cardWidth, cardHeight, 32);
  } else {
    ctx.rect(cardX, cardY, cardWidth, cardHeight);
  }
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 3;
  ctx.strokeStyle = palette.cardBorder;
  ctx.stroke();
  ctx.restore();

  // Header Bar Inside Card
  const headerY = cardY + 55;

  // Environment Badge
  ctx.save();
  const envName = getEnvironmentDisplayName(sentence.environment);
  ctx.font = 'bold 20px sans-serif';
  const badgeMetrics = ctx.measureText(envName);
  const badgeWidth = badgeMetrics.width + 36;
  const badgeHeight = 38;
  const badgeX = cardX + 45;

  ctx.fillStyle = palette.badgeBg;
  ctx.beginPath();
  if ((ctx as any).roundRect) {
    (ctx as any).roundRect(badgeX, headerY - 26, badgeWidth, badgeHeight, 19);
  } else {
    ctx.rect(badgeX, headerY - 26, badgeWidth, badgeHeight);
  }
  ctx.fill();

  ctx.fillStyle = palette.badgeText;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(envName, badgeX + badgeWidth / 2, headerY - 7);
  ctx.restore();

  // Sentence Counter
  if (settings.showSentenceCounter) {
    ctx.save();
    ctx.fillStyle = palette.titleColor;
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const counterText = `${String(sentenceIndex + 1).padStart(2, '0')} / ${String(totalSentences).padStart(2, '0')}`;
    ctx.fillText(counterText, cardX + cardWidth - 50, headerY - 7);
    ctx.restore();
  }

  // Content Area
  const contentWidth = cardWidth - 100;
  const contentCenterX = cardX + cardWidth / 2;
  const isLeftAlign = settings.textAlign === 'left';
  const textX = isLeftAlign ? cardX + 60 : contentCenterX;
  const textAlign = isLeftAlign ? 'left' : 'center';

  const hanziSize =
    settings.hanziFontSize === 'xl' ? (isLandscape ? 82 : 94) : settings.hanziFontSize === 'large' ? (isLandscape ? 72 : 82) : (isLandscape ? 60 : 70);

  const pinyinSize =
    settings.pinyinFontSize === 'large' ? (isLandscape ? 38 : 44) : (isLandscape ? 30 : 36);

  const englishSize =
    settings.englishFontSize === 'large' ? (isLandscape ? 38 : 44) : (isLandscape ? 30 : 36);

  // Measure Hanzi
  ctx.save();
  ctx.font = `bold ${hanziSize}px 'WenQuanYi', 'NotoSansSCBold', sans-serif`;
  ctx.textAlign = textAlign;
  ctx.textBaseline = 'top';

  const hanziLines = wrapChineseText(ctx, sentence.hanzi, contentWidth);
  const hanziLineHeight = hanziSize * 1.35;
  const hanziTotalHeight = hanziLines.length * hanziLineHeight;

  // Measure Pinyin
  ctx.font = `600 ${pinyinSize}px 'WenQuanYi', 'NotoSansSCBold', sans-serif`;
  const pinyinNormalized = (sentence.pinyin || '').normalize('NFC');
  const pinyinLines = wrapWordsText(ctx, pinyinNormalized, contentWidth);
  const pinyinLineHeight = pinyinSize * 1.4;
  const pinyinTotalHeight = pinyinLines.length * pinyinLineHeight;

  // Measure English
  ctx.font = `600 ${englishSize}px sans-serif`;
  const englishNormalized = (sentence.english || '').normalize('NFC');
  const englishLines = wrapWordsText(ctx, englishNormalized, contentWidth);
  const englishLineHeight = englishSize * 1.4;
  const englishTotalHeight = englishLines.length * englishLineHeight;

  const spacingBetween = isLandscape ? 30 : 45;
  const totalContentHeight = hanziTotalHeight + spacingBetween + pinyinTotalHeight + spacingBetween + 30 + englishTotalHeight;

  let currentY = cardY + 120 + Math.max(0, (cardHeight - 140 - totalContentHeight) / 2);

  // Draw Hanzi Lines
  ctx.font = `bold ${hanziSize}px 'WenQuanYi', 'NotoSansSCBold', sans-serif`;
  ctx.fillStyle = palette.hanziColor;
  ctx.textAlign = textAlign;
  ctx.textBaseline = 'top';

  for (const line of hanziLines) {
    ctx.fillText(line, textX, currentY);
    currentY += hanziLineHeight;
  }
  ctx.restore();

  currentY += spacingBetween * 0.5;

  // Draw Pinyin Lines
  ctx.save();
  ctx.font = `600 ${pinyinSize}px 'WenQuanYi', 'NotoSansSCBold', sans-serif`;
  ctx.fillStyle = palette.pinyinColor;
  ctx.textAlign = textAlign;
  ctx.textBaseline = 'top';

  for (const line of pinyinLines) {
    ctx.fillText(line, textX, currentY);
    currentY += pinyinLineHeight;
  }
  ctx.restore();

  currentY += spacingBetween * 0.7;

  // Stylized Divider
  ctx.save();
  ctx.strokeStyle = palette.dividerColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  const divWidth = Math.min(contentWidth, 600);
  const divX = cardX + (cardWidth - divWidth) / 2;
  ctx.moveTo(divX, currentY);
  ctx.lineTo(divX + divWidth, currentY);
  ctx.stroke();
  ctx.restore();

  currentY += spacingBetween * 0.7;

  // Draw English Translation & Meaning
  ctx.save();
  ctx.font = `600 ${englishSize}px sans-serif`;
  ctx.fillStyle = palette.englishColor;
  ctx.textAlign = textAlign;
  ctx.textBaseline = 'top';

  for (const line of englishLines) {
    ctx.fillText(line, textX, currentY);
    currentY += englishLineHeight;
  }
  ctx.restore();

  // Footer inside card
  ctx.save();
  ctx.fillStyle = palette.titleColor;
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('Chinese Learning • Hanzi, Pinyin & English Meaning', width / 2, cardY + cardHeight - 30);
  ctx.restore();

  return canvas.toBuffer('image/png');
}

// Generate the complete video with FFmpeg
export async function generateFullVideo(
  sentences: Sentence[],
  settings: VideoSettings,
  onProgress?: (progress: RenderProgressUpdate) => void
): Promise<VideoJobResult> {
  if (!sentences || sentences.length === 0) {
    throw new Error('At least one sentence is required to generate a video.');
  }

  const jobId = `video_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const jobDir = path.resolve(`./temp/jobs/${jobId}`);
  const outputDir = path.resolve('./public/outputs');

  fs.mkdirSync(jobDir, { recursive: true });
  fs.mkdirSync(outputDir, { recursive: true });

  const finalVideoPath = path.join(outputDir, `${jobId}.mp4`);

  try {
    onProgress?.({
      stage: 'preparing',
      percent: 5,
      message: `Preparing workspace for ${sentences.length} sentences...`,
      totalSentences: sentences.length,
    });

    const pauseDuration = Math.max(0.3, Math.min(3.0, settings.pauseDuration || 0.8));
    const pauseFilePath = path.join(jobDir, 'pause.mp3');
    await execAsync(
      `ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=stereo -t ${pauseDuration.toFixed(2)} -q:a 9 -acodec libmp3lame "${pauseFilePath}"`
    );

    const renderSceneFn = async (ctx: RenderSceneContext): Promise<BatchRenderSceneResult> => {
      const { sentence, index: i, totalSentences, batchDir, pauseFilePath, settings } = ctx;

      const voiceMode = settings.voiceSequenceMode || 'chinese_english';
      const isSlow = !!settings.slowSpeech;
      const speed = isSlow ? 0.75 : (settings.chineseSpeed || 1.0);

      // A. Mandarin Chinese audio
      let zhFile = '';
      let zhDuration = 0;
      if (voiceMode !== 'english_only') {
        const zhBuf = await ttsService.generateAudio(sentence.hanzi, 'zh-CN', { speed, slow: isSlow });
        zhFile = path.join(batchDir, `s${i}_zh.mp3`);
        fs.writeFileSync(zhFile, zhBuf);
        zhDuration = await getAudioDuration(zhFile);
      }

      // B. English audio (using Edge TTS en-US AriaNeural natural female voice)
      let enFile = '';
      let enDuration = 0;
      if (voiceMode !== 'chinese_only') {
        const enBuf = await ttsService.generateAudio(sentence.english, 'en-US', { speed, slow: isSlow });
        enFile = path.join(batchDir, `s${i}_en.mp3`);
        fs.writeFileSync(enFile, enBuf);
        enDuration = await getAudioDuration(enFile);
      }

      const audioConcatListPath = path.join(batchDir, `s${i}_audio_list.txt`);
      let audioConcatLines: string[] = [];

      if (voiceMode === 'chinese_only') {
        audioConcatLines.push(`file '${zhFile}'`);
        audioConcatLines.push(`file '${pauseFilePath}'`);
      } else if (voiceMode === 'english_only') {
        audioConcatLines.push(`file '${enFile}'`);
        audioConcatLines.push(`file '${pauseFilePath}'`);
      } else if (voiceMode === 'chinese_english') {
        audioConcatLines.push(`file '${zhFile}'`);
        audioConcatLines.push(`file '${pauseFilePath}'`);
        audioConcatLines.push(`file '${enFile}'`);
        audioConcatLines.push(`file '${pauseFilePath}'`);
      } else {
        audioConcatLines.push(`file '${zhFile}'`);
        audioConcatLines.push(`file '${pauseFilePath}'`);
        audioConcatLines.push(`file '${enFile}'`);
        audioConcatLines.push(`file '${pauseFilePath}'`);
        audioConcatLines.push(`file '${zhFile}'`);
        audioConcatLines.push(`file '${pauseFilePath}'`);
      }

      fs.writeFileSync(audioConcatListPath, audioConcatLines.join('\n'));

      const sceneAudioPath = path.join(batchDir, `s${i}_audio.wav`);
      await execAsync(
        `ffmpeg -y -f concat -safe 0 -i "${audioConcatListPath}" -c:a pcm_s16le "${sceneAudioPath}"`
      );

      const sceneTotalAudioDuration = await getAudioDuration(sceneAudioPath);
      const sceneMp4Path = path.join(batchDir, `s${i}_scene.mp4`);

      const animType = settings.textAnimation || 'fade';
      let videoFilter = 'format=yuv420p';
      if (animType === 'fade') {
        videoFilter = 'fade=t=in:st=0:d=0.6,format=yuv420p';
      } else if (animType === 'zoom_in' || animType === 'zoom-in') {
        const { width: vW, height: vH } = getDimensions(settings.aspectRatio);
        videoFilter = `zoompan=z='min(zoom+0.001,1.04)':d=125:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${vW}x${vH},fade=t=in:st=0:d=0.5,format=yuv420p`;
      }

      const frameBuf = await renderSceneFrame(sentence, settings, i, totalSentences, {
        hideEnglish: false,
      });
      const framePath = path.join(batchDir, `s${i}_frame.png`);
      fs.writeFileSync(framePath, frameBuf);

      await execAsync(
        `ffmpeg -y -loop 1 -framerate 25 -t ${sceneTotalAudioDuration.toFixed(3)} -i "${framePath}" -i "${sceneAudioPath}" -vf "${videoFilter}" -c:v libx264 -preset ultrafast -crf 20 -c:a aac -b:a 192k -shortest "${sceneMp4Path}"`
      );

      return { sceneMp4Path, duration: sceneTotalAudioDuration };
    };

    const batchResult = await processBatchesAndJoin({
      sentences,
      settings,
      jobDir,
      finalVideoPath,
      pauseFilePath,
      chunkSize: 10,
      renderSceneFn,
      onProgress,
    });

    const stat = fs.statSync(finalVideoPath);

    onProgress?.({
      stage: 'completed',
      percent: 100,
      currentSentence: sentences.length,
      totalSentences: sentences.length,
      message: 'Video generated successfully! Ready to preview & download.',
    });

    const result: VideoJobResult = {
      jobId,
      videoUrl: `/outputs/${jobId}.mp4`,
      downloadUrl: `/api/download/${jobId}`,
      duration: batchResult.totalDuration,
      aspectRatio: settings.aspectRatio,
      sentenceCount: sentences.length,
      fileSize: stat.size,
      createdAt: new Date().toISOString(),
    };

    return result;
  } finally {
    try {
      if (fs.existsSync(jobDir)) {
        fs.rmSync(jobDir, { recursive: true, force: true });
      }
    } catch (e) {
      console.warn('Failed to clean up job temp directory:', e);
    }
  }
}
