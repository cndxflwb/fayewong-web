export interface ImageRef {
  filename: string;
  caption: string;
  label: string;
}

export interface ExternalLink {
  url: string;
  text: string;
}

export interface CrossRef {
  type: 'section' | 'chapter' | 'figure';
  target: string;
  slug: string;
}

export interface ProductionCredit {
  role: string;
  name: string;
}

export interface Song {
  id: string;
  slug: string;
  title: string;
  aliases: string[];
  year: number;
  albumSlug: string | null;
  albumTitle: string | null;
  composer: string[];
  lyricist: string[];
  arranger: string[];
  producer: string[];
  featuring: string[];
  duration: string | null;
  description: string;
  lyrics: string;
  images: ImageRef[];
  notes: string[];
  links: ExternalLink[];
  crossRefs: CrossRef[];
  copyright: string | null;
  production: ProductionCredit[];
}

export interface TrackListItem {
  number: number;
  title: string;
  side?: string;
  songSlug?: string;
}

export interface Album {
  id: string;
  slug: string;
  title: string;
  year: number;
  catalogNumber: string | null;
  publisher: string | null;
  distributor: string | null;
  releaseDate: string | null;
  crew: Record<string, string>;
  description: string;
  trackList: TrackListItem[];
  versions: string[];
  songs: string[];
  images: ImageRef[];
}

export interface TimelineEntry {
  year: number;
  albums: { slug: string; title: string; coverImage: string | null }[];
  singles: { slug: string; title: string }[];
  songCount: number;
}

export interface IndexEntry {
  name: string;
  slug: string;
  initial: string;
  songs: { title: string; slug: string; year: number }[];
}

export interface SiteIndex {
  music: IndexEntry[];
  composer: IndexEntry[];
  lyricist: IndexEntry[];
  arrangement: IndexEntry[];
  feating: IndexEntry[];
}

export interface SearchItem {
  type: 'song' | 'album' | 'person';
  title: string;
  slug: string;
  year?: number;
  album?: string;
  excerpt?: string;
}
