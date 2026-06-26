import songsData from '../../data/songs.json';
import albumsData from '../../data/albums.json';
import timelineData from '../../data/timeline.json';
import indexData from '../../data/index.json';
import searchIndexData from '../../data/search-index.json';
import imageMapData from '../../data/image-map.json';

import type { Song, Album, TimelineEntry, SiteIndex, SearchItem } from '../types';

export const songs: Song[] = songsData as Song[];
export const albums: Album[] = albumsData as Album[];
export const timeline: TimelineEntry[] = timelineData as TimelineEntry[];
export const siteIndex: SiteIndex = indexData as SiteIndex;
export const searchIndex: SearchItem[] = searchIndexData as SearchItem[];
export const imageMap: Record<string, string> = imageMapData as Record<string, string>;

export function getSongBySlug(slug: string): Song | undefined {
  return songs.find(s => s.slug === slug);
}

export function getAlbumBySlug(slug: string): Album | undefined {
  return albums.find(a => a.slug === slug);
}

export function getSongsByAlbum(albumSlug: string): Song[] {
  return songs.filter(s => s.albumSlug === albumSlug);
}

export function getTimelineByYear(year: number): TimelineEntry | undefined {
  return timeline.find(t => t.year === year);
}

export function getImageUrl(filename: string): string {
  // Try exact match first
  if (imageMap[filename]) {
    return `/images/${imageMap[filename]}`;
  }
  // Try with common extensions
  for (const ext of ['.jpg', '.png', '.jpeg']) {
    if (imageMap[filename + ext]) {
      return `/images/${imageMap[filename + ext]}`;
    }
  }
  return `/images/${filename}.jpg`;
}

export function getAlbumsByYear(year: number): Album[] {
  return albums.filter(a => a.year === year);
}

export function getAlbumsContainingSong(songSlug: string, songTitle: string): Album[] {
  return albums.filter(album =>
    album.trackList.some(track =>
      track.songSlug === songSlug || track.title === songTitle
    )
  );
}

export function getTotalStats() {
  return {
    totalSongs: songs.length,
    totalAlbums: albums.filter(a => !(a as any).isSingleCollection).length,
    totalYears: timeline.length,
    yearRange: `${timeline[0]?.year}—${timeline[timeline.length - 1]?.year}`,
  };
}
