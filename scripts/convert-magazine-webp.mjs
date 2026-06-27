import { readdir, unlink, stat } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

const MAGAZINE_DIR = 'public/magazine-images';
const QUALITY = 75;

async function main() {
  const files = await readdir(MAGAZINE_DIR);
  const jpgFiles = files.filter(f => /\.(jpg|jpeg|png)$/i.test(f));

  console.log(`Found ${jpgFiles.length} images to convert...`);

  let totalOriginal = 0;
  let totalWebp = 0;
  let converted = 0;

  for (const file of jpgFiles) {
    const inputPath = join(MAGAZINE_DIR, file);
    const outputName = file.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    const outputPath = join(MAGAZINE_DIR, outputName);

    try {
      const originalStat = await stat(inputPath);
      totalOriginal += originalStat.size;

      await sharp(inputPath)
        .webp({ quality: QUALITY })
        .toFile(outputPath);

      const webpStat = await stat(outputPath);
      totalWebp += webpStat.size;

      // 删除原始文件
      await unlink(inputPath);
      converted++;

      if (converted % 50 === 0) {
        console.log(`  Converted ${converted}/${jpgFiles.length}...`);
      }
    } catch (err) {
      console.error(`  Error converting ${file}:`, err.message);
    }
  }

  const savedMB = ((totalOriginal - totalWebp) / 1024 / 1024).toFixed(1);
  const pct = ((1 - totalWebp / totalOriginal) * 100).toFixed(1);
  console.log(`\nDone! Converted ${converted} files.`);
  console.log(`Original: ${(totalOriginal / 1024 / 1024).toFixed(1)} MB`);
  console.log(`WebP:     ${(totalWebp / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Saved:    ${savedMB} MB (-${pct}%)`);
}

main().catch(console.error);
