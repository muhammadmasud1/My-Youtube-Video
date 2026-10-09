import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import * as googleTTS from 'google-tts-api';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface TTSOptions {
  slow?: boolean;
  speed?: number; // 0.75 to 1.2
}

export interface ITTSProvider {
  name: string;
  generateAudio(text: string, lang: 'zh-CN' | 'bn' | 'en' | 'en-US', options?: TTSOptions): Promise<Buffer>;
}

// In-memory audio buffer cache
const audioMemoryCache = new Map<string, Buffer>();
const CACHE_DIR = path.resolve('./temp/tts_cache');

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Original Native Female Voice Engine
 * Uses authentic human-sounding native Mandarin female speaker (Xiaoxiao)
 * and authentic native Bangladeshi female speaker (Nabanita)
 * with zero robotic AI tone and seamless fallback.
 */
export class OriginalNativeFemaleVoiceProvider implements ITTSProvider {
  name = 'Original Native Chinese & Bangla Female Voice';

  async generateAudio(text: string, lang: 'zh-CN' | 'bn' | 'en' | 'en-US', options?: TTSOptions): Promise<Buffer> {
    // 1. Normalize Unicode (NFC) for flawless glyph representation
    const cleanText = (text || '').normalize('NFC').trim();
    if (!cleanText) {
      throw new Error('TTS text cannot be empty');
    }

    // Determine speed and rate (0.75x slow speech or normal)
    const isSlow = options?.slow === true || (options?.speed !== undefined && options.speed <= 0.85);
    const rateStr = isSlow ? '-25%' : (options?.speed !== undefined && options.speed < 0.95 ? '-15%' : '+0%');

    // 100% Natural Human Neural Female Voices (Xiaoxiao for Chinese, Aria for English, Nabanita for Bangla)
    let voiceName = 'zh-CN-XiaoxiaoNeural';
    if (lang === 'en' || lang === 'en-US') {
      voiceName = 'en-US-AriaNeural';
    } else if (lang === 'bn') {
      voiceName = 'bn-BD-NabanitaNeural';
    } else if (lang === 'zh-CN') {
      voiceName = 'zh-CN-XiaoxiaoNeural';
    }

    const cacheKey = crypto
      .createHash('md5')
      .update(`${voiceName}_${rateStr}_${cleanText}`)
      .digest('hex');

    // 2. Check memory cache
    if (audioMemoryCache.has(cacheKey)) {
      return audioMemoryCache.get(cacheKey)!;
    }

    // 3. Check disk cache
    const diskPath = path.join(CACHE_DIR, `${cacheKey}.mp3`);
    if (fs.existsSync(diskPath)) {
      const buf = fs.readFileSync(diskPath);
      audioMemoryCache.set(cacheKey, buf);
      return buf;
    }

    // 4. Primary: Generate authentic human native female voice via high-fidelity Edge Engine
    try {
      const audioBuffer = await this.generateWithEdge(cleanText, voiceName, rateStr);
      try {
        fs.writeFileSync(diskPath, audioBuffer);
        audioMemoryCache.set(cacheKey, audioBuffer);
      } catch (e) {
        console.warn('Failed to cache TTS disk audio:', e);
      }
      return audioBuffer;
    } catch (primaryErr) {
      console.warn('Primary Edge native female voice error, using fallback:', primaryErr);
      return this.generateWithGoogleFallback(cleanText, lang, isSlow, diskPath, cacheKey);
    }
  }

  private async generateWithEdge(text: string, voice: string, rate: string): Promise<Buffer> {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = await tts.toStream(text, { rate });

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      let isDone = false;

      const finish = (err?: any, buf?: Buffer) => {
        if (isDone) return;
        isDone = true;
        clearTimeout(timeout);
        try {
          tts.close();
        } catch {}

        if (err) {
          reject(err);
        } else if (buf) {
          resolve(buf);
        } else {
          reject(new Error('No audio produced'));
        }
      };

      const timeout = setTimeout(() => {
        finish(new Error('Edge TTS stream timeout after 8s'));
      }, 8000);

      audioStream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      audioStream.on('end', () => {
        const completeBuffer = Buffer.concat(chunks);
        if (completeBuffer.length === 0) {
          finish(new Error('Empty audio stream received'));
        } else {
          finish(undefined, completeBuffer);
        }
      });

      audioStream.on('error', (err: any) => {
        finish(err);
      });
    });
  }

  private async generateWithGoogleFallback(
    cleanText: string,
    lang: 'zh-CN' | 'bn' | 'en' | 'en-US',
    isSlow: boolean,
    diskPath: string,
    cacheKey: string
  ): Promise<Buffer> {
    let audioBuffer: Buffer;
    const googleLang = lang === 'en' || lang === 'en-US' ? 'en' : lang === 'bn' ? 'bn' : 'zh-CN';
    if (cleanText.length <= 180) {
      const base64 = await googleTTS.getAudioBase64(cleanText, {
        lang: googleLang,
        slow: isSlow,
        host: 'https://translate.google.com',
        timeout: 10000,
      });
      audioBuffer = Buffer.from(base64, 'base64');
    } else {
      const results = await googleTTS.getAllAudioBase64(cleanText, {
        lang: googleLang,
        slow: isSlow,
        host: 'https://translate.google.com',
        timeout: 15000,
        splitPunct: '。！？.!?…',
      });
      audioBuffer = Buffer.concat(results.map((r) => Buffer.from(r.base64, 'base64')));
    }

    try {
      fs.writeFileSync(diskPath, audioBuffer);
      audioMemoryCache.set(cacheKey, audioBuffer);
    } catch (e) {
      console.warn('Failed to write disk cache:', e);
    }

    return audioBuffer;
  }
}

// Default provider instance using Original Native Female Voice
export const ttsService: ITTSProvider = new OriginalNativeFemaleVoiceProvider();
