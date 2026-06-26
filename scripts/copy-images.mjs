/**
 * 图片资源处理脚本
 * 将源项目 images/ 目录中的图片复制到 public/images/
 * 并生成文件名映射表
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC_IMAGES = path.resolve(ROOT, '..', 'images');
const DEST_IMAGES = path.resolve(ROOT, 'public', 'images');
const DATA_DIR = path.resolve(ROOT, 'data');

// Ensure dest dir exists
if (!fs.existsSync(DEST_IMAGES)) fs.mkdirSync(DEST_IMAGES, { recursive: true });

const imageMap = {};
const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

// Read all files in images directory
const files = fs.readdirSync(SRC_IMAGES);
let copied = 0;

for (const file of files) {
  const ext = path.extname(file).toLowerCase();
  if (!extensions.includes(ext)) continue;

  const srcPath = path.join(SRC_IMAGES, file);
  const destPath = path.join(DEST_IMAGES, file);

  // Copy file
  fs.copyFileSync(srcPath, destPath);
  copied++;

  // Map filename without extension to full filename
  const baseName = path.basename(file, ext);
  imageMap[baseName] = file;
}

// Write image map
fs.writeFileSync(
  path.join(DATA_DIR, 'image-map.json'),
  JSON.stringify(imageMap, null, 2),
  'utf-8'
);

console.log(`✅ 图片复制完成！共 ${copied} 张图片`);
console.log(`   映射表已写入 data/image-map.json`);
