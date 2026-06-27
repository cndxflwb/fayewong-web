/**
 * 批量将 public/images/ 下的 JPG/PNG 转换为 WebP
 * 用法: node scripts/convert-to-webp.mjs [--quality 80] [--keep-original]
 */

import { readdir, stat, unlink } from 'fs/promises';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const IMAGES_DIR = join(__dirname, '..', 'public', 'images');

// 解析参数
const args = process.argv.slice(2);
const quality = parseInt(args.find((_, i, a) => a[i - 1] === '--quality') || '80');
const keepOriginal = args.includes('--keep-original');

const SUPPORTED_EXTS = ['.jpg', '.jpeg', '.png'];

async function main() {
  console.log(`\n🖼️  图片转 WebP 工具`);
  console.log(`   目录: ${IMAGES_DIR}`);
  console.log(`   质量: ${quality}`);
  console.log(`   保留原图: ${keepOriginal ? '是' : '否'}\n`);

  const files = await readdir(IMAGES_DIR);
  const imageFiles = files.filter(f => SUPPORTED_EXTS.includes(extname(f).toLowerCase()));

  console.log(`   找到 ${imageFiles.length} 张图片待转换\n`);

  let totalOriginalSize = 0;
  let totalWebpSize = 0;
  let converted = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of imageFiles) {
    const inputPath = join(IMAGES_DIR, file);
    const nameWithoutExt = basename(file, extname(file));
    const outputPath = join(IMAGES_DIR, `${nameWithoutExt}.webp`);

    try {
      const originalStat = await stat(inputPath);
      totalOriginalSize += originalStat.size;

      // 如果 webp 已存在且比原图新，跳过
      try {
        const webpStat = await stat(outputPath);
        if (webpStat.mtimeMs > originalStat.mtimeMs) {
          totalWebpSize += webpStat.size;
          skipped++;
          continue;
        }
      } catch { /* webp 不存在，继续转换 */ }

      await sharp(inputPath)
        .webp({ quality, effort: 4 })
        .toFile(outputPath);

      const webpStat = await stat(outputPath);
      totalWebpSize += webpStat.size;

      const savings = ((1 - webpStat.size / originalStat.size) * 100).toFixed(1);
      console.log(`   ✓ ${file} → .webp (${formatSize(originalStat.size)} → ${formatSize(webpStat.size)}, -${savings}%)`);

      // 删除原图
      if (!keepOriginal) {
        await unlink(inputPath);
      }

      converted++;
    } catch (err) {
      console.error(`   ✗ ${file}: ${err.message}`);
      errors++;
    }
  }

  const totalSavings = totalOriginalSize > 0
    ? ((1 - totalWebpSize / totalOriginalSize) * 100).toFixed(1)
    : '0';

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`   转换完成！`);
  console.log(`   转换: ${converted} 张 | 跳过: ${skipped} 张 | 失败: ${errors} 张`);
  console.log(`   原始总大小: ${formatSize(totalOriginalSize)}`);
  console.log(`   WebP 总大小: ${formatSize(totalWebpSize)}`);
  console.log(`   节省空间: ${formatSize(totalOriginalSize - totalWebpSize)} (-${totalSavings}%)`);
  console.log();
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

main().catch(err => {
  console.error('转换失败:', err);
  process.exit(1);
});
