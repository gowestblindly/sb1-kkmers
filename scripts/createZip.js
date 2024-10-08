import { createWriteStream } from 'fs';
import { resolve } from 'path';
import archiver from 'archiver';

function zipDirectory(sourceDir, outPath) {
  const archive = archiver('zip', { zlib: { level: 9 }});
  const stream = createWriteStream(outPath);

  return new Promise((resolve, reject) => {
    archive
      .directory(sourceDir, false)
      .on('error', err => reject(err))
      .pipe(stream);

    stream.on('close', () => resolve());
    archive.finalize();
  });
}

const sourceDir = resolve(process.cwd(), 'dist');
const outPath = resolve(process.cwd(), 'extension.zip');

zipDirectory(sourceDir, outPath)
  .then(() => console.log('Extension successfully zipped!'))
  .catch(err => console.error('Error zipping extension:', err));