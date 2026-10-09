export interface Sentence {
  id: string;
  hanzi: string;
  pinyin: string;
  english: string;
  environment?: string;
}

export type AspectRatio = '9:16' | '16:9' | '1:1';

export type BackgroundTheme =
  | 'dark_slate'
  | 'imperial_crimson'
  | 'emerald_jade'
  | 'deep_obsidian'
  | 'minimal_paper';

export type TextAlign = 'center' | 'left';

export type VoiceSequenceMode =
  | 'chinese_english_chinese'
  | 'chinese_english'
  | 'chinese_only'
  | 'english_only';

export type TextAnimationType = 'fade' | 'slide-up' | 'none' | 'slide_up' | 'zoom_in' | 'zoom-in' | 'typewriter';

export interface VideoSettings {
  aspectRatio: AspectRatio;
  voiceSequenceMode: VoiceSequenceMode;
  repeatChinese: boolean;
  listeningMode: boolean;
  slowSpeech: boolean;
  textAnimation: TextAnimationType;
  backgroundTheme: BackgroundTheme;
  hanziFontSize: 'normal' | 'large' | 'xl';
  pinyinFontSize: 'normal' | 'large';
  englishFontSize: 'normal' | 'large';
  textAlign: TextAlign;
  pauseDuration: number;
  chineseSpeed: number;
  englishSpeed: number;
  title: string;
  showSentenceCounter: boolean;
}

export interface RenderProgressUpdate {
  stage: string;
  percent: number;
  currentSentence?: number;
  totalSentences?: number;
  currentBatch?: number;
  totalBatches?: number;
  message: string;
}

export interface VideoJobResult {
  jobId: string;
  videoUrl: string;
  downloadUrl: string;
  duration: number;
  aspectRatio: AspectRatio;
  sentenceCount: number;
  fileSize: number;
  createdAt: string;
}
