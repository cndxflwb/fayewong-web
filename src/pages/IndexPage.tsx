import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Music, PenTool, Headphones, User, ArrowDownAZ, ArrowDown01 } from 'lucide-react';
import { siteIndex } from '../lib/data';
import type { IndexEntry } from '../types';

type SortMode = 'alpha' | 'count';

const categories = [
  { key: 'songs', label: '歌曲', icon: Music },
  { key: 'composers', label: '作曲', icon: Music },
  { key: 'lyricists', label: '作詞', icon: PenTool },
  { key: 'arrangers', label: '編曲', icon: Headphones },
  { key: 'artists', label: '合作歌手', icon: User },
];

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');

function getCategoryData(category: string): IndexEntry[] {
  switch (category) {
    case 'songs': return siteIndex.music;
    case 'composers': return siteIndex.composer;
    case 'lyricists': return siteIndex.lyricist;
    case 'arrangers': return siteIndex.arrangement;
    case 'artists': return siteIndex.feating;
    default: return siteIndex.music;
  }
}

export default function IndexPage() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const currentCategory = category || 'songs';
  const data = getCategoryData(currentCategory);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('alpha');
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  const toggleExpand = (slug: string) => {
    setExpandedEntries(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  // Get available letters for current data
  const availableLetters = useMemo(() => {
    const letters = new Set(data.map(entry => entry.initial || '#'));
    return LETTERS.filter(l => letters.has(l));
  }, [data]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let result = activeLetter
      ? data.filter(entry => (entry.initial || '#') === activeLetter)
      : [...data];
    if (sortMode === 'count') {
      result = [...result].sort((a, b) => b.songs.length - a.songs.length);
    }
    return result;
  }, [data, activeLetter, sortMode]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold font-serif text-text mb-8">索引</h1>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-primary/10 pb-4">
        {categories.map(cat => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.key}
              onClick={() => { navigate(`/index/${cat.key}`); setActiveLetter(null); }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                currentCategory === cat.key
                  ? 'bg-primary/20 text-primary'
                  : 'text-text-muted hover:text-text hover:bg-bg-secondary/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Letter Filter */}
      <div className="flex flex-wrap gap-1 mb-8 sticky top-16 z-20 bg-bg/95 backdrop-blur-sm py-3 -mx-4 px-4 border-b border-primary/5">
        <button
          onClick={() => setActiveLetter(null)}
          className={`w-8 h-8 rounded text-xs font-bold transition-colors cursor-pointer ${
            activeLetter === null
              ? 'bg-primary text-bg-dark'
              : 'bg-bg-secondary/50 text-text-muted hover:text-primary hover:bg-primary/10'
          }`}
        >
          全
        </button>
        {LETTERS.map(letter => {
          const isAvailable = availableLetters.includes(letter);
          return (
            <button
              key={letter}
              onClick={() => isAvailable && setActiveLetter(letter)}
              disabled={!isAvailable}
              className={`w-8 h-8 rounded text-xs font-bold transition-colors cursor-pointer ${
                activeLetter === letter
                  ? 'bg-primary text-bg-dark'
                  : isAvailable
                    ? 'bg-bg-secondary/50 text-text-secondary hover:text-primary hover:bg-primary/10'
                    : 'bg-bg-secondary/20 text-text-muted/30 cursor-not-allowed'
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* Sort Toggle (for non-song categories) */}
      {currentCategory !== 'songs' && (
        <div className="flex items-center justify-end mb-4">
          <div className="inline-flex items-center bg-bg-secondary/50 rounded-lg p-0.5">
            <button
              onClick={() => setSortMode('alpha')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                sortMode === 'alpha'
                  ? 'bg-primary/20 text-primary'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              <ArrowDownAZ className="w-3.5 h-3.5" />
              按拼音
            </button>
            <button
              onClick={() => setSortMode('count')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                sortMode === 'count'
                  ? 'bg-primary/20 text-primary'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              <ArrowDown01 className="w-3.5 h-3.5" />
              按數量
            </button>
          </div>
        </div>
      )}

      {/* Index Content */}
      {currentCategory === 'songs' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredData.map(entry => (
            <Link
              key={entry.slug}
              to={`/song/${entry.songs[0]?.slug || ''}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-bg-secondary/50 transition-colors group"
            >
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-primary">{entry.initial}</span>
              </div>
              <span className="text-sm text-text group-hover:text-primary transition-colors truncate">
                {entry.name}
              </span>
              {entry.songs.length > 1 && (
                <span className="text-xs text-text-muted ml-auto">×{entry.songs.length}</span>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredData.map(entry => (
            <div
              key={entry.slug}
              className="bg-bg-secondary/30 border border-primary/5 rounded-xl p-4 hover:border-primary/15 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-text">
                  <span className="text-xs text-primary mr-2">{entry.initial}</span>
                  {entry.name}
                </h3>
                <span className="text-xs text-text-muted bg-bg-dark px-2 py-0.5 rounded-full">
                  {entry.songs.length} 首
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(expandedEntries.has(entry.slug) ? entry.songs : entry.songs.slice(0, 8)).map((song, i) => (
                  <Link
                    key={`${song.slug}-${i}`}
                    to={`/song/${song.slug}`}
                    className="text-xs px-2 py-1 rounded bg-bg-dark/50 text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    {song.title}
                    <span className="text-text-muted ml-1">({song.year})</span>
                  </Link>
                ))}
                {entry.songs.length > 8 && (
                  <button
                    onClick={() => toggleExpand(entry.slug)}
                    className="text-xs px-2 py-1 text-primary hover:text-primary-light hover:bg-primary/10 rounded transition-colors cursor-pointer"
                  >
                    {expandedEntries.has(entry.slug) ? '收起' : `+${entry.songs.length - 8} 更多`}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="mt-12 pt-8 border-t border-primary/10 text-center">
        <p className="text-sm text-text-muted">
          {activeLetter ? `「${activeLetter}」` : '共'} {filteredData.length} 條索引記錄
        </p>
      </div>
    </div>
  );
}
