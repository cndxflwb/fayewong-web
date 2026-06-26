import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '..', 'data');
const albums = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'albums.json'), 'utf-8'));
const songs = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'songs.json'), 'utf-8'));

// Check albums with trackList
const withTracks = albums.filter(a => a.trackList && a.trackList.length > 0);
console.log('Albums with trackList:', withTracks.length, '/', albums.length);
if (withTracks.length > 0) {
  console.log('Example:', withTracks[0].title, JSON.stringify(withTracks[0].trackList.slice(0, 3)));
}

// Build: for each song title, find all albums whose trackList contains it
const songTitleToAlbums = {};
for (const album of albums) {
  if (!album.trackList) continue;
  for (const track of album.trackList) {
    const title = track.title;
    if (!songTitleToAlbums[title]) songTitleToAlbums[title] = [];
    songTitleToAlbums[title].push({ slug: album.slug, title: album.title, year: album.year });
  }
}

// Show songs that appear in multiple albums' trackLists
const multi = Object.entries(songTitleToAlbums).filter(([, albums]) => albums.length > 1);
console.log('\nSongs in multiple album trackLists:', multi.length);
multi.slice(0, 5).forEach(([title, als]) => {
  console.log(`  ${title}: ${als.map(a => a.title).join(', ')}`);
});

// Alternative: use album.songs field to find which albums contain a song slug
const songSlugToAlbums = {};
for (const album of albums) {
  for (const songSlug of album.songs) {
    if (!songSlugToAlbums[songSlug]) songSlugToAlbums[songSlug] = [];
    songSlugToAlbums[songSlug].push({ slug: album.slug, title: album.title });
  }
}
const multiSlug = Object.entries(songSlugToAlbums).filter(([, als]) => als.length > 1);
console.log('\nSong slugs in multiple albums:', multiSlug.length);
