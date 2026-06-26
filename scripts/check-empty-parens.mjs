import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '..', 'data');
const songs = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'songs.json'), 'utf-8'));

let count = 0;
for (const s of songs) {
  for (const f of ['description', 'lyrics']) {
    if (s[f] && s[f].includes('（）')) {
      count++;
      const idx = s[f].indexOf('（）');
      console.log(`[${s.slug}] ${f}: ...${s[f].substring(Math.max(0, idx - 15), idx + 12)}...`);
    }
  }
}
console.log(`\nTotal empty （） found: ${count}`);
