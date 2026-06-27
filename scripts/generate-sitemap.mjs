import { readFileSync, writeFileSync } from 'fs';

const SITE_URL = 'https://fayewong-web.edgeone.app';

// 读取数据
const songs = JSON.parse(readFileSync('data/songs.json', 'utf-8'));
const albums = JSON.parse(readFileSync('data/albums.json', 'utf-8'));
const timeline = JSON.parse(readFileSync('data/timeline.json', 'utf-8'));

const urls = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/search', priority: '0.6', changefreq: 'monthly' },
  { loc: '/about', priority: '0.4', changefreq: 'monthly' },
  { loc: '/magazine', priority: '0.7', changefreq: 'monthly' },
  { loc: '/stats', priority: '0.5', changefreq: 'monthly' },
];

// 年份页
for (const entry of timeline) {
  urls.push({ loc: `/year/${entry.year}`, priority: '0.7', changefreq: 'monthly' });
}

// 专辑页
for (const album of albums) {
  urls.push({ loc: `/album/${album.slug}`, priority: '0.8', changefreq: 'monthly' });
}

// 歌曲页
for (const song of songs) {
  urls.push({ loc: `/song/${song.slug}`, priority: '0.8', changefreq: 'monthly' });
}

// 索引页
for (const cat of ['songs', 'composer', 'lyricist', 'arrangement', 'feating']) {
  urls.push({ loc: `/index/${cat}`, priority: '0.6', changefreq: 'monthly' });
}

const today = new Date().toISOString().split('T')[0];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${SITE_URL}${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

writeFileSync('public/sitemap.xml', xml);
console.log(`Generated sitemap.xml with ${urls.length} URLs`);
