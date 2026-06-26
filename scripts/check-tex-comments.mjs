import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '..', 'data');

const songs = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'songs.json'), 'utf-8'));

let issues = [];

for (const s of songs) {
  const fields = [
    { name: 'description', value: s.description },
    { name: 'lyrics', value: s.lyrics },
    ...s.notes.map((n, i) => ({ name: `notes[${i}]`, value: n })),
  ];

  for (const field of fields) {
    if (!field.value) continue;
    // Check for TeX comment lines (lines starting with % or containing %)
    const lines = field.value.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Lines that start with % or contain unescaped %
      if (line.match(/(?:^|[^\\])%/)) {
        issues.push({
          song: s.slug,
          field: field.name,
          lineNum: i + 1,
          content: line.trim().substring(0, 80),
        });
      }
    }
  }
}

console.log(`Found ${issues.length} TeX comment issues:`);
issues.forEach(issue => {
  console.log(`  [${issue.song}] ${issue.field} L${issue.lineNum}: ${issue.content}`);
});
