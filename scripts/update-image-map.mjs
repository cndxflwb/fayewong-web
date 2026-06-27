/**
 * 更新 image-map.json，将所有图片映射指向 .webp 文件
 * 用法: node scripts/update-image-map.mjs
 */

import { readFile, writeFile, readdir } from 'fs/promises';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const IMAGE_MAP_PATH = join(ROOT, 'data', 'image-map.json');
const IMAGES_DIR = join(ROOT, 'public', 'images');

async function main() {
  // 读取当前目录中实际存在的文件
  const existingFiles = new Set(await readdir(IMAGES_DIR));

  // 读取当前 image-map.json
  const rawMap = JSON.parse(await readFile(IMAGE_MAP_PATH, 'utf-8'));

  const newMap = {};
  let updated = 0;
  let unchanged = 0;

  for (const [key, value] of Object.entries(rawMap)) {
    const nameWithoutExt = basename(value, extname(value));
    const webpName = `${nameWithoutExt}.webp`;

    if (existingFiles.has(webpName)) {
      newMap[key] = webpName;
      if (value !== webpName) updated++;
      else unchanged++;
    } else if (existingFiles.has(value)) {
      // WebP 不存在，保留原映射
      newMap[key] = value;
      unchanged++;
    } else {
      // 原文件也不存在，保留原映射
      newMap[key] = value;
      unchanged++;
      console.warn(`   ⚠ 文件不存在: ${value}`);
    }
  }

  // 写回 image-map.json
  await writeFile(IMAGE_MAP_PATH, JSON.stringify(newMap, null, 2) + '\n', 'utf-8');

  console.log(`\n📋 image-map.json 已更新`);
  console.log(`   更新: ${updated} 条`);
  console.log(`   未变: ${unchanged} 条`);
  console.log();
}

main().catch(err => {
  console.error('更新失败:', err);
  process.exit(1);
});
