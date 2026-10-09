import { Sentence } from '../types.ts';

// Check if a line contains Chinese Hanzi
export function isHanziLine(text: string): boolean {
  return /[\u4e00-\u9fff\u3400-\u4dbf]/.test(text);
}

// Check if a line is likely Pinyin
export function isPinyinLine(text: string): boolean {
  if (isHanziLine(text)) return false;
  return /[a-zA-Z\u0100-\u024F\u1E00-\u1EFF]/.test(text);
}

// Check if a line is an environment tag like [Coffee Shop] or Environment: Coffee Shop
export function parseEnvironmentTag(line: string): string | null {
  const match = line.match(/^\[(.*?)\]$|^(?:environment|scene|topic)\s*[:\-]\s*(.*)$/i);
  if (match) {
    const raw = (match[1] || match[2] || '').trim().toLowerCase();
    return getEnvIdFromRaw(raw);
  }
  return null;
}

function getEnvIdFromRaw(raw: string): string {
  if (raw.includes('coffee') || raw.includes('cafe') || raw.includes('kofi')) return 'coffee_shop';
  if (raw.includes('airport') || raw.includes('flight') || raw.includes('plane')) return 'airport';
  if (raw.includes('office') || raw.includes('work') || raw.includes('desk')) return 'office';
  if (raw.includes('restaurant') || raw.includes('food') || raw.includes('dining') || raw.includes('eat')) return 'restaurant';
  if (raw.includes('street') || raw.includes('city') || raw.includes('road')) return 'street';
  if (raw.includes('library') || raw.includes('book') || raw.includes('study')) return 'library';
  if (raw.includes('park') || raw.includes('nature') || raw.includes('weather')) return 'park';
  if (raw.includes('hospital') || raw.includes('clinic') || raw.includes('doctor')) return 'hospital';
  if (raw.includes('supermarket') || raw.includes('shop') || raw.includes('store') || raw.includes('market')) return 'supermarket';
  if (raw.includes('home') || raw.includes('house') || raw.includes('sleep') || raw.includes('wake')) return 'home';
  if (raw.includes('gym') || raw.includes('fitness') || raw.includes('sport')) return 'gym';
  if (raw.includes('hotel') || raw.includes('room')) return 'hotel';
  if (raw.includes('meeting') || raw.includes('conference')) return 'meeting';
  if (raw.includes('class') || raw.includes('school') || raw.includes('student') || raw.includes('teacher')) return 'classroom';
  return 'coffee_shop';
}

// Smart keyword-based topic/environment auto-detection from sentence content (Hanzi & English)
export function detectTopicEnvironment(text: string): string | null {
  const lower = text.toLowerCase();
  if (lower.includes('coffee') || lower.includes('cafe') || lower.includes('咖啡') || lower.includes('喝')) return 'coffee_shop';
  if (lower.includes('airport') || lower.includes('flight') || lower.includes('plane') || lower.includes('飞机') || lower.includes('机场') || lower.includes('登机')) return 'airport';
  if (lower.includes('office') || lower.includes('work') || lower.includes('presentation') || lower.includes('powerpoint') || lower.includes('工作') || lower.includes('公司') || lower.includes('项目') || lower.includes('会议')) return 'office';
  if (lower.includes('restaurant') || lower.includes('food') || lower.includes('eat') || lower.includes('menu') || lower.includes('chicken') || lower.includes('rice') || lower.includes('bill') || lower.includes('饭') || lower.includes('菜') || lower.includes('吃') || lower.includes('餐馆') || lower.includes('买单') || lower.includes('饺子')) return 'restaurant';
  if (lower.includes('street') || lower.includes('road') || lower.includes('walk') || lower.includes('subway') || lower.includes('station') || lower.includes('地铁') || lower.includes('路口') || lower.includes('走路') || lower.includes('走')) return 'street';
  if (lower.includes('library') || lower.includes('book') || lower.includes('borrow') || lower.includes('read') || lower.includes('书') || lower.includes('图书馆') || lower.includes('借书')) return 'library';
  if (lower.includes('park') || lower.includes('weather') || lower.includes('sun') || lower.includes('nature') || lower.includes('lake') || lower.includes('天气') || lower.includes('公园') || lower.includes('阳光') || lower.includes('风景')) return 'park';
  if (lower.includes('hospital') || lower.includes('doctor') || lower.includes('sick') || lower.includes('cough') || lower.includes('temperature') || lower.includes('医院') || lower.includes('医生') || lower.includes('咳嗽') || lower.includes('体温')) return 'hospital';
  if (lower.includes('supermarket') || lower.includes('shop') || lower.includes('buy') || lower.includes('apple') || lower.includes('banana') || lower.includes('超市') || lower.includes('买') || lower.includes('苹果')) return 'supermarket';
  if (lower.includes('home') || lower.includes('wake') || lower.includes('sleep') || lower.includes('cook') || lower.includes('家') || lower.includes('起床') || lower.includes('做饭')) return 'home';
  if (lower.includes('gym') || lower.includes('exercise') || lower.includes('run') || lower.includes('treadmill') || lower.includes('健身') || lower.includes('跑步') || lower.includes('锻炼')) return 'gym';
  if (lower.includes('hotel') || lower.includes('room') || lower.includes('stay') || lower.includes('酒店') || lower.includes('房间')) return 'hotel';
  if (lower.includes('meeting') || lower.includes('conference') || lower.includes('会议室')) return 'meeting';
  if (lower.includes('class') || lower.includes('teacher') || lower.includes('student') || lower.includes('study') || lower.includes('chinese') || lower.includes('老师') || lower.includes('学生') || lower.includes('中文') || lower.includes('学习') || lower.includes('考试') || lower.includes('练习')) return 'classroom';
  return null;
}

// Clean leading numbers
export function stripPrefixNumbering(line: string): string {
  return line.replace(/^(\d+[\.\-\)]\s*|sentence\s*\d+\s*[:\-]?\s*|scene\s*\d+\s*[:\-]?\s*)/i, '').trim();
}

/**
 * Robust parser for Chinese learning text with smart topic/environment auto-detection.
 */
export function parseInputText(rawText: string): Sentence[] {
  if (!rawText || !rawText.trim()) {
    return [];
  }

  const sentences: Sentence[] = [];
  let currentEnvironment = 'coffee_shop';

  const rawParagraphs = rawText.split(/\n\s*\n/);
  const blocks: string[][] = [];

  for (const para of rawParagraphs) {
    const lines = para
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (lines.length > 0) {
      blocks.push(lines);
    }
  }

  for (let bIndex = 0; bIndex < blocks.length; bIndex++) {
    const block = blocks[bIndex];
    let hanzi = '';
    let pinyin = '';
    let english = '';

    for (const rawLine of block) {
      const env = parseEnvironmentTag(rawLine);
      if (env) {
        currentEnvironment = env;
        continue;
      }

      const line = stripPrefixNumbering(rawLine);
      if (!hanzi && isHanziLine(line)) {
        hanzi = line;
      } else if (!pinyin && isPinyinLine(line)) {
        pinyin = line;
      } else if (!english && !isHanziLine(line)) {
        english = line;
      } else if (!english) {
        english = line;
      }
    }

    // Auto-detect environment/topic from sentence text if no explicit tag was set in this block
    const detectedEnv = detectTopicEnvironment(hanzi + ' ' + english);
    const sceneEnv = detectedEnv || currentEnvironment;

    if (hanzi || pinyin || english) {
      sentences.push({
        id: `s_${Date.now()}_${bIndex}_${Math.random().toString(36).substring(2, 6)}`,
        hanzi: hanzi || '',
        pinyin: pinyin || '',
        english: english || '',
        environment: sceneEnv,
      });
    }
  }

  return sentences;
}
