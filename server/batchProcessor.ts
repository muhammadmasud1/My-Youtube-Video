import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface RenderSceneContext {
  sceneIndex: number;
  jobDir: string;
}

export interface BatchRenderSceneResult {
  sceneIndex: number;
  videoPath: string;
}

export async function processBatchesAndJoin(
  items: Array<{ render: () => Promise<string> }>,
  concurrency: number,
  outputVideoPath: string,
  tempDir: string
): Promise<void> {
  const sceneVideoPaths: string[] = [];
  const results: string[] = new Array(items.length);

  // Run in chunks of `concurrency`
  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);
    const chunkPromises = chunk.map((item, relIndex) => {
      const absIndex = i + relIndex;
      return item.render().then((vPath) => {
        results[absIndex] = vPath;
      });
    });
    await Promise.all(chunkPromises);
  }

  // Create concat file for FFmpeg
  const concatListPath = path.join(tempDir, 'concat_list.txt');
  const fileLines = results.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join('\n');
  fs.writeFileSync(concatListPath, fileLines, 'utf-8');

  // Concatenate without re-encoding
  await execAsync(
    `ffmpeg -y -f concat -safe 0 -i "${concatListPath}" -c copy "${outputVideoPath}"`
  );
}
