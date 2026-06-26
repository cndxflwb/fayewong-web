import Fuse from 'fuse.js';
import { searchIndex } from './data';
import type { SearchItem } from '../types';

const fuse = new Fuse(searchIndex, {
  keys: [
    { name: 'title', weight: 2 },
    { name: 'excerpt', weight: 1 },
    { name: 'album', weight: 0.5 },
  ],
  threshold: 0.3,
  includeScore: true,
  minMatchCharLength: 1,
});

export function search(query: string): SearchItem[] {
  if (!query.trim()) return [];
  const results = fuse.search(query, { limit: 50 });
  return results.map(r => r.item);
}
