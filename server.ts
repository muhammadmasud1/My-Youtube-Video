import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { Sentence, VideoSettings, RenderProgressUpdate, VideoJobResult } from './server/types.ts';
import { ttsService } from './server/tts.ts';
import { generateFullVideo, renderSceneFrame, registerSystemFonts } from './server/videoRenderer.ts';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT || '3000', 10);

const app = express();
app.use(express.json({ limit: '20mb' }));

// Ensure directories exist
const OUTPUT_DIR = path.resolve('./public/outputs');
const TEMP_DIR = path.resolve('./temp');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

// Dedicated video streaming route with HTTP 206 Range support
app.get('/outputs/:filename', (req: Request, res: Response) => {
  const safeFilename = path.basename(req.params.filename);
  const filePath = path.join(OUTPUT_DIR, safeFilename);

  if (!fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'text/plain');
    return res.status(404).send('Video file not found or expired');
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    if (isNaN(start) || isNaN(end) || start >= fileSize || end >= fileSize) {
      res.setHeader('Content-Range', `bytes */${fileSize}`);
      return res.status(416).end();
    }
    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Accept-Ranges': 'bytes',
      'Content-Type': 'video/mp4',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

app.all('/outputs/*', (req: Request, res: Response) => {
  res.status(404).type('text/plain').send('Video not found');
});

// In-memory job tracker
interface ActiveJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: RenderProgressUpdate;
  result?: VideoJobResult;
  error?: string;
  clients: Response[];
}

const activeJobs = new Map<string, ActiveJob>();

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    tts: ttsService.name,
    timestamp: new Date().toISOString(),
  });
});

// 2. TTS preview endpoint
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, lang, speed, slow } = req.body;
    if (!text || !lang) {
      return res.status(400).json({ error: 'Text and language are required' });
    }

    const audioBuffer = await ttsService.generateAudio(text, lang, {
      speed: speed || 1.0,
      slow: slow === true || (speed !== undefined && speed <= 0.85),
    });
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(audioBuffer);
  } catch (err: any) {
    console.error('TTS error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate voice-over' });
  }
});

// 3. Render frame preview endpoint
app.post('/api/render-preview-frame', async (req: Request, res: Response) => {
  try {
    const { sentence, settings, sentenceIndex, totalSentences, hideEnglish } = req.body;
    if (!sentence || !settings) {
      return res.status(400).json({ error: 'Sentence and settings are required' });
    }

    const pngBuffer = await renderSceneFrame(
      sentence,
      settings,
      sentenceIndex || 0,
      totalSentences || 1,
      { hideEnglish: !!hideEnglish }
    );

    res.setHeader('Content-Type', 'image/png');
    res.send(pngBuffer);
  } catch (err: any) {
    console.error('Frame render preview error:', err);
    res.status(500).json({ error: err.message || 'Failed to render preview frame' });
  }
});

// 4. Start video generation job
app.post('/api/generate-video', async (req: Request, res: Response) => {
  try {
    const { sentences, settings } = req.body as { sentences: Sentence[]; settings: VideoSettings };

    if (!sentences || !Array.isArray(sentences) || sentences.length === 0) {
      return res.status(400).json({ error: 'At least one sentence is required' });
    }

    const validSentences: Sentence[] = sentences
      .filter((s) => s && ((s.hanzi && s.hanzi.trim().length > 0) || (s.english && s.english.trim().length > 0)))
      .map((s, idx) => ({
        id: s.id || `s_${idx}`,
        hanzi: (s.hanzi || '').trim() || '你好',
        pinyin: (s.pinyin || '').trim(),
        english: (s.english || '').trim() || (s.hanzi || '').trim(),
        environment: s.environment || 'coffee_shop',
      }));

    if (validSentences.length === 0) {
      return res.status(400).json({ error: 'Please provide at least one sentence with Chinese or English text' });
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const job: ActiveJob = {
      id: jobId,
      status: 'pending',
      progress: {
        stage: 'queued',
        percent: 0,
        message: 'Job received, starting renderer...',
      },
      clients: [],
    };

    activeJobs.set(jobId, job);

    (async () => {
      job.status = 'processing';
      try {
        const result = await generateFullVideo(validSentences, settings, (progress) => {
          job.progress = progress;
          for (const client of job.clients) {
            client.write(`data: ${JSON.stringify({ type: 'progress', progress })}\n\n`);
          }
        });

        job.status = 'completed';
        job.result = result;

        for (const client of job.clients) {
          client.write(`data: ${JSON.stringify({ type: 'completed', result })}\n\n`);
          client.end();
        }
      } catch (err: any) {
        console.error('Video generation failed for job', jobId, err);
        job.status = 'failed';
        job.error = err.message || 'Video generation failed';

        for (const client of job.clients) {
          client.write(`data: ${JSON.stringify({ type: 'failed', error: job.error })}\n\n`);
          client.end();
        }
      }
    })();

    res.json({
      jobId,
      status: 'started',
      message: 'Video generation started',
    });
  } catch (err: any) {
    console.error('Generate video error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// 5. Job progress polling endpoint
app.get('/api/job/:jobId', (req: Request, res: Response) => {
  const job = activeJobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json({
    id: job.id,
    status: job.status,
    progress: job.progress,
    result: job.result,
    error: job.error,
  });
});

// 6. Job progress SSE stream
app.get('/api/job/:jobId/stream', (req: Request, res: Response) => {
  const job = activeJobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ type: 'status', status: job.status, progress: job.progress, result: job.result, error: job.error })}\n\n`);

  if (job.status === 'completed' || job.status === 'failed') {
    res.end();
    return;
  }

  job.clients.push(res);

  req.on('close', () => {
    const idx = job.clients.indexOf(res);
    if (idx !== -1) {
      job.clients.splice(idx, 1);
    }
  });
});

// 7. Video download endpoint
app.get('/api/download/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;
  const filePath = path.join(OUTPUT_DIR, `${jobId}.mp4`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Video file not found or expired' });
  }

  const filename = `chinese_long_video_${new Date().toISOString().slice(0, 10)}.mp4`;
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'video/mp4');
  fs.createReadStream(filePath).pipe(res);
});

async function startServer() {
  registerSystemFonts();

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
